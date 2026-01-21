# Project Status: The "Claire AI" Onboarding Backend

We have built a custom, automated engine to replace "Make.com". It handles the full client journey from "Sale" to "Go-Live".

## 1. What We Have Built (The Engine)

| Component | What it does | Status |
| :--- | :--- | :--- |
| **The Listener** | Waits for HubSpot "Deal Won" events. | ✅ **Active** |
| **DNA Parser** | Reads Firm Name, Archetype, Email from HubSpot. | ✅ **Active** |
| **Logic Core** | Decides which Agent to build (Gatekeeper vs Concierge). | ✅ **Active** |
| **CloneOps Bridge** | Sends the order to build the AI Agent. | ✅ **Active** (Simulated) |
| **Document Factory**| **Generates PDF Contracts & Invoices** automatically. | ✅ **Active** |
| **Billing System** | Creates a mock invoice and payment link. | ✅ **Active** |
| **Email Service** | **Sends Invoice** + **Welcome Email** (with PDFs attached). | ✅ **Active** (Simulated) |
| **Intake Form** | A hosted web page for clients to upload files/staff lists. | ✅ **Active** (`/intake.html`) |
| **Slack Alerts** | **Pings your team** when an agent is ready for testing. | ✅ **Active** (Simulated) |

---

## 2. What You Need to Fill In (The Keys)

The engine is built, but it needs "Fuel" (API Keys) and "Keys" (ID numbers) to work for real.

### A. The `.env` File (Secrets)
File path: `Desktop/OAutomations/.env`
Open this file and paste these values:

1.  `CLONEOPS_API_KEY`: To actually build agents (not just pretend).
2.  `HUBSPOT_ACCESS_TOKEN`: To actually send emails.
3.  `SLACK_WEBHOOK_URL`: To actually post to your Slack channel.
    *   *Where to get this:* [Slack Apps](https://api.slack.com/messaging/webhooks) -> Create New App -> Incoming Webhooks.

### B. The Template IDs (The Blueprints)
File path: `services/cloneOpsService.js`
Once you build your Master Agents in CloneOps, you need to tell this code which ID matches which name.

```javascript
const TEMPLATES = {
    'Gatekeeper': 'REPLACE_WITH_REAL_ID', // e.g. tmpl_83838
    'Concierge': 'REPLACE_WITH_REAL_ID'
};
```

---

## 3. How to Run It

1.  **Start Server**: `npm start`
2.  **Test It**: `bash test_webhook.sh`
3.  **Deploy**: When ready, we upload this folder to a cloud host (Render/Heroku) so it runs 24/7.
