// ========== GET NUMBER ==========
app.get('/getNumber', async (req, res) => {
  try {
    const service = req.query.service || 'wa';
    const text = await callSmskody({
      action: 'getNumber',
      service: service
    });

    console.log('SMSKody raw response:', text); // helpful for debugging

    if (text.startsWith('ACCESS_NUMBER:')) {
      // Better parsing
      const withoutPrefix = text.replace('ACCESS_NUMBER:', '');
      const firstColon = withoutPrefix.indexOf(':');

      if (firstColon === -1) {
        return res.status(400).json({ error: 'Invalid ACCESS_NUMBER format: ' + text });
      }

      const orderId = withoutPrefix.substring(0, firstColon).trim();
      let phoneNumber = withoutPrefix.substring(firstColon + 1).trim();

      // Clean the number
      phoneNumber = phoneNumber.replace(/[^0-9+]/g, ''); // keep only digits and +
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
