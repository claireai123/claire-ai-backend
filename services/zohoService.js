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
 * Sends the Setup Invoice to the client (via Zoho CRM Email API with attachment).
 */
async function sendInvoiceEmail(dealId, toEmail, invoice, attachmentPath, paymentUrl) {
    if (!dealId || !toEmail) return;

    console.log(`[Zoho CRM] Sending INVOICE to ${toEmail} (Deal ${dealId})...`);
    if (attachmentPath) console.log(`[Zoho CRM] Attaching: ${attachmentPath}`);

    const token = await getZohoAccessToken();
    if (!token) {
        console.log(`[SIMULATION] [Zoho] Invoice #${invoice.id} sent to ${toEmail}`);
        return { status: 'mock_success' };
    }

    try {
        // Step 1: Upload the file to Zoho Files API
        const fileId = await uploadAttachment(attachmentPath, token);

        const url = `https://www.zohoapis.com/crm/v2/Deals/${dealId}/actions/send_mail`;

        let content = `Hi there,<br><br>Please find your setup invoice attached.<br><br>Total: $${invoice.amount}<br><br>`;
        if (paymentUrl) {
            content += `<b>You can complete your payment securely here:</b><br><a href="${paymentUrl}">${paymentUrl}</a><br><br>`;
        }
        content += `Thanks,<br>ClaireAI Team`;

        const emailData = {
            from: { user_name: 'ClaireAI', email: 'tiago@theclaireai.com' },
            to: [{ email: toEmail }],
            subject: `Invoice #${invoice.id} for ClaireAI Setup`,
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
        console.log('[Zoho CRM] Invoice Email Sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Zoho Email Error:', error.response ? error.response.data : error.message);
        return null;
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

module.exports = { sendProvisioningUpdate, sendInvoiceEmail, sendWelcomePacket };
