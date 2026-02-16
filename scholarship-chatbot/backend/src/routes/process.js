// backend/src/routes/process.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { extractProcessFromUrl } = require('../services/processExtractor');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'no auth' });
  const token = h.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// POST /api/scholarships/:id/fetch-process
router.post('/scholarships/:id/fetch-process', auth, async (req, res) => {
  const scholarshipId = Number(req.params.id);
  try {
    const sQ = await db.query('SELECT id, title, application_url FROM scholarships WHERE id=$1', [scholarshipId]);
    if (sQ.rows.length === 0) return res.status(404).json({ error: 'scholarship not found' });
    const sch = sQ.rows[0];
    if (!sch.application_url) return res.status(400).json({ error: 'no application_url for this scholarship' });

    const extracted = await extractProcessFromUrl(sch.application_url, sch.title);
    if (!extracted || !Array.isArray(extracted.steps) || extracted.steps.length === 0) {
      return res.status(500).json({ error: 'failed to extract steps', raw: extracted && extracted.raw });
    }

    // store steps (as JSONB)
    await db.query('UPDATE scholarships SET process_steps = $1, updated_at = now() WHERE id=$2', [JSON.stringify(extracted.steps), scholarshipId]);
    return res.json({ ok: true, steps: extracted.steps });
  } catch (err) {
    console.error('fetch-process error', err);
    return res.status(500).json({ error: 'fetch failed', detail: err.message });
  }
});

module.exports = router;
