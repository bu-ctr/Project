// backend/src/routes/match.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { matchProfile } = require('../services/matcher');

console.log('🔥 PUBLIC MATCH ROUTE LOADED');

router.post('/match', async (req, res) => {
  try {
    const profile = req.body.profile;
    if (!profile || typeof profile !== 'object') return res.status(400).json({ error: 'profile object required in request body' });

    const q = await db.query('SELECT id, title, provider, description, amount, deadline, application_url, process_steps, criteria, tags FROM scholarships');
    const matches = [];

    for (const s of q.rows) {
      let criteria = s.criteria;
      if (criteria && typeof criteria === 'string') {
        try { criteria = JSON.parse(criteria); } catch (e) { }
      }
      let out;
      try { out = matchProfile(profile, criteria || {}); } catch (err) { console.warn('matcher error', err && err.message); continue; }
      if (out && out.eligible) {
        matches.push({
          scholarship: {
            id: s.id, title: s.title, provider: s.provider, description: s.description, amount: s.amount,
            deadline: s.deadline, application_url: s.application_url, process_steps: s.process_steps, tags: s.tags
          },
          score: out.score || 0
        });
      }
    }

    matches.sort((a,b) => (b.score||0) - (a.score||0));
    return res.json({ matches });
  } catch (err) {
    console.error('match endpoint error', err);
    return res.status(500).json({ error: 'server error', detail: err.message });
  }
});

module.exports = router;
