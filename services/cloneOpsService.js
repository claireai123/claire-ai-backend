const axios = require('axios');

// Template Mapping
const TEMPLATES = {
    'Gatekeeper': 'legal_strict_v1',
    'Concierge': 'legal_empathy_v1'
};

const CLONEOPS_API_KEY = process.env.CLONEOPS_API_KEY;
const CLONEOPS_API_URL = process.env.CLONEOPS_API_URL || 'https://api.cloneops.com/v1'; // Placeholder URL

/**
 * Provisions a new agent via CloneOps API.
 * @param {Object} agentData - The parsed data from HubSpot
 * @returns {Promise<Object>} - The response from CloneOps API
 */
async function provisionAgent(agentData) {
    const { firm_name, practice_area, transfer_number, agent_archetype } = agentData;

    const templateId = TEMPLATES[agent_archetype];

    if (!templateId) {
        throw new Error(`Unknown agent archetype: ${agent_archetype}`);
    }

    const payload = {
        name: `${firm_name} - ${agent_archetype} Agent`,
        template_id: templateId,
        config: {
            practice_area,
            transfer_number
        }
    };

    console.log(`[CloneOps] Provisioning agent: ${JSON.stringify(payload, null, 2)}`);

    if (!CLONEOPS_API_KEY || CLONEOPS_API_KEY === 'your_cloneops_key') {
        console.warn('Skipping CloneOps API call: Missing or Placeholder CLONEOPS_API_KEY');
        return {
            status: 'mock_success',
            message: 'Agent provisioning simulated (no API key)',
            data: payload
        };
    }

    try {
        const response = await axios.post(`${CLONEOPS_API_URL}/agents`, payload, {
            headers: {
                'Authorization': `Bearer ${CLONEOPS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('CloneOps API Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { provisionAgent };
