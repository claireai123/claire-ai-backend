require('dotenv').config({ path: './ClaireOAutomations/.env' });
const { listRecentDeals, deleteDeal } = require('./services/zohoService');

const TEST_KEYWORDS = ['Tiago', 'Test', 'Cloud', 'Probe', 'Check', 'Witness', 'Crash', 'Mock'];

async function cleanZoho() {
    console.log('--- ZOHO CLEANUP STARTED ---');
    console.log('Fetching recent deals...');

    const deals = await listRecentDeals();
    console.log(`Found ${deals.length} recent deals.`);

    const dealsToDelete = deals.filter(d => {
        const name = d.Deal_Name || '';
        return TEST_KEYWORDS.some(kw => name.includes(kw));
    });

    if (dealsToDelete.length === 0) {
        console.log('No test deals found.');
        return;
    }

    console.log(`Identified ${dealsToDelete.length} TEST DEALS to delete:`);
    dealsToDelete.forEach(d => console.log(`- [${d.id}] ${d.Deal_Name} ($${d.Amount})`));

    console.log('\nDeleting...');
    for (const deal of dealsToDelete) {
        await deleteDeal(deal.id);
    }

    console.log('--- CLEANUP COMPLETE ---');
}

cleanZoho();
