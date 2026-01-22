require('dotenv').config({ path: './ClaireOAutomations/.env' });
const { listRecentDeals } = require('./services/zohoService');

async function auditZoho() {
    console.log('--- ZOHO DEAL MANIFEST ---');
    const deals = await listRecentDeals();

    if (deals.length === 0) {
        console.log('CRM IS EMPTY.');
    } else {
        deals.forEach(d => {
            console.log(`ID: ${d.id} | Name: ${d.Deal_Name} | Amount: $${d.Amount}`);
        });
    }
}

auditZoho();
