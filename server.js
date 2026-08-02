{
  "name": "SMSKody",
  "description": "SMSKody temporary numbers",
  "version": "1.0.0",
  "author": "Custom",
  "priceFormat": "USD",
  "credentials": [
    {
      "name": "apiKey",
      "label": "API Key",
      "description": "Leave empty - key is stored on the connector",
      "required": false
    }
  ],
  "tempApi": {
    "userDataFields": [
      {
        "name": "service",
        "label": "Service",
        "description": "Service code (wa, go, ig, ds, tg, tw)",
        "required": true
      }
    ],
    "userDataConfigs": [
      { "name": "WhatsApp", "values": { "service": "wa" } },
      { "name": "Google", "values": { "service": "go" } },
      { "name": "Instagram", "values": { "service": "ig" } },
      { "name": "Discord", "values": { "service": "ds" } },
      { "name": "Telegram", "values": { "service": "tg" } },
      { "name": "Twitter/X", "values": { "service": "tw" } }
    ],
    "getPhoneNumber": {
      "method": "GET",
      "url": "https://resplendent-forgiveness-production-aaae.up.railway.app/getNumber?service=${userData.service}",
      "responseType": "JSON",
      "responseMapping": {
        "phoneNumber": "$.phoneNumber",
        "orderId": "$.orderId"
      }
    },
    "getMessage": {
      "method": "GET",
      "url": "https://resplendent-forgiveness-production-aaae.up.railway.app/getStatus?id=${session.orderId}",
      "responseType": "JSON",
      "responseMapping": {
        "message": "$.message"
      },
      "pendingCheck": {
        "type": "JSON_PATH",
        "path": "$.status",
        "value": "waiting"
      },
      "pollingIntervalSeconds": 5
    },
    "cancelPhoneNumber": {
      "method": "GET",
      "url": "https://resplendent-forgiveness-production-aaae.up.railway.app/setStatus?id=${session.orderId}&status=8",
      "responseType": "JSON"
    }
  }
}
