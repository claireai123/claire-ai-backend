require('dotenv').config();
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio sends form-encoded data

// Configuration
// SARAH_NUMBER: The number of the "Human Specialist" (Sarah's cell/desk phone)
// AI_NUMBER: The number for the AI Receptionist (if it has one) or SIP URI
// WORK_CUTOFF_HOUR: 13 (1pm)
const SARAH_NUMBER = process.env.SARAH_NUMBER || '+15039663558';
const AI_NUMBER = process.env.AI_NUMBER || '+17869470992';
const TIMEZONE = 'America/New_York'; // Assuming Sarah is EST based on context (or irrelevant if we just use local time, but server time matters)

app.post('/incoming-call', (req, res) => {
    const twiml = new VoiceResponse();
    const now = dayjs().tz(TIMEZONE);
    const currentHour = now.hour(); // 0-23
    const cutoffHour = 13; // 1 PM

    console.log(`Incoming call at ${now.format()} (Hour: ${currentHour})`);

    // Logic: If it's before 1pm (00:00 - 12:59), call Sarah (Human).
    // Otherwise, call AI.
    // NOTE: You might want to add "Day of Week" checks too (e.g. Weekends -> AI)

    if (currentHour < cutoffHour) {
        console.log('Routing to Human Specialist');

        // Dial the human
        const dial = twiml.dial({
            timeout: 20, // Wait 20s for her to pick up
            action: '/handle-no-answer', // If she doesn't pick up, failover to AI
            method: 'POST'
        });
        dial.number(SARAH_NUMBER);
    } else {
        console.log('Routing to AI Receptionist (After 1pm)');
        twiml.dial(AI_NUMBER);
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

// Failover handler: If Sarah doesn't pick up before 1pm
app.post('/handle-no-answer', (req, res) => {
    const twiml = new VoiceResponse();
    const dialStatus = req.body.DialCallStatus;

    console.log(`Human dial status: ${dialStatus}`);

    if (dialStatus !== 'completed') {
        // If busy, no-answer, failed, or canceled -> Send to AI
        console.log('Human missed call, failing over to AI...');
        twiml.say('Transferring you to our virtual assistant.');
        twiml.dial(AI_NUMBER);
    } else {
        // Call was completed (talked and hung up), do nothing
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sarah Call Router running on port ${PORT}`);
});
