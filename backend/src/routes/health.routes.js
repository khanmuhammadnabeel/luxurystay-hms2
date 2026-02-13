/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health checks
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Check if API and database are running
 *     responses:
 *       200:
 *         description: System healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: connected
 */

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