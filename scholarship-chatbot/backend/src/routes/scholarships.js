// backend/src/routes/scholarships.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all scholarships
router.get('/scholarships', async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, provider, description, amount, deadline, application_url, process_steps, criteria, tags FROM scholarships ORDER BY id ASC');
    return res.json({ scholarships: result.rows });
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    return res.status(500).json({ error: 'Failed to fetch scholarships', detail: err.message });
  }
});

// GET scholarship by id
router.get('/scholarships/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM scholarships WHERE id=$1', [Number(req.params.id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ scholarship: r.rows[0] });
  } catch (err) {
    console.error('fetch scholarship error', err);
    return res.status(500).json({ error: 'failed', detail: err.message });
  }
});

// POST create scholarship
router.post('/scholarships', async (req, res) => {
  try {
    const { title, provider, description, amount, deadline, application_url, process_steps, criteria, tags } = req.body;
    const r = await db.query(
      `INSERT INTO scholarships(title, provider, description, amount, deadline, application_url, process_steps, criteria, tags, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),now()) RETURNING id`,
      [title, provider, description, amount, deadline || null, application_url || null, process_steps || null, criteria || null, tags || null]
    );
    return res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error('create scholarship error', err);
    return res.status(500).json({ error: 'create failed', detail: err.message });
  }
});

// PUT update scholarship
router.put('/scholarships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, provider, description, amount, deadline, application_url, process_steps, criteria, tags } = req.body;
    await db.query(
      `UPDATE scholarships SET title=$1, provider=$2, description=$3, amount=$4, deadline=$5, application_url=$6, process_steps=$7, criteria=$8, tags=$9, updated_at=now() WHERE id=$10`,
      [title, provider, description, amount, deadline || null, application_url || null, process_steps || null, criteria || null, tags || null, id]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('update scholarship error', err);
    return res.status(500).json({ error: 'update failed', detail: err.message });
  }
});

// DELETE scholarship
router.delete('/scholarships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM scholarships WHERE id=$1', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('delete scholarship error', err);
    return res.status(500).json({ error: 'delete failed', detail: err.message });
  }
});

module.exports = router;
