const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Design System
const COLORS = {
    PRIMARY: '#1a4332',    // Dark Forest Green (Institutional)
    SECONDARY: '#334155',  // Slate (Professional)
    ACCENT: '#22c55e',     // Success Green
    TEXT_MAIN: '#1e293b',
    TEXT_MUTED: '#64748b',
    BG_LIGHT: '#f8fafc',
    WHITE: '#ffffff'
};

const FONTS = {
    BOLD: 'Helvetica-Bold',
    REGULAR: 'Helvetica',
    MONO: 'Courier'
};

const LOGO_URL = 'https://res.cloudinary.com/dwzsqumf6/image/upload/v1765854323/logo_transparent_ec9ge1.png';
let logoBuffer = null;

// Ensure output directory exists
// Use /tmp for cloud compatibility (Render/Heroku/Lambda often restrict writing to app dir)
const OUTPUT_DIR = path.join('/tmp', 'documents');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Downloads the logo buffer once.
 */
async function getLogo() {
    if (logoBuffer) return logoBuffer;
    try {
        const response = await axios.get(LOGO_URL, { responseType: 'arraybuffer' });
        logoBuffer = Buffer.from(response.data, 'binary');
        return logoBuffer;
    } catch (error) {
        console.error('[Zoho] Failed to download logo:', error.message);
        return null;
    }
}

/**
 * Helper: Draws a rounded header/summary block
 */
function drawSummaryBlock(doc, title, amount, x, y, width, height) {
    // Background
    doc.fillColor(COLORS.PRIMARY)
        .rect(x, y, width, height)
        .fill();

    // Title
    doc.fillColor(COLORS.WHITE)
        .font(FONTS.BOLD)
        .fontSize(14)
        .text(title.toUpperCase(), x + 20, y + 20);

    // Amount Summary
    doc.fontSize(24)
        .text(`$${amount.toLocaleString()}`, x + width - 150, y + 20, { width: 130, align: 'right' });

    doc.fontSize(10)
        .font(FONTS.REGULAR)
        .text('TOTAL (USD)', x + width - 150, y + 50, { width: 130, align: 'right' });
}

/**
 * Generates an Institutional-Grade PDF Contract.
 */
async function generateContract(firmName, agentType, paymentUrl) {
    const logo = await getLogo();
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `Contract_${firmName.replace(/\s+/g, '_')}.pdf`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Header Branding
        if (logo) {
            doc.image(logo, 50, 40, { height: 50 });
        } else {
            doc.fillColor(COLORS.PRIMARY).font(FONTS.BOLD).fontSize(20).text('CLAIRE AI', 50, 50);
        }
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10).text('Institutional Grade Automation Hub', logo ? 160 : 50, 65, { align: 'right' });

        doc.moveTo(50, 95).lineTo(550, 95).strokeColor('#e2e8f0').lineWidth(1).stroke();

        // Main Title
        doc.moveDown(2);
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(22).text('Master Services Agreement');
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10).text(`Agreement ID: CAI-${Math.floor(Math.random() * 1000000)}`);

        // Summary Block
        doc.moveDown(2);
        const startY = doc.y;
        drawSummaryBlock(doc, 'Implementation & Calibration', 1250, 50, startY, 500, 80);

        // Details Section
        doc.y = startY + 100;
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(14).text('1. Engagement Overview');
        doc.moveDown(0.5);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(11).lineGap(4);
        doc.text(`This agreement constitutes a binding contract between TheClaireAI (the "Provider") and ${firmName} (the "Client").`);
        doc.text(`Provider agrees to provision and calibrate a ${agentType} AI Agent for the Client's operations.`);

        doc.moveDown();
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(12).text('1.1 Implementation Scope:');
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10);
        doc.list([
            'Full configuration of Personal Injury/Corporate intake logic.',
            'Zoho CRM deep integration.',
            'Initial Voice Prompt Engineering and Persona Creation.',
            'Telephony provisioning and Call Forwarding activation.'
        ], { bulletRadius: 2 });

        // Legal Terms
        doc.moveDown(1.5);
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(14).text('2. Financial Terms');
        doc.moveDown(0.5);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10);
        doc.text('Client agrees to a build fee of $1,250.00 (Friends & Family rate; 50% discount applied). By completing this build fee, Client locks in the Growth Plan subscription which will commence 14 days after system is live.', { width: 500 });

        if (paymentUrl) {
            doc.moveDown(0.5);
            doc.fillColor(COLORS.PRIMARY).font(FONTS.BOLD).fontSize(10).text('Secure Payment Portal:', { continued: true })
                .fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).text(` ${paymentUrl}`, { link: paymentUrl, underline: true });
        }

        // Signatures
        doc.moveDown(2.5);
        const sigY = doc.y;

        // Left Column
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(12).text('TheClaireAI', 50, sigY);
        doc.moveDown(0.4);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10).text('Authorized Signature');

        // Right Column
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(12).text(firmName, 300, sigY, { width: 250 });
        doc.moveDown(0.4);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10).text('Client Signature');

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}

/**
 * Generates an Institutional-Grade PDF Invoice.
 */
/**
 * Generates an Institutional-Grade PDF Invoice matching the "Premium" screenshot.
 */
/**
 * Generates an Institutional-Grade PDF Invoice matching the "Premium" screenshot.
 */
async function generateInvoicePDF(invoiceData, firmName, paymentUrl) {
    const logo = await getLogo();
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true }); // Standard A4
        const fileName = `Invoice_${invoiceData.id}.pdf`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        const writeStream = fs.createWriteStream(filePath);

        // -- COLORS --
        const BRAND_GREEN = '#0f4c3a';  // Dark Teal/Green
        const BRAND_LIGHT = '#1a5f4a';  // Slightly lighter for gradient effect
        const BRAND_MINT = '#f0fbf9';   // Footer BG
        const TEXT_DARK = '#111111';
        const TEXT_GRAY = '#555555';

        doc.pipe(writeStream);

        // --- HELPER: HEADER GRAPHIC (The "3D Swirl") ---
        function drawHeader(yOffset = 0) {
            doc.save();

            // Base Dark Curve
            doc.path(`M 0 ${yOffset} L 600 ${yOffset} L 600 ${yOffset + 120} C 500 ${yOffset + 40} 200 ${yOffset + 140} 0 ${yOffset + 60} Z`)
                .fillColor(BRAND_GREEN)
                .fillOpacity(1)
                .fill();

            // Overlay Lighter Curve (Transparency)
            doc.path(`M 250 ${yOffset} L 600 ${yOffset} L 600 ${yOffset + 100} C 450 ${yOffset + 80} 350 ${yOffset + 20} 250 ${yOffset} Z`)
                .fillColor(BRAND_LIGHT)
                .fillOpacity(0.5)
                .fill();

            // Abstract Circle Accent
            doc.circle(520, yOffset + 30, 80)
                .fillColor('#ffffff')
                .fillOpacity(0.1)
                .fill();

            doc.restore();
        }

        // --- HELPER: FOOTER GRAPHIC ---
        function drawFooter() {
            doc.save();
            const bottomY = doc.page.height - 100;
            doc.path(`M 0 ${doc.page.height} L 600 ${doc.page.height} L 600 ${bottomY} C 400 ${bottomY - 40} 200 ${bottomY + 40} 0 ${bottomY} Z`)
                .fillColor(BRAND_GREEN)
                .fill();
            doc.restore();
        }

        // === PAGE 1: INVOICE ===
        drawHeader();

        const topContentY = 140;

        // Logo (Left)
        if (logo) {
            doc.image(logo, 50, topContentY - 20, { height: 45 });
        } else {
            doc.fillColor(BRAND_GREEN).font(FONTS.BOLD).fontSize(22).text('ClaireAI', 50, topContentY);
        }

        // RIGHT COLUMN: Invoice Header
        doc.fillColor(BRAND_GREEN)
            .font(FONTS.REGULAR)
            .fontSize(32)
            .text('Invoice', 0, topContentY - 10, { align: 'right', width: 545 });

        doc.fillColor(TEXT_GRAY)
            .fontSize(11)
            .text(`# ${invoiceData.id}`, 0, topContentY + 30, { align: 'right', width: 545 });

        doc.fillColor(TEXT_DARK)
            .font(FONTS.BOLD)
            .fontSize(10)
            .text('Balance Due', 450, topContentY + 55, { align: 'right', width: 95 });

        doc.fillColor(TEXT_DARK)
            .fontSize(18)
            .text(`$${invoiceData.amount.toLocaleString()}.00`, 450, topContentY + 70, { align: 'right', width: 95 });

        // LEFT COLUMN: Addresses
        const addressY = topContentY + 80;

        // From
        doc.fontSize(10).font(FONTS.BOLD).fillColor(TEXT_DARK).text('Claire AI', 50, addressY);
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Florida, USA', 50, addressY + 15);
        doc.text('billing@theclaireai.com', 50, addressY + 30);

        // Bill To
        doc.moveDown(2);
        const billToY = doc.y + 10;
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Bill To', 50, billToY);
        doc.font(FONTS.BOLD).fillColor(TEXT_DARK).text(firmName, 50, billToY + 15);

        // Dates (Right Aligned)
        const dateX = 400;
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Invoice Date :', dateX - 60, billToY, { width: 80, align: 'right' });
        doc.fillColor(TEXT_DARK).text(new Date().toLocaleDateString(), dateX + 30, billToY, { align: 'right' });

        doc.fillColor(TEXT_GRAY).text('Terms :', dateX - 60, billToY + 15, { width: 80, align: 'right' });
        doc.fillColor(TEXT_DARK).text('Due on Receipt', dateX + 30, billToY + 15, { align: 'right' });

        doc.fillColor(TEXT_GRAY).text('Due Date :', dateX - 60, billToY + 30, { width: 80, align: 'right' });
        doc.fillColor(TEXT_DARK).text(new Date().toLocaleDateString(), dateX + 30, billToY + 30, { align: 'right' });


        // --- TABLE ---
        const tableY = billToY + 70;

        // Header
        doc.rect(50, tableY, 500, 25).fill(BRAND_GREEN);
        doc.fillColor(COLORS.WHITE).font(FONTS.BOLD).fontSize(9);
        doc.text('#', 65, tableY + 7);
        doc.text('Item & Description', 100, tableY + 7);
        doc.text('Qty', 400, tableY + 7, { width: 30, align: 'center' });
        doc.text('Rate', 450, tableY + 7, { width: 40, align: 'right' });
        doc.text('Amount', 510, tableY + 7, { width: 40, align: 'right' });

        // Item Row
        const rowY = tableY + 35;
        doc.fillColor(TEXT_DARK).font(FONTS.REGULAR).fontSize(10);
        doc.text('1', 65, rowY);

        doc.font(FONTS.BOLD).text('Standard AI Receptionist Setup', 100, rowY);
        doc.font(FONTS.REGULAR).fontSize(9).fillColor(TEXT_GRAY)
            .text(`Charges for this duration (${new Date().toLocaleDateString()} to ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()})`, 100, rowY + 15, { width: 300 });

        doc.fillColor(TEXT_DARK).fontSize(10);
        doc.text('1', 405, rowY, { align: 'center' });
        doc.text(invoiceData.amount.toLocaleString() + ".00", 450, rowY, { align: 'right', width: 40 });
        doc.text(invoiceData.amount.toLocaleString() + ".00", 510, rowY, { align: 'right', width: 40 });

        doc.moveTo(50, rowY + 40).lineTo(550, rowY + 40).lineWidth(0.5).strokeColor('#e0e0e0').stroke();

        // Totals
        let totalY = rowY + 55;
        doc.fontSize(9).fillColor(TEXT_GRAY).text('Sub Total', 400, totalY, { align: 'right', width: 80 });
        doc.fillColor(TEXT_DARK).text(invoiceData.amount.toLocaleString() + ".00", 500, totalY, { align: 'right', width: 50 });

        totalY += 20;
        doc.fillColor(TEXT_GRAY).text('Tax (0%)', 400, totalY, { align: 'right', width: 80 });
        doc.fillColor(TEXT_DARK).text("0.00", 500, totalY, { align: 'right', width: 50 });

        totalY += 20;
        doc.font(FONTS.BOLD).text('Total', 400, totalY, { align: 'right', width: 80 });
        doc.text(`$${invoiceData.amount.toLocaleString()}.00`, 500, totalY, { align: 'right', width: 50 });

        // Balance Due (Mint Box) - Matches Screenshot 2 Footer Area
        totalY += 30;
        doc.rect(400, totalY - 10, 150, 30).fill(BRAND_MINT);
        doc.fillColor(TEXT_DARK).font(FONTS.BOLD).text('Balance Due', 410, totalY, { width: 80, align: 'left' });
        doc.text(`$${invoiceData.amount.toLocaleString()}.00`, 500, totalY + 1, { align: 'right', width: 40 });

        // === PAGE 2: TERMS (Screenshot 3) ===
        doc.addPage();
        drawHeader(-50); // Smaller header on page 2? Or just same. Let's start fresh.

        doc.marginTop = 150;
        doc.y = 150;

        doc.fillColor(TEXT_DARK).font(FONTS.BOLD).fontSize(14).text('Notes');
        doc.font(FONTS.REGULAR).fontSize(10).fillColor(TEXT_GRAY).text('Thank you for choosing the Claire AI Basic Plan. Your firm is now equipped with 24/7 intake coverage, ensuring no lead is missed after hours or on weekends.');

        doc.moveDown(2);
        doc.fillColor(TEXT_DARK).font(FONTS.BOLD).fontSize(14).text('Terms & Conditions');
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor(TEXT_GRAY)
            .text('LEGAL NOTICE: BINDING AGREEMENT BY PAYMENT. By completing the payment of this invoice, the Customer ("The Firm") explicitly agrees to the following terms with Claire AI:')
            .moveDown(0.5)
            .text('1. Acceptance of Service: Payment constitutes a formal "Clickwrap" agreement and acceptance of all terms listed herein.')
            .moveDown(0.5)
            .text('2. Service Scope: Claire AI provides 24/7 automated reception and lead intake. This is an administrative tool and does not provide legal advice.')
            .moveDown(0.5)
            .text('3. Subscription & Cancellation: This is a monthly recurring plan. To prevent future billing, a 30-day written notice of cancellation is required.')
            .moveDown(0.5)
            .text('4. No Refunds: Onboarding and setup fees are non-refundable once the account configuration has commenced.')
            .moveDown(0.5)
            .text('5. Privacy: All intake data is handled via secure automation and delivered to your designated records.');

        // Payment Link in Text
        if (paymentUrl) {
            doc.moveDown(2);
            doc.fillColor(BRAND_GREEN).font(FONTS.BOLD).fontSize(11)
                .text('Pay Securely Online:', { continued: true })
                .font(FONTS.REGULAR).text(` ${paymentUrl}`, { link: paymentUrl, underline: true });
        }

        // Bottom Footer Graphic
        drawFooter();

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}

module.exports = { generateContract, generateInvoicePDF };
