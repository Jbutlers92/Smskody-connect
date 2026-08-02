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

// Schema that AYCD accepts
app.get('/', (req, res) => {
  res.json({
    name: "SMSKody",
    version: "1.0",
    tempApi: {
      getNumber: "/getNumber",
      getStatus: "/getStatus",
      setStatus: "/setStatus"
    }
  });
});

app.get('/schema', (req, res) => {
  res.json({
    name: "SMSKody",
    version: "1.0",
    tempApi: {
      getNumber: "/getNumber",
      getStatus: "/getStatus",
      setStatus: "/setStatus"
    }
  });
});

// Get a phone number
app.post('/getNumber', async (req, res) => {
  try {
    const service = req.body.service || 'wa';
    const text = await callSmskody({ action: 'getNumber', service });

    if (text.startsWith('ACCESS_NUMBER:')) {
      const parts = text.split(':');
      return res.json({
        success: true,
        id: parts[1],
        number: parts[2].startsWith('+') ? parts[2] : '+' + parts[2]
      });
    }

    res.status(400).json({ success: false, error: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check status / get code
app.post('/getStatus', async (req, res) => {
  try {
    const id = req.body.id;
    const text = await callSmskody({ action: 'getStatus', id });

    if (text.startsWith('STATUS_OK:')) {
      return res.json({ success: true, status: 'ready', code: text.split(':')[1] });
    }

    if (text.includes('WAIT')) {
      return res.json({ success: true, status: 'waiting', code: null });
    }

    res.json({ success: false, error: text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Set status
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
app.listen(port, () => console.log('Connector running on port', port));
