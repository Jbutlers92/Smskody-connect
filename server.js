const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY || '';
const BASE = 'https://smskody.com/api/ext';
const MY_DOMAIN = 'https://resplendent-forgiveness-production-aaae.up.railway.app';

async function callSmskody(params) {
  try {
    const res = await axios.get(BASE, {
      params: { api_key: SMSKODY_KEY, ...params },
      timeout: 12000
    });
    return String(res.data).trim();
  } catch (e) {
    return 'ERROR';
  }
}

app.get('/', (req, res) => {
  res.json({
    name: "SMSKody",
    description: "SMSKody temporary numbers",
    version: "1.0.0",
    author: "Custom",
    priceFormat: "USD",
    credentials: [
      {
        name: "apiKey",
        label: "API Key",
        description: "Leave empty - key is on the connector",
        required: false
      }
    ],
    tempApi: {
      userDataFields: [
        {
          name: "service",
          label: "Service",
          description: "Service code (wa, go, ig, ds, tg, tw)",
          required: true
        }
      ],
      userDataConfigs: [
        { name: "WhatsApp", values: { service: "wa" } },
        { name: "Google", values: { service: "go" } },
        { name: "Instagram", values: { service: "ig" } },
        { name: "Discord", values: { service: "ds" } },
        { name: "Telegram", values: { service: "tg" } },
        { name: "Twitter/X", values: { service: "tw" } }
      ],
      getPhoneNumber: {
        method: "GET",
        url: MY_DOMAIN + "/getNumber?service=${userData.service}",
        responseType: "JSON",
        responseMapping: {
          phoneNumber: "$.phoneNumber",
          orderId: "$.orderId"
        }
      },
      getMessage: {
        method: "GET",
        url: MY_DOMAIN + "/getStatus?id=${session.orderId}",
        responseType: "JSON",
        responseMapping: {
          message: "$.message"
        },
        pendingCheck: {
          type: "JSON_PATH",
          path: "$.status",
          value: "waiting"
        },
        pollingIntervalSeconds: 5
      },
      cancelPhoneNumber: {
        method: "GET",
        url: MY_DOMAIN + "/setStatus?id=${session.orderId}&status=8",
        responseType: "JSON"
      }
    }
  });
});

app.get('/getNumber', async (req, res) => {
  const service = req.query.service || 'wa';
  const text = await callSmskody({ action: 'getNumber', service });

  if (text.startsWith('ACCESS_NUMBER:')) {
    const parts = text.split(':');
    let number = parts[2] || '';
    if (number && !number.startsWith('+')) number = '+' + number;
    return res.json({ phoneNumber: number, orderId: parts[1] || '' });
  }
  res.status(400).json({ error: text
