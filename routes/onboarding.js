const express = require('express');
const router = express.Router();
const { parseCRMData } = require('../utils/dnaParser');
const { provisionAgent } = require('../services/cloneOpsService');
const { createInvoice } = require('../services/billingService');
const { sendInvoiceEmail, sendWelcomePacket, sendProvisioningUpdate } = require('../services/zohoService');
const { generateContract, generateInvoicePDF } = require('../services/documentService');
const { createPaymentLink } = require('../services/stripeService');

// --- CORE LOGIC ---
async function processOnboarding(dna) {
    console.log(`[Core] Processing Onboarding for: ${dna.firm_name}`);

    // 2. Provision Agent (REMOVED per user request)
    // const provisionResult = await provisionAgent(dna);
    console.log('[Core] CloneOps Provisioning skipped (Code Removed).');
    const provisionResult = { id: 'manual-provision' };

    // 2b. Update Zoho (The CRM)
    // 2b. Update Zoho (The CRM)
    // Skip for DEMO or CLOUD testing IDs
    if (dna.id && !dna.id.startsWith('DEMO') && !dna.id.startsWith('CLOUD')) {
        try {
            await sendProvisioningUpdate(dna.id, dna.firm_name, dna.agent_archetype);
        } catch (crmError) {
            console.error('[WARNING] Zoho Update Failed (Non-Fatal):', crmError.message);
            // Continue execution - don't block the invoice!
        }
    } else {
        console.log('[Core] Skipping Zoho CRM update (Demo/Cloud/No ID).');
    }

    // 3. Billing (The Finance) - Use Deal Amount or Default to Growth Plan
    const setupFee = dna.amount || 1250;
    const invoice = await createInvoice(dna.firm_name, setupFee);

    // 3b. Stripe Payment Link
    const paymentUrl = await createPaymentLink(dna.firm_name, setupFee, dna.id);

    // 4. Document Factory
    console.log('Generating Invoice with Logo & Payment Link...');
    let invoicePdfPath;
    try {
        invoicePdfPath = await generateInvoicePDF(invoice, dna.firm_name, paymentUrl);
    } catch (pdfError) {
        console.error('[CRITICAL] PDF Generation Failed:', pdfError.message);
        throw new Error(`PDF Generation Failed: ${pdfError.message}`);
    }

    // 5. Communications
    // A. Send the Bill first
    let emailResult;
    try {
        emailResult = await sendInvoiceEmail(dna.id || 'DEMO', dna.client_email, invoice, dna.firm_name, invoicePdfPath, paymentUrl);
    } catch (emailError) {
        console.error('[CRITICAL] Email Sending Failed:', emailError.message);
        // We don't throw here to allow response to return partial success if needed, 
        // but for now let's expose it.
        throw new Error(`Zoho Email Failed: ${emailError.message}`);
    }

    return {
        message: 'Professional Onboarding initiated',
        provisioning_id: provisionResult.id || 'mock-id',
        invoice_id: invoice.id,
        payment_url: paymentUrl,
        debug_pdf_path: invoicePdfPath,
        zoho_email_result: emailResult // Capture the raw response from Zoho
    };
}

// --- ROUTES ---

// 1. Webhook (from Zoho/HubSpot)
router.post('/webhook', async (req, res) => {
    try {
        console.log('--- New Onboarding Request (Webhook) ---');
        console.log('Received Payload:', JSON.stringify(req.body, null, 2));

        const dna = parseCRMData(req.body);
        const result = await processOnboarding(dna);

        res.status(200).json(result);
    } catch (error) {
        console.error('Onboarding Processing Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// [INTAKE ROUTE REMOVED PER USER REQUEST]

module.exports = router;
