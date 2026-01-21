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
const OUTPUT_DIR = path.join(__dirname, '../public/documents');
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
async function generateInvoicePDF(invoiceData, firmName, paymentUrl) {
    const logo = await getLogo();
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `Invoice_${invoiceData.id}.pdf`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Header Branding
        if (logo) {
            doc.image(logo, 50, 40, { height: 50 });
        } else {
            doc.fillColor(COLORS.PRIMARY).font(FONTS.BOLD).fontSize(20).text('CLAIRE AI', 50, 50);
        }

        doc.fillColor(COLORS.PRIMARY).font(FONTS.BOLD).fontSize(24).text('INVOICE', 350, 50, { align: 'right' });
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10).text('Institutional Grade Automation Hub', logo ? 160 : 50, 65, { align: 'right' });

        doc.moveTo(50, 95).lineTo(550, 95).strokeColor('#e2e8f0').lineWidth(1).stroke();

        // Invoice Metadata
        doc.moveDown(2);
        const metaY = doc.y;
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(10).text('BILL TO:', 50, metaY);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(11).text(firmName, 50, metaY + 15, { width: 250 });

        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(10).text('INVOICE DETAILS:', 350, metaY);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(10)
            .text(`ID: ${invoiceData.id}`, 350, metaY + 15, { align: 'right' })
            .text(`Date: ${new Date().toLocaleDateString()}`, 350, metaY + 30, { align: 'right' })
            .text('Due Date: Upon Receipt', 350, metaY + 45, { align: 'right' });

        // Summary Block
        doc.moveDown(4);
        const startY = doc.y;
        drawSummaryBlock(doc, 'Implementation & Calibration', invoiceData.amount, 50, startY, 500, 80);

        // Line Items Table
        doc.y = startY + 100;
        const tableHeaderY = doc.y;
        doc.fillColor(COLORS.BG_LIGHT).rect(50, tableHeaderY, 500, 25).fill();
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(10);
        doc.text('DESCRIPTION', 65, tableHeaderY + 7);
        doc.text('SUBTOTAL', 450, tableHeaderY + 7, { width: 85, align: 'right' });

        doc.moveDown(1.5);
        const rowY = doc.y;
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.REGULAR).fontSize(11);
        doc.text(invoiceData.description, 65, rowY, { width: 350 });
        doc.text(`$${invoiceData.amount.toLocaleString()}.00`, 450, rowY, { align: 'right', width: 85 });

        doc.moveTo(50, doc.y + 30).lineTo(550, doc.y + 30).strokeColor('#f1f5f9').stroke();

        // Totals
        doc.moveDown(3);
        doc.fillColor(COLORS.TEXT_MAIN).font(FONTS.BOLD).fontSize(14).text(`Total Amount Due (USD): $${invoiceData.amount.toLocaleString()}.00`, { align: 'right', width: 500 });

        if (paymentUrl) {
            doc.moveDown(1);
            doc.fillColor(COLORS.PRIMARY).font(FONTS.BOLD).fontSize(10).text('CLICK HERE TO PAY SECURELY VIA STRIPE', { align: 'right', link: paymentUrl, underline: true });
        }

        // Footer
        doc.moveDown(4);
        doc.fillColor(COLORS.TEXT_MUTED).font(FONTS.BOLD).fontSize(10).text('PAYMENT INFORMATION', { align: 'center' });
        doc.moveDown(0.5);
        doc.font(FONTS.REGULAR).fontSize(9).text('Please use the secure link provided in your email to complete payment via Card or Bank Transfer.', { align: 'center' });
        doc.text('Provisioning will commence immediately upon successful transaction.', { align: 'center' });

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}

module.exports = { generateContract, generateInvoicePDF };
