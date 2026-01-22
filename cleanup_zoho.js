require('dotenv').config({ path: './ClaireOAutomations/.env' });
const { listRecentDeals, deleteDeal } = require('./services/zohoService');

// Keywords to PURGE
const TEST_KEYWORDS = ['Tiago', 'Test', 'Cloud', 'Probe', 'Check', 'Witness', 'Crash', 'Mock', 'Final', 'Match'];

async function purgeZoho() {
    console.log('--- ZOHO PURGE ---');
    // Fetch MORE deals to be safe
    const deals = await listRecentDeals();

    if (deals.length === 0) {
        console.log('CRM IS EMPTY.');
        return;
    }

    const dealsToDelete = deals.filter(d => {
        // SAFETY: Do NOT delete Sarah Litowich
        if (d.Deal_Name.toLowerCase().includes('sarah') || d.Deal_Name.toLowerCase().includes('litowich')) {
            console.log(`[SAFE] Skipping Protected Deal: ${d.Deal_Name}`);
            return false;
        }

        // Delete if matches keywords OR is just a generic "Test"
        return TEST_KEYWORDS.some(kw => d.Deal_Name.includes(kw));
    });

    if (dealsToDelete.length === 0) {
        console.log('No test deals found to delete.');
        return;
    }

    console.log(`\nDeleting ${dealsToDelete.length} Test Deals...`);
    for (const deal of dealsToDelete) {
        process.stdout.write(`Deleting ${deal.Deal_Name} (${deal.id})... `);
        await deleteDeal(deal.id);
    }
    console.log('\n--- PURGE COMPLETE ---');
}

purgeZoho();
