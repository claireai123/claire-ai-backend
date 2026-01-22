/**
 * Billing Service Skeleton
 * Handles invoice generation and link creation.
 * Future Integration: Stripe, QuickBooks, Xero.
 */

// Default Setup Fee for new firms
const SETUP_FEE_CENTS = 100000; // $1,000.00
const CURRENCY = 'USD';

/**
 * Creates an invoice for the onboarding setup fee.
 * @param {string} firmName - The name of the law firm.
 * @returns {Promise<Object>} - The invoice details including a payment link.
 */
async function createInvoice(firmName, amount) {
    console.log(`[Billing] Generating Invoice for ${firmName}...`);

    // Use passed amount or default to Growth Plan ($1,250)
    const finalAmount = amount || 1250;

    // SIMULATION: In a real app, this would call Stripe API
    const mockInodeId = 'inv_' + Math.floor(Math.random() * 100000);
    const mockUrl = `https://billing.theclaireai.com/pay/${mockInodeId}`;

    return {
        id: mockInodeId,
        amount: finalAmount, // Dynamic Amount
        currency: CURRENCY,
        status: 'draft', // Generated but not paid
        payment_link: mockUrl,
        description: `Onboarding & Implementation Fee for ${firmName}`
    };
}

module.exports = { createInvoice };
