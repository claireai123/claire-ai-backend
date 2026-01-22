require('dotenv').config({ path: './ClaireOAutomations/.env' });
const { sendInvoiceEmail } = require('./services/zohoService');
const { generateInvoicePDF } = require('./services/documentService');

// Mock Data
const DEAL_ID = '7203613000000746002'; // The "Enterprise Test" deal we created
const EMAIL = 'tiago@theclaireai.com';
const INVOICE = {
    id: 'INV-DEBUG-001',
    amount: 650,
    description: 'Debug Invoice Item'
};

async function runDebug() {
    console.log('--- STARTING EMAIL DEBUG ---');

    // 1. Generate PDF
    console.log('1. Generating PDF...');
    try {
        const pdfPath = await generateInvoicePDF(INVOICE, "Debug Firm", "http://google.com");
        console.log('   PDF Path:', pdfPath);

        // 2. Send Email
        console.log('2. Sending Email via Zoho...');
        const result = await sendInvoiceEmail(DEAL_ID, EMAIL, INVOICE, "Debug Firm", pdfPath, "http://google.com");

        console.log('--- RESULT ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('--- CRITICAL FAILURE ---');
        console.error(error);
    }
}

runDebug();
