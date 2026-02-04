const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    service: 'LuxuryStay HMS API'
  });
});

module.exports = router;