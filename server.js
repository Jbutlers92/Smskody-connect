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

  console.log('getNumber response:', text);

  if (text.startsWith('ACCESS_NUMBER:')) {
    const parts = text.split(':');
    let number = parts[2] || '';
    if (number && !number.startsWith('+')) number = '+' + number;
    return res.json({ phoneNumber: number, orderId: parts[1] || '' });
  }
  res.status(400).json({ error: text });
});

app.get('/getStatus', async (req, res) => {
  const id = req.query.id || '';
  console.log('getStatus called with id:', id);

  const text = await callSmskody({ action: 'getStatus', id });
  console.log('getStatus raw response:', text);

  if (text.startsWith('STATUS_OK:')) {
    const code = text.split(':')[1] || '';
    return res.json({
      message: code,
      code: code,
      status: 'ready'
    });
  }

  res.json({
    message: text,
    status: 'waiting'
  });
});

app.get('/setStatus', async (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '8';
  const text = await callSmskody({ action: 'setStatus', id, status });
  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Running'));
