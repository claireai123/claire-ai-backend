#!/bin/bash

echo "Sending REAL Zoho Webhook Request with Upgraded Documents..."

curl -X POST http://localhost:3000/api/onboarding/webhook \
     -H "Content-Type: application/json" \
     -d '{
           "id": "7203613000000625007",
           "Deal_Name": "Standard Onboarding (Solo) - Litowich",
           "Practice_Area": "Family Law",
           "Transfer_Number": "+15550199",
           "Agent_Archetype": "Gatekeeper",
           "client_email": "tiago@theclaireai.com",
           "Contact_Name": {
               "name": "Sarah Litowich",
               "id": "7203613000000632001"
           }
         }'

echo -e "\n\nDone."
