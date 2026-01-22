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

    // 2. Provision Agent (The Operations)
    const provisionResult = await provisionAgent(dna);

    // 2b. Update Zoho (The CRM)
    if (dna.id && !dna.id.startsWith('DEMO')) {
        await sendProvisioningUpdate(dna.id, dna.firm_name, dna.agent_archetype);
    } else {
        console.log('[Core] Skipping Zoho CRM update (Demo or No ID).');
    }

    // 3. Billing (The Finance) - Use Deal Amount or Default to Growth Plan
    const setupFee = dna.amount || 1250;
    const invoice = await createInvoice(dna.firm_name, setupFee);

    // 3b. Stripe Payment Link
    const paymentUrl = await createPaymentLink(dna.firm_name, setupFee, dna.id);

    // 4. Document Factory
    console.log('Generating Invoice with Logo & Payment Link...');
    const invoicePdfPath = await generateInvoicePDF(invoice, dna.firm_name, paymentUrl);
    // const contractPdfPath = await generateContract(dna.firm_name, dna.agent_archetype, paymentUrl); // Disabled per request

    // 5. Communications
    // A. Send the Bill first
    await sendInvoiceEmail(dna.id || 'DEMO', dna.client_email, invoice, dna.firm_name, invoicePdfPath, paymentUrl);

    // B. Send the Warm Welcome - DISABLED
    // await sendWelcomePacket(dna.id || 'DEMO', dna.client_email, dna.firm_name, dna.agent_archetype, contractPdfPath, paymentUrl);

    return {
        message: 'Professional Onboarding initiated',
        provisioning_id: provisionResult.id || 'mock-id',
        invoice_id: invoice.id,
        payment_url: paymentUrl
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

// 2. Intake Form (Direct Demo Trigger)
router.post('/intake', async (req, res) => {
    try {
        console.log('--- Client Intake Submitted (Demo) ---');
        const intakeData = req.body;
        console.log('Details:', intakeData);

        // Map Form Data -> DNA
        const dna = {
            id: 'DEMO-' + Date.now(), // Fake ID for demo
            firm_name: intakeData.firmName || 'Demo Firm',
            practice_area: intakeData.practiceDetails || 'General Practice',
            transfer_number: '+15550009999', // Default
            agent_archetype: 'Gatekeeper', // Default for now
            client_email: intakeData.email
        };

        if (!dna.client_email) {
            throw new Error('Email is required for the demo');
        }

        const result = await processOnboarding(dna);
        res.status(200).json(result);

    } catch (error) {
        console.error('Intake Processing Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
