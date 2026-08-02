const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY;
const BASE = 'https://smskody.com/api/ext';
const MY_DOMAIN = 'https://resplendent-forgiveness-production-aaae.up.railway.app';

async function callSmskody(params) {
  const { data } = await axios.get(BASE, {
    params: { api_key: SMSKODY_KEY, ...params },
    timeout: 15000
  });
  return String(data).trim();
}

// Full schema for AYCD
app.get('/', (req, res) => {
  res.json({
    name: "SMSKody",
    description: "SMSKody via custom connector",
    version: "1.0.0",
    author: "Custom",
    priceFormat: "USD",
    credentials: [
      {
        name: "apiKey",
        label: "API Key",
        description: "Not needed - key is stored on the connector",
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
        { name: "WhatsApp",
