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

// Get a phone number
app.post('/getNumber', async (req, res) => {
  try {
    const service = req.body.service || 'wa';
    const text = await callSmskody({ action: 'getNumber', service });

    if (text.startsWith('ACCESS_NUMBER:')) {
      const parts = text.split(':');
      const id = parts[1];
      const number = parts[2];
      return res.json({
        success: true,
        id: id,
        number: number.startsWith('+') ? number : '+' + number
      });
    }

    res.status(400).json({ success: false, error: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check if the code arrived
app.post('/getStatus', async (req, res) => {
  try {
    const id = req.body.id;
    const text = await callSmskody({ action: 'getStatus', id });

    if (text.startsWith('STATUS_OK:')) {
      const code = text.split(':')[1];
      return res.json({ success: true, status: 'ready', code: code });
    }

    if (text === 'STATUS_WAIT_CODE' || text.includes('WAIT')) {
      return res.json({ success: true, status: 'waiting', code: null });
    }

    res.json({ success: false, error: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark number as used or cancel it
app.post('/setStatus', async (req, res) => {
  try {
    const { id, status } = req.body;
    const text = await callSmskody({ action: 'setStatus', id, status });
    res.json({ success: true, raw: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Connector is running on port', port));
