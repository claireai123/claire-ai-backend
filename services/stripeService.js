const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `ClaireAI Setup & Implementation - ${firmName}`,
                            description: 'Initial calibration, persona engineering, and CRM integration.',
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://theclaireai.com/onboarding/success',
            cancel_url: 'https://theclaireai.com/onboarding/cancel',
            client_reference_id: dealId,
        });

        console.log(`[Stripe] Created Payment Session for ${firmName}: ${session.url}`);
        return session.url;
    } catch (error) {
        console.error('[Stripe] Error creating payment link:', error.message);
        return `https://checkout.stripe.com/pay/fallback_${dealId}`;
    }
}

module.exports = { createPaymentLink };
