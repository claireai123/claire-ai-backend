const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

// In a real implementation, you'd manage the access token lifecycle (refreshing it when expired).
// For this MVP, we will assume a valid ACCESS_TOKEN is handled or refresh flow is simple.
let cachedAccessToken = null;

async function getZohoAccessToken() {
    if (cachedAccessToken) return cachedAccessToken;

    if (!ZOHO_REFRESH_TOKEN || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
        console.warn('Missing Zoho Credentials.');
        return null;
    }

    try {
        const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;
        const response = await axios.post(url);
        cachedAccessToken = response.data.access_token;
        return cachedAccessToken;
    } catch (error) {
        console.error('Error refreshing Zoho Token:', error.message);
        return null;
    }
}

/**
 * Sends a transactional email or updates the deal/contact in Zoho via API.
 */
async function sendProvisioningUpdate(dealId, firmName, agentRole) {
    if (!dealId) {
        console.warn('Cannot update Zoho: No Deal ID provided.');
        return;
    }

    console.log(`[Zoho CRM] Updating Deal ${dealId} for ${firmName}...`);

    const token = await getZohoAccessToken();
    if (!token) {
        console.log(`[SIMULATION] [Zoho] Updated Deal ${dealId}: Description -> "Agent ${agentRole} Provisioned"`);
        return { status: 'mock_success' };
    }

    try {
        const url = `https://www.zohoapis.com/crm/v2/Deals/${dealId}`;
        const payload = {
            data: [
                {
                    Description: `Automated Agent (${agentRole}) Provisioned via ClaireAI.`
                    // You could also update Stage here, e.g., Stage: 'Closed Won'
                }
            ]
        };

        const response = await axios.put(url, payload, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });

        console.log('[Zoho CRM] Update Success:', response.data);
        return response.data;

    } catch (error) {
        console.error('Zoho Update Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Uploads a file to Zoho CRM Files API.
 * Returns the encrypted file ID if successful.
 */
async function uploadAttachment(filePath, token) {
    if (!fs.existsSync(filePath)) {
        console.warn(`[Zoho] File not found: ${filePath}`);
        return null;
    }

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // Note: Zoho CRM Files API endpoint
        const url = `https://www.zohoapis.com/crm/v2/files`;
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Zoho-oauthtoken ${token}`
            }
        });

        // The response from /files is { data: [ { code: 'SUCCESS', details: { id: '...' }, ... } ] }
        const fileId = response.data?.data?.[0]?.details?.id;
        if (fileId) {
            console.log(`[Zoho CRM] Uploaded to Files API: ${path.basename(filePath)} -> ID: ${fileId}`);
        } else {
            console.error('[Zoho CRM] Upload failed or ID missing:', response.data);
        }
        return fileId;
    } catch (error) {
        console.error('[Zoho] File Upload Error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Sends the Setup Invoice with Pixel-Perfect Design matching the screenshot.
 */
async function sendInvoiceEmail(dealId, toEmail, invoice, firmName, attachmentPath, paymentUrl) {
    if (!dealId || !toEmail) return;

    console.log(`[Zoho CRM] Sending INVOICE to ${toEmail} (Deal ${dealId})...`);

    // Design matching the "Correct" Screenshot (Zoho Subscriptions Style)
    // Key Changes: Flat border, No Shadow, Specific Padding
    const HTML_TEMPLATE = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px; }
            .container { 
                background-color: #ffffff; 
                max-width: 500px; 
                margin: 0 auto; 
                padding: 40px; 
                border: 1px solid #e0e0e0; 
                border-radius: 4px; 
                text-align: center; 
            }
            .logo { height: 32px; margin-bottom: 25px; }
            .title { color: #666; font-size: 13px; margin-bottom: 8px; font-weight: 400; }
            .invoice-num { font-size: 18px; font-weight: 700; color: #000; margin-bottom: 4px; }
            .client-name { color: #666; font-size: 14px; margin-bottom: 25px; }
        <style>
            /* Client-specific resets */
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; }
            img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: Helvetica, Arial, sans-serif; background-color: #f4f6f8; }
            
            /* Button Style */
            .btn-primary {
                background-color: #0f4c3a;
                color: #ffffff;
                display: inline-block;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
            }
        </style>
    </head>
    <body style="background-color: #f4f6f8; margin: 0; padding: 0;">
        <!-- MAIN WRAPPER TABLE -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    
                    <!-- INTRO TEXT -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
                        <tr>
                            <td align="left" style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 24px;">
                                Hi there,<br><br>
                                Thank you for choosing ClaireAI! Please find your invoice details below.
                            </td>
                        </tr>
                    </table>

                    <!-- WHITE CARD TABLE -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0 box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="padding: 40px;">
                                <!-- LOGO (Hardcoded Width) -->
                                <img src="https://res.cloudinary.com/dwzsqumf6/image/upload/v1765854323/logo_transparent_ec9ge1.png" width="140" alt="ClaireAI" style="display: block; border: 0; max-width: 140px; width: 140px; margin-bottom: 30px;">
                                
                                <!-- CONTENT -->
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Invoice from ClaireAI</div>
                                <div style="font-size: 24px; color: #1e293b; font-weight: 700; margin-bottom: 5px;">Invoice #${invoice.id}</div>
                                <div style="font-size: 14px; color: #64748b; margin-bottom: 30px;">For: ${firmName}</div>
                                <div style="font-size: 56px; color: #0f4c3a; font-weight: 700; margin-bottom: 40px; letter-spacing: -2px;">$${invoice.amount.toLocaleString()}.00</div>
                                
                                <!-- BUTTON -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" bgcolor="#0f4c3a" style="border-radius: 8px;">
                                            <a href="${paymentUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; border: 1px solid #0f4c3a; display: inline-block; font-weight: bold;">Pay Invoice</a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="color: #94a3b8; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">Due: Upon Receipt</div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- FOOTER -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
                        <tr>
                            <td align="center" style="padding-top: 20px; color: #999999; font-size: 11px;">
                                © ${new Date().getFullYear()} ClaireAI LLC. All rights reserved.
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const token = await getZohoAccessToken();
    if (!token) {
        console.log(`[SIMULATION] [Zoho] Invoice sent to ${toEmail}`);
        return { status: 'mock_success' };
    }

    try {
        const fileId = await uploadAttachment(attachmentPath, token);
        const url = `https://www.zohoapis.com/crm/v2/Deals/${dealId}/actions/send_mail`;

        const emailData = {
            from: { user_name: 'ClaireAI Billing', email: 'tiago@theclaireai.com' },
            to: [{ email: toEmail }],
            subject: `Invoice from ClaireAI (#${invoice.id})`,
            content: HTML_TEMPLATE
        };

        if (fileId) {
            emailData.attachments = [{ id: fileId }];
        }

        const payload = { data: [emailData] };

        const response = await axios.post(url, payload, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });
        console.log('[Zoho CRM] Invoice Email Sent (Styled):', response.data);
        return response.data;
    } catch (error) {
        console.error('Zoho Email Error:', error.response ? error.response.data : error.message);
        // CRITICAL FIX: Throw the error so the main route knows it failed!
        throw error;
    }
}

/**
 * Sends the Welcome Packet / Onboarding Roadmap (with contract attachment).
 */
async function sendWelcomePacket(dealId, toEmail, firmName, agentRole, attachmentPath, paymentUrl) {
    if (!dealId || !toEmail) return;

    console.log(`[Zoho CRM] Sending WELCOME PACKET to ${toEmail} (Deal ${dealId})...`);
    if (attachmentPath) console.log(`[Zoho CRM] Attaching: ${attachmentPath}`);

    const token = await getZohoAccessToken();
    if (!token) {
        console.log(`[SIMULATION] [Zoho] Welcome Packet sent to ${toEmail}`);
        return { status: 'mock_success' };
    }

    try {
        // Step 1: Upload the file to Zoho Files API
        const fileId = await uploadAttachment(attachmentPath, token);

        const url = `https://www.zohoapis.com/crm/v2/Deals/${dealId}/actions/send_mail`;

        let content = `Welcome aboard!<br><br>We have provisioned your <b>${agentRole}</b> agent.<br>Please see the attached contract.<br><br>`;
        if (paymentUrl) {
            content += `<b>Please complete the setup payment here to finalize:</b><br><a href="${paymentUrl}">${paymentUrl}</a><br><br>`;
        }
        content += `Best,<br>ClaireAI Team`;

        const emailData = {
            from: { user_name: 'ClaireAI', email: 'tiago@theclaireai.com' },
            to: [{ email: toEmail }],
            subject: `Welcome to ClaireAI - ${firmName}`,
            content: content
        };

        // Add attachment ID if we have it
        if (fileId) {
            emailData.attachments = [{ id: fileId }];
        }

        const payload = { data: [emailData] };

        const response = await axios.post(url, payload, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });
        console.log('[Zoho CRM] Welcome Email Sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Zoho Email Error:', error.response ? error.response.data : error.message);
        return null;
    }
}

/**
 * Deletes a Deal by ID.
 */
async function deleteDeal(dealId) {
    const token = await getZohoAccessToken();
    if (!token) return;

    try {
        const url = `https://www.zohoapis.com/crm/v2/Deals/${dealId}`;
        const response = await axios.delete(url, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });
        console.log(`[Zoho] Deleted Deal ${dealId}:`, response.data.data[0].status);
        return response.data;
    } catch (error) {
        console.error(`[Zoho] Failed to delete Deal ${dealId}:`, error.message);
    }
}

/**
 * Lists recent Deals (for cleanup).
 */
async function listRecentDeals() {
    const token = await getZohoAccessToken();
    if (!token) return [];

    try {
        const url = `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=1&per_page=50`;
        const response = await axios.get(url, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('[Zoho] Failed to list deals:', error.message);
        return [];
    }
}

module.exports = { sendProvisioningUpdate, sendInvoiceEmail, sendWelcomePacket, listRecentDeals, deleteDeal };
