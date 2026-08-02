const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY || '';
const BASE = 'https://smskody.com/api/ext';

async function callSmskody(params) {
  try {
    const response = await axios.get(BASE, {
      params: { api_key: SMSKODY_KEY, ...params },
      timeout: 12000
    });
    return String(response.data).trim();
  } catch (e) {
    return 'ERROR';
  }
}

// Simple schema
app.get('/', (req, res) => {
  res.json({
    name: "SMSKody",
    version: "1.0",
    tempApi: {
      getPhoneNumber: "/getNumber",
      getMessage: "/getStatus",
      cancelPhoneNumber: "/setStatus"
    }
  });
});

app.get('/schema', (req, res) => {
  res.json({
    name: "SMSKody",
    version: "1.0",
    tempApi: {
      getPhoneNumber: "/getNumber",
      getMessage: "/getStatus",
      cancelPhoneNumber: "/setStatus"
    }
  });
});

// Get number
app.get('/getNumber', async (req, res) => {
  const service = req.query.service || 'wa';
  const text = await callSmskody({ action: 'getNumber', service });

  if (text.startsWith('ACCESS_NUMBER:')) {
    const parts = text.split(':');
    let number = parts[2] || '';
    if (number && !number.startsWith('+')) number = '+' + number;

    return res.json({
      phoneNumber: number,
      orderId: parts[1] || ''
    });
  }

  res.status(400).json({ error: text });
});

// Get status
app.get('/getStatus', async (req, res) => {
  const id = req.query.id || '';
  const text = await callSmskody({ action: 'getStatus', id });

  if (text.startsWith('STATUS_OK:')) {
    const code = text.split(':')[1] || '';
    return res.json({ message: code, status: 'ready' });
  }

  res.json({ message: text, status: 'waiting' });
});

// Cancel
app.get('/setStatus', async (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '8';
  const text = await callSmskody({ action: 'setStatus', id, status });
  res.json({ success: true, raw: text });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
