// Initialize Stripe safely - use a dummy key if missing to prevent crash on require
const safeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_cIaireAI_integration';
const stripe = require('stripe')(safeKey);

/**
 * Creates a Stripe Checkout Session for the setup fee.
 */
async function createPaymentLink(firmName, amount, dealId) {
    const isPlaceholder = !process.env.STRIPE_SECRET_KEY ||
        process.env.STRIPE_SECRET_KEY === 'your_stripe_key' ||
        process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isPlaceholder) {
        console.warn(`[Stripe] SIMULATION: Created mock link for ${firmName}`);
        return `https://checkout.stripe.com/pay/mock_${dealId}_cIaireai`;
    }

    // Plan Mapping (Generated via stripe_sync.js)
    const PLANS = {
        650: 'price_1SsTZe9vzmXGIElUEMFmo5K8',   // Starter
        1250: 'price_1SsTZf9vzmXGIElULER2nuHY',  // Growth
        3000: 'price_1SsTZg9vzmXGIElUAIkpB50V'   // Enterprise
    };

    try {
        const priceId = PLANS[amount];
        let sessionConfig;

        if (priceId) {
            // SUBSCRIPTION MODE (Using Product)
            console.log(`[Stripe] Matched Plan for $${amount}: ${priceId} (Subscription Mode)`);
            sessionConfig = {
                payment_method_types: ['card'],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: 'subscription', // Auto-bills monthly
                success_url: 'https://theclaireai.com/onboarding/success',
                cancel_url: 'https://theclaireai.com/onboarding/cancel',
                client_reference_id: dealId,
            };
        } else {
            // ONE-OFF MODE (Custom Amount)
            console.log(`[Stripe] No Plan matched for $${amount}. Using Custom One-Time Charge.`);
            sessionConfig = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `ClaireAI Setup - ${firmName}`,
                                description: 'Professional Setup & Configuration of ClaireAI Receptionist. Includes: Voice Humanization Tuning, Knowledge Base Ingestion, CRM Integration (Zoho/HubSpot/Clio), Custom Call Routing Logic Design, and After-Hours Workflow Automation.',
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment', // One-time
                success_url: 'https://theclaireai.com/onboarding/success',
                cancel_url: 'https://theclaireai.com/onboarding/cancel',
                client_reference_id: dealId,
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log(`[Stripe] Created Payment Session for ${firmName}: ${session.url}`);
        return session.url;
    } catch (error) {
        console.error('[Stripe] Error creating payment link:', error.message);
        return `https://checkout.stripe.com/pay/fallback_${dealId}`;
    }
}

module.exports = { createPaymentLink };
