const axios = require('axios');

// Placeholder for Slack Webhook URL (Get this from your Slack App settings)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Sends an internal notification to the team Slack channel.
 * @param {string} firmName - Name of the new client
 * @param {string} agentType - Type of agent provisioned
 * @param {string} status - Current status (e.g., 'Provisioned', 'Ready for QA')
 */
async function sendInternalNotification(firmName, agentType, status = 'Ready for Verification') {
    console.log(`[Slack] Sending internal alert for ${firmName}...`);

    if (!SLACK_WEBHOOK_URL) {
        console.log(`[SIMULATION] Slack Message: 🚨 *New Agent Created*`);
        console.log(`[SIMULATION] Firm: ${firmName}`);
        console.log(`[SIMULATION] Agent: ${agentType}`);
        console.log(`[SIMULATION] Action: Please perform Test Call & Verification.`);
        return { status: 'mock_success' };
    }

    try {
        const payload = {
            text: `🚨 *New Agent Created: ${firmName}*`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*New Client Onboarded*\n*Firm:* ${firmName}\n*Agent Archetype:* ${agentType}\n*Status:* ${status}`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "👉 *Action Required:* Call the provisional number and verify performance."
                    }
                }
            ]
        };

        const response = await axios.post(SLACK_WEBHOOK_URL, payload);
        return response.data;
    } catch (error) {
        console.error('Slack API Error:', error.message);
        return { error: error.message };
    }
}

module.exports = { sendInternalNotification };
