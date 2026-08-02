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
    version: "1
