app.get('/getStatus', async (req, res) => {
  const id = req.query.id || '';
  const text = await callSmskody({ action: 'getStatus', id });

  console.log('SMSKody status:', text);

  if (text.startsWith('STATUS_OK:')) {
    const code = text.split(':')[1] || '';
    return res.json({
      message: code,
      code: code,
      status: 'ready',
      smsCode: code
    });
  }

  // Still waiting
  return res.json({
    message: text,
    status: 'waiting'
  });
});
