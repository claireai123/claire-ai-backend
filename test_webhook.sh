#!/bin/bash

# This script simulates a webhook coming in with Zoho-style properties (or generic JSON).
# Currently our parser handles flat JSON or 'properties' object wrapper.

echo "Sending Gatekeeper Test (Law Firm A)..."
curl -X POST http://localhost:3000/api/onboarding/webhook \
     -H "Content-Type: application/json" \
     -d '{
           "properties": {
             "firm_name": { "value": "Law Firm A" },
             "practice_area": { "value": "Personal Injury" },
             "transfer_number": { "value": "555-0100" },
             "agent_archetype": { "value": "Gatekeeper" },
             "client_email": { "value": "tiago@example.com" }
           }
         }'

echo -e "\n\nSending Concierge Test (Law Firm B)..."
curl -X POST http://localhost:3000/api/onboarding/webhook \
     -H "Content-Type: application/json" \
     -d '{
           "properties": {
             "firm_name": { "value": "Law Firm B" },
             "practice_area": { "value": "Family Law" },
             "transfer_number": { "value": "555-0200" },
             "agent_archetype": { "value": "Concierge" },
             "client_email": { "value": "tiago@example.com" }
           }
         }'

echo -e "\n\nDone."
