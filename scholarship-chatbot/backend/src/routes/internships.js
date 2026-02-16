const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all internships
router.get('/internships', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM internships ORDER BY id ASC');
    return res.json({ internships: result.rows });
  } catch (err) {
    console.error('Error fetching internships:', err);
    return res.status(500).json({ error: 'Failed to fetch internships', detail: err.message });
  }
});

// GET internship by id
router.get('/internships/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM internships WHERE id=$1', [Number(req.params.id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ internship: r.rows[0] });
  } catch (err) {
    console.error('fetch internship error', err);
    return res.status(500).json({ error: 'failed', detail: err.message });
  }
});

// POST create internship
router.post('/internships', async (req, res) => {
  try {
    const { title, company, description, stipend, deadline, application_url, process_steps, criteria, tags } = req.body;
    const r = await db.query(
      `INSERT INTO internships(title, company, description, stipend, deadline, application_url, process_steps, criteria, tags, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),now()) RETURNING id`,
      [title, company, description, stipend, deadline || null, application_url || null, process_steps || null, criteria || null, tags || null]
    );
    return res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error('create internship error', err);
    return res.status(500).json({ error: 'create failed', detail: err.message });
  }
});

// PUT update internship
router.put('/internships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, company, description, stipend, deadline, application_url, process_steps, criteria, tags } = req.body;
    await db.query(
      `UPDATE internships SET title=$1, company=$2, description=$3, stipend=$4, deadline=$5, application_url=$6, process_steps=$7, criteria=$8, tags=$9, updated_at=now() WHERE id=$10`,
      [title, company, description, stipend, deadline || null, application_url || null, process_steps || null, criteria || null, tags || null, id]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('update internship error', err);
    return res.status(500).json({ error: 'update failed', detail: err.message });
  }
});

// DELETE internship
router.delete('/internships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM internships WHERE id=$1', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('delete internship error', err);
    return res.status(500).json({ error: 'delete failed', detail: err.message });
  }
});

module.exports = router;
