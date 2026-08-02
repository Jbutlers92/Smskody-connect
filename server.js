const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY || '';
const BASE = 'https://smskody.com/api/ext';

// CHANGE THIS to your real Railway domain if different
const MY_DOMAIN = 'https://resplendent-forgiveness-production-aaae.up.railway.app';

async function callSmskody(params) {
  try {
    const response = await axios.get(BASE, {
      params: {
        api_key: SMSKODY_KEY,
        ...params
      },
      timeout: 15000
    });
    return String(response.data).trim();
  } catch (err) {
    return 'ERROR: ' + err.message;
  }
}

// ========== SCHEMA ==========
app.get('/', (req, res) => {
  res.json({
    name: "SMSKody",
    description: "SMSKody temporary numbers via connector",
    version: "1.0.0",
    author: "Custom",
    priceFormat
