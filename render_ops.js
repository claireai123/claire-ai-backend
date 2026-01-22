require('dotenv').config({ path: '.env.render' });
const axios = require('axios');

const RENDER_API_KEY = process.env.RENDER_API_KEY || process.argv[2]; // Pass as Env Var or 1st Arg
const BASE_URL = 'https://api.render.com/v1';

if (!RENDER_API_KEY) {
    console.error('Error: RENDER_API_KEY is required.');
    console.error('Usage: node render_ops.js <YOUR_API_KEY> <ACTION>');
    process.exit(1);
}

const ACTION = process.argv[3] || 'check'; // 'check' | 'logs' | 'restart'

async function getServices() {
    try {
        const response = await axios.get(`${BASE_URL}/services?limit=20`, {
            headers: { 'Authorization': `Bearer ${RENDER_API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to list services:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function getDeployments(serviceId) {
    try {
        const response = await axios.get(`${BASE_URL}/services/${serviceId}/deploys?limit=1`, {
            headers: { 'Authorization': `Bearer ${RENDER_API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get deployments:', error.message);
        return [];
    }
}

async function getDeployLogs(serviceId, deployId) {
    console.log(`Fetching logs for Deploy ID: ${deployId}...`);
    try {
        // Correct Endpoint: /services/{serviceId}/deploys/{deployId}/logs
        // BUT Render API actually keeps logs at service level stream OR deploy level.
        // Let's try the deploy stream which is more reliable for "startup" errors.
        const response = await axios.get(`${BASE_URL}/services/${serviceId}/deploys/${deployId}/logs?limit=100`, {
            headers: { 'Authorization': `Bearer ${RENDER_API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get deploy logs:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function main() {
    console.log(`--- RENDER OPS: ${ACTION.toUpperCase()} ---`);

    // 1. Find the Service
    const services = await getServices();
    const service = services.find(s => s.service.name.includes('claire-ai') || s.service.repo.includes('claire-ai'));

    if (!service) {
        console.error('Could not find a service named "claire-ai". Available services:', services.map(s => s.service.name));
        return;
    }

    const serviceId = service.service.id;
    console.log(`Target Service: ${service.service.name} (${serviceId})`);
    console.log(`Status: ${service.service.serviceDetails.status || 'Unknown'}`);
    console.log(`Last Deployed: ${service.service.updatedAt}`);

    // 2. Perform Action
    if (ACTION === 'logs') {
        const deploys = await getDeployments(serviceId);
        if (!deploys || deploys.length === 0) {
            console.error('No deployments found.');
            return;
        }
        const latestDeploy = deploys[0].deploy;
        console.log(`Latest Deploy: ${latestDeploy.id} (${latestDeploy.status})`);

        const logs = await getDeployLogs(serviceId, latestDeploy.id);
        console.log('\n--- LIVE LOGS ---');
        if (Array.isArray(logs)) {
            logs.forEach(log => {
                console.log(`[${log.timestamp}] ${log.message}`);
            });
        } else {
            console.log(JSON.stringify(logs, null, 2));
        }
    } else {
        console.log('Action complete (Default: Check Status).');
    }
}

main();
