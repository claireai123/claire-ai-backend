require('dotenv').config({ path: './ClaireOAutomations/.env' });
const { sendInvoiceEmail } = require('./services/zohoService');
const { generateInvoicePDF } = require('./services/documentService');
const path = require('path');

// Mock Data targeting the crash
const DEAL_ID = 'CLOUD-DEBUG-5K';
const EMAIL = 'tiago@theclaireai.com';
const INVOICE = {
    id: 'INV-CRASH-TEST',
    amount: 5000,
    description: 'Cloud Crash Test Item'
};

async function runCloudSim() {
    console.log('--- STARTING CLOUD CRASH SIM ---');

    // 1. Generate PDF (This worked in cloud, file sys is /tmp)
    console.log('1. Generating PDF at /tmp...');
    const pdfPath = await generateInvoicePDF(INVOICE, "ClaireAI Cloud Test", "http://google.com");
    console.log('   PDF Path:', pdfPath);

    // 2. Send Email (This is where it likely crashes)
    console.log('2. Sending Email via Zoho...');

    // Usage in route: 
    // await sendInvoiceEmail(dna.id || 'DEMO', dna.client_email, invoice, dna.firm_name, invoicePdfPath, paymentUrl);

    try {
        const result = await sendInvoiceEmail(DEAL_ID, EMAIL, INVOICE, "ClaireAI Cloud Test", pdfPath, "http://google.com");
        console.log('--- RESULT ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('--- CRITICAL FAILURE ---');
        console.error(error);
    }
}

runCloudSim();
