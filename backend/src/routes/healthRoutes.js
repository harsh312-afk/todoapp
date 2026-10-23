const express = require('express');
const router = express.Router();
const { isDbConnected } = require('../config/db');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected' : 'in-memory-fallback',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
