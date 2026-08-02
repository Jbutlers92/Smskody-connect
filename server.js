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

// ========== GET NUMBER ==========
app.get('/getNumber', async (req, res) => {
  try {
    const service = req.query.service || 'wa';
    const text = await callSmskody({
      action: 'getNumber',
      service: service
    });

    console.log('SMSKody raw response:', text);

    if (text.startsWith('ACCESS_NUMBER:')) {
      const withoutPrefix = text.replace('ACCESS_NUMBER:', '');
      const firstColon = withoutPrefix.indexOf(':');

      if (firstColon === -1) {
        return res.status(400).json({ error: 'Invalid ACCESS_NUMBER format: ' + text });
      }

      const orderId = withoutPrefix.substring(0, firstColon).trim();
      let phoneNumber = withoutPrefix.substring(firstColon + 1).trim();

      // Clean the number
      phoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }

      return res.json({
        phoneNumber: phoneNumber,
        orderId: orderId
      });
    }

    return res.status(400).json({
      error: text
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
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
