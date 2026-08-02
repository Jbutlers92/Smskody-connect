const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY || '';
const BASE = 'https://smskody.com/api/ext';

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

app.get('/', (req, res) => res.json({ name: "SMSKody", version: "1.0" }));

app.get('/getNumber', async (req, res) => {
  const service = req.query.service || 'wa';
  const text = await callSmskody({ action: 'getNumber', service });

  if (text.startsWith('ACCESS_NUMBER:')) {
    const parts = text.split(':');
    let number = parts[2] || '';
    if (number && !number.startsWith('+')) number = '+' + number;
    return res.json({ phoneNumber: number, orderId
