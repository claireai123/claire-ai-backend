require('dotenv').config({ path: './ClaireOAutomations/.env.stripe' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = [
    {
        name: 'Starter Plan',
        amount: 65000, // Cents
        description: '24/7 AI Receptionist - Starter Tier',
        features: ['24/7 Call Handling', 'Basic Lead Intake', 'Email Summaries']
    },
    {
        name: 'Growth Plan',
        amount: 125000,
        description: '24/7 AI Receptionist - Growth Tier',
        features: ['Everything in Starter', 'CRM Integration', 'Calendar Booking']
    },
    {
        name: 'Enterprise Plan',
        amount: 300000,
        description: '24/7 AI Receptionist - Enterprise Tier',
        features: ['Everything in Growth', 'Dedicated Account Manager', 'Custom Workflows']
    }
];

async function syncStripe() {
    console.log('--- STRIPE PRODUCT SYNC STARTED ---');

    for (const plan of PLANS) {
        console.log(`\nSyncing: ${plan.name}...`);

        // 1. Search for Product
        const products = await stripe.products.search({
            query: `name:'${plan.name}'`,
        });

        let productId;
        let product = products.data[0];

        if (product) {
            console.log(`Found existing Product: ${product.id}`);
            productId = product.id;
        } else {
            console.log('Creating new Product...');
            product = await stripe.products.create({
                name: plan.name,
                description: plan.description,
                metadata: { tier: 'subscription' }
            });
            productId = product.id;
            console.log(`Created Product: ${productId}`);
        }

        // 2. Search for Price
        const prices = await stripe.prices.list({
            product: productId,
            currency: 'usd',
            active: true
        });

        let price = prices.data.find(p => p.unit_amount === plan.amount && p.recurring?.interval === 'month');

        if (price) {
            console.log(`Found matching Price: ${price.id} ($${plan.amount / 100}/mo)`);
        } else {
            console.log('Creating new Price...');
            price = await stripe.prices.create({
                product: productId,
                unit_amount: plan.amount,
                currency: 'usd',
                recurring: { interval: 'month' },
                metadata: { tier_name: plan.name }
            });
            console.log(`Created Price: ${price.id}`);
        }
    }
    console.log('\n--- SYNC COMPLETE ---');
}

syncStripe();
