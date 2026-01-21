// This code is designed to be pasted directly into a Twilio Function
// Go to: https://console.twilio.com/ -> Functions & Assets -> Services -> Create Service
// Add a Function named "incoming-call" and paste this code.

exports.handler = function (context, event, callback) {
    // NATIVE JAVASCRIPT TIMEZONE CHECK (No Dependencies needed)

    // CONFIGURATION
    // --------------------------------------------------------
    // SARAH_CELL: The specific cell phone number Sarah answers.
    // CRITICAL: This MUST be different from her main business line.
    const SARAH_CELL = '+15415050249'; // SARAH'S PERSONAL CELL

    // CLONEOPS_AI: The AI Receptionist Number
    const CLONEOPS_AI = '+17869470992';

    // CUTOFF_HOUR: 12 (12:00 PM / Noon)
    // Calls before this hour go to Sarah. Calls after go to AI.
    const CUTOFF_HOUR = 12;
    // --------------------------------------------------------

    const twiml = new Twilio.twiml.VoiceResponse();

    // Get current time in New York (EST/EDT)
    const options = { timeZone: 'America/New_York', hour: 'numeric', hour12: false };
    const formatter = new Intl.DateTimeFormat([], options);
    const currentHour = parseInt(formatter.format(new Date()));

    console.log(`Current Hour in EST: ${currentHour}`);

    // LOGIC:
    // If it is BEFORE 12pm (0 - 11) -> Route to Sarah
    // If it is 12pm or AFTER (12 - 23) -> Route to AI

    if (currentHour < CUTOFF_HOUR) {
        console.log('Time is before 12pm. Routing to Sarah.');
        const dial = twiml.dial({
            timeout: 20,
        });
        dial.number(SARAH_CELL);
    } else {
        console.log('Time is after 12pm. Routing to AI.');
        twiml.dial(CLONEOPS_AI);
    }

    return callback(null, twiml);
};
