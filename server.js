const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SMSKODY_KEY = process.env.SMSKODY_KEY;
const BASE = 'https://smskody.com/api/ext';

async function callSmskody(params) {
  const { data } = await axios.get(BASE, {
    params: { api_key: SMSKODY_KEY, ...params },
    timeout: 15000
  });
  return String(data).trim();
}

// Schema endpoint
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

// Get phone number - returns clean JSON for AYCD
app.post('/getNumber', async (req, res) => {
  try {
    const service = req.body.service || req.query.service || 'wa';
    const text = await callSmskody({ action: 'getNumber', service });

    if (text.startsWith('ACCESS_NUMBER:')) {
      const parts = text.split(':');
      const orderId = parts[1];
      let phoneNumber = parts[2];
      if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;

      return res.json({
        phoneNumber: phoneNumber,
        orderId: orderId
      });
    }

    res.status(400).json({ error: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Also support GET for the same endpoint
app.get('/getNumber', async (req, res) => {
  try {
    const service = req.query.service || 'wa';
    const text = await callSmskody({ action: 'getNumber', service });

    if (text.startsWith('ACCESS_NUMBER:')) {
      const parts = text.split(':');
      const orderId = parts[1];
      let phoneNumber = parts[2];
      if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;

      return res.json({
        phoneNumber: phoneNumber,
        orderId: orderId
      });
    }

    res.status(400).json({ error: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get status / message
app.get('/getStatus', async (req, res) => {
  try {
    const id = req.query.id || req.query.orderId;
    const text = await callSmskody({ action: 'getStatus', id });

    if (text.startsWith('STATUS_OK:')) {
      const code = text.split(':')[1];
      return res.json({
        message: code,
        code: code,
        status: 'ready'
      });
    }

    // Still waiting
    res.json({
      message: text,
      status: 'waiting'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/getStatus', async (req, res) => {
  try {
    const id = req.body.id || req.body.orderId;
    const text = await callSmskody({ action: 'getStatus', id });

    if (text.startsWith('STATUS_OK:')) {
      const code = text.split(':')[1];
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel
app.get('/setStatus', async (req, res) => {
  try {
    const id = req.query.id || req.query.orderId;
    const status = req.query.status || 8;
    const text = await callSmskody({ action: 'setStatus', id, status });
    res.json({ success: true, raw: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/setStatus', async (req, res) => {
  try {
    const id = req.body.id || req.body.orderId;
    const status = req.body.status || 8;
    const text = await callSmskody({ action: 'setStatus', id, status });
    res.json({ success: true, raw: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Connector running on port', port));
