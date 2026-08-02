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
    version: "1.0",
    tempApi: {
      getPhoneNumber: MY_DOMAIN + "/getNumber",
      getMessage: MY_DOMAIN + "/getStatus",
      cancelPhoneNumber: MY_DOMAIN + "/setStatus"
    }
  });
});

app.get('/getNumber', async (req, res) => {
  const service = req.query.service || 'wa';
  const text = await callSmskody({ action: 'getNumber', service });

  console.log('Raw from SMSKody:', text);

  if (text.startsWith('ACCESS_NUMBER:')) {
    // More careful split
    const parts = text.split(':');
    
    // parts[0] = "ACCESS_NUMBER"
    // parts[1] = orderId
    // parts[2] and after = the number (in case number has extra colons)
    
    const orderId = parts[1] || '';
    let number = parts.slice(2).join(':') || '';  // join in case of extra colons
    
    // Clean number
    number = number.replace(/[^0-9+]/g, '');
    if (number && !number.startsWith('+')) {
      number = '+' + number;
    }

    return res.json({
      phoneNumber: number,
      orderId: orderId
    });
  }

  res.status(400).json({ error: text });
});

app.get('/getStatus', async (req, res) => {
  const id = req.query.id || '';
  const text = await callSmskody({ action: 'getStatus', id });

  if (text.startsWith('STATUS_OK:')) {
    return res.json({ message: text.split(':')[1] || '', status: 'ready' });
  }
  res.json({ message: text, status: 'waiting' });
});

app.get('/setStatus', async (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '8';
  const text = await callSmskody({ action: 'setStatus', id, status });
  res.json({ success: true, raw: text });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Running on port ' + port));
