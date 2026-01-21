/**
 * Parses incoming HubSpot webhook data to extract keys for the CloneOps agent provisioning.
 * 
 * Expected payload structure logic:
 * HubSpot webhooks usually wrap properties in a way like properties: { propertyname: { value: "someval" } }
 * or a flat object depending on the workflow setting.
 * This parser attempts to find the fields in the 'properties' object of the deal/contact.
 * 
 * @param {Object} payload - The JSON payload from HubSpot
 * @returns {Object} - Parsed data containing firm_name, practice_area, transfer_number, agent_archetype
 */
function parseCRMData(payload) {
    // Default structure assumption: payload might be the deal object itself or wrapped
    // Adjust logic based on actual webhook structure. 
    // Usually it looks like: { objectId: 123, propertyName: 'dealstage', propertyValue: 'won', ... }
    // Or if it's a workflow webhook, it might send the whole deal object.

    // We will assume the payload passes the properties in a readable format 
    // or we are receiving a direct deal object with a 'properties' map.

    const properties = payload.properties || payload; // Fallback if flat

    // Helper to safety get value
    const getVal = (key) => {
        if (properties[key] && typeof properties[key] === 'object' && properties[key].value) {
            return properties[key].value;
        }
        return properties[key] || null;
    };

    // Zoho often sends keys like 'Deal_Name', 'Stage', 'id' directly.
    // We check for these specifically.

    const deal_id = getVal('id'); // Essential for write-back
    
    // Zoho / Common mapping
    const firm_name = getVal('Deal_Name') || getVal('firm_name');
    const practice_area = getVal('Practice_Area') || getVal('practice_area');
    // For specific custom fields, we use the API names. Assuming 'Transfer_Number' and 'Agent_Archetype'
    const transfer_number = getVal('Transfer_Number') || getVal('transfer_number'); 
    const agent_archetype = getVal('Agent_Archetype') || getVal('agent_archetype');
    
    // Email might be in a nested 'Contact_Name' object or top level
    let client_email = getVal('Email') || getVal('client_email');
    if (!client_email && properties['Contact_Name'] && properties['Contact_Name'].email) {
        client_email = properties['Contact_Name'].email;
    }

    if (!firm_name || !agent_archetype) {
        // We log strict missing fields but maybe we can be looser if testing
        console.warn('Missing DNA fields. Payload keys:', Object.keys(properties));
        if (!firm_name) throw new Error('Missing required DNA field: firm_name (or Deal_Name)');
        if (!agent_archetype) throw new Error('Missing required DNA field: agent_archetype');
    }

    return {
        id: deal_id,
        firm_name,
        practice_area,
        transfer_number,
        agent_archetype,
        client_email
    };
}

module.exports = { parseCRMData };
