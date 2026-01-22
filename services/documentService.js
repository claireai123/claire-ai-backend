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
async function generateInvoicePDF(invoiceData, firmName, paymentUrl) {
    const logo = await getLogo();
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' }); // Standard A4
        const fileName = `Invoice_${invoiceData.id}.pdf`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        const writeStream = fs.createWriteStream(filePath);

        // -- COLORS --
        const BRAND_GREEN = '#0f4c3a';  // Dark Teal/Green (Header & Table)
        const BRAND_MINT = '#f0fbf9';   // Light Mint (Footer BG)
        const TEXT_DARK = '#111111';
        const TEXT_GRAY = '#555555';

        doc.pipe(writeStream);

        // 1. Header Graphic (Abstract Curves)
        // Mimicking the top green curves from the screenshot
        doc.save();
        doc.path('M 0 0 L 600 0 L 600 100 C 500 40 400 120 0 80 Z') // Abstract top wave
            .fillOpacity(1.0)
            .fill(BRAND_GREEN);

        // Simulating the lighter overlay curve/circle
        doc.path('M 300 0 L 450 0 C 450 60 380 80 300 0 Z')
            .fillOpacity(0.3)
            .fill('#ffffff');
        doc.restore();

        // 2. Headings (Logo & Title)
        const topContentY = 140;

        // Logo (Left)
        if (logo) {
            doc.image(logo, 50, topContentY, { height: 40 }); // ClaireAI Logo
        } else {
            doc.fillColor(BRAND_GREEN).font(FONTS.BOLD).fontSize(20).text('ClaireAI', 50, topContentY);
        }

        // Invoice Details (Right)
        doc.fillColor(BRAND_GREEN)
            .font(FONTS.REGULAR)
            .fontSize(28)
            .text('Invoice', 50, topContentY, { align: 'right', width: 500 });

        doc.fillColor(TEXT_GRAY)
            .fontSize(10)
            .text(`# ${invoiceData.id}`, 50, topContentY + 35, { align: 'right', width: 500 });

        doc.fillColor(TEXT_DARK)
            .font(FONTS.BOLD)
            .fontSize(10)
            .text('Balance Due', 400, topContentY + 55, { align: 'right', width: 150 });

        doc.fillColor(TEXT_DARK)
            .fontSize(16)
            .text(`$${invoiceData.amount.toLocaleString()}.00`, 400, topContentY + 70, { align: 'right', width: 150 });

        // 3. Address & Metadata Sections
        const addressY = topContentY + 110;

        // From Address (Left)
        doc.fontSize(10).font(FONTS.BOLD).fillColor(TEXT_DARK).text('Claire AI', 50, addressY);
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Florida, USA', 50, addressY + 15);
        doc.text('billing@theclaireai.com', 50, addressY + 30);

        // Bill To (Below From)
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Bill To', 50, addressY + 70);
        doc.font(FONTS.BOLD).fillColor(TEXT_DARK).text(firmName, 50, addressY + 85);

        // Dates (Right, aligned with From)
        const dateX = 400;
        doc.font(FONTS.REGULAR).fillColor(TEXT_GRAY).text('Invoice Date :', dateX - 60, addressY + 70, { width: 80, align: 'right' });
        doc.fillColor(TEXT_DARK).text(new Date().toLocaleDateString(), dateX + 30, addressY + 70, { align: 'right' });

        doc.fillColor(TEXT_GRAY).text('Due Date :', dateX - 60, addressY + 85, { width: 80, align: 'right' });
        doc.fillColor(TEXT_DARK).text('On Receipt', dateX + 30, addressY + 85, { align: 'right' });


        // 4. The Table (Green Header)
        const tableY = addressY + 130;

        // Header Bar
        doc.rect(50, tableY, 500, 25).fill(BRAND_GREEN);

        // Header Text
        doc.fillColor(COLORS.WHITE).font(FONTS.BOLD).fontSize(9);
        doc.text('#', 65, tableY + 7);
        doc.text('Item & Description', 100, tableY + 7);
        doc.text('Qty', 400, tableY + 7, { width: 30, align: 'center' });
        doc.text('Rate', 450, tableY + 7, { width: 40, align: 'right' });
        doc.text('Amount', 510, tableY + 7, { width: 40, align: 'right' });

        // Row 1
        const rowY = tableY + 35;
        doc.fillColor(TEXT_DARK).font(FONTS.REGULAR).fontSize(10);
        doc.text('1', 65, rowY);
        doc.font(FONTS.BOLD).text('Standard AI Receptionist Setup', 100, rowY);
        doc.font(FONTS.REGULAR).fontSize(9).fillColor(TEXT_GRAY)
            .text('Implementation, calibration, and initial configuration.', 100, rowY + 15);

        doc.fillColor(TEXT_DARK).fontSize(10);
        doc.text('1', 405, rowY, { align: 'center' });
        doc.text(invoiceData.amount.toLocaleString(), 440, rowY, { align: 'right', width: 50 });
        doc.text(invoiceData.amount.toLocaleString(), 500, rowY, { align: 'right', width: 50 });

        // Line Divider
        doc.moveTo(50, rowY + 35).lineTo(550, rowY + 35).lineWidth(0.5).strokeColor('#e0e0e0').stroke();

        // 5. Totals Section
        let totalY = rowY + 50;

        // Subtotal
        doc.fontSize(9).fillColor(TEXT_GRAY).text('Sub Total', 400, totalY, { align: 'right', width: 80 });
        doc.fillColor(TEXT_DARK).text(invoiceData.amount.toLocaleString(), 500, totalY, { align: 'right', width: 50 });

        // Total
        totalY += 20;
        doc.font(FONTS.BOLD).text('Total', 400, totalY, { align: 'right', width: 80 });
        doc.text(`$${invoiceData.amount.toLocaleString()}`, 500, totalY, { align: 'right', width: 50 });

        // Balance Due Box (Mint Background)
        totalY += 30;
        doc.rect(400, totalY - 10, 150, 30).fill(BRAND_MINT);
        doc.fillColor(TEXT_DARK).font(FONTS.BOLD).text('Balance Due', 410, totalY, { width: 80, align: 'left' });
        doc.text(`$${invoiceData.amount.toLocaleString()}`, 500, totalY, { align: 'right', width: 40 });

        // 6. Payment Link Footer
        if (paymentUrl) {
            doc.moveDown(4);
            doc.y = 700; // Bottom of page
            doc.fontSize(10).fillColor(BRAND_GREEN)
                .text('Secure Online Payment Available', 50, doc.y, { align: 'center' })
                .fontSize(9).fillColor(TEXT_GRAY)
                .text('Please click the link in your email or here to pay.', { align: 'center' });
        }

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}

module.exports = { generateContract, generateInvoicePDF };
