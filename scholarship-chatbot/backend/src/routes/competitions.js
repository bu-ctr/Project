const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all competitions
router.get('/competitions', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM competitions ORDER BY id ASC');
        return res.json({ competitions: result.rows });
    } catch (err) {
        console.error('Error fetching competitions:', err);
        return res.status(500).json({ error: 'Failed to fetch competitions', detail: err.message });
    }
});

// GET competition by id
router.get('/competitions/:id', async (req, res) => {
    try {
        const r = await db.query('SELECT * FROM competitions WHERE id=$1', [Number(req.params.id)]);
        if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
        return res.json({ competition: r.rows[0] });
    } catch (err) {
        console.error('fetch competition error', err);
        return res.status(500).json({ error: 'failed', detail: err.message });
    }
});

// POST create competition
router.post('/competitions', async (req, res) => {
    try {
        const { title, organizer, description, prize_money, event_date, application_url, process_steps, criteria, tags } = req.body;
        const r = await db.query(
            `INSERT INTO competitions(title, organizer, description, prize_money, event_date, application_url, process_steps, criteria, tags, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),now()) RETURNING id`,
            [title, organizer, description, prize_money || null, event_date || null, application_url || null, process_steps || null, criteria || null, tags || null]
        );
        return res.json({ ok: true, id: r.rows[0].id });
    } catch (err) {
        console.error('create competition error', err);
        return res.status(500).json({ error: 'create failed', detail: err.message });
    }
});

// PUT update competition
router.put('/competitions/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, organizer, description, prize_money, event_date, application_url, process_steps, criteria, tags } = req.body;
        await db.query(
            `UPDATE competitions SET title=$1, organizer=$2, description=$3, prize_money=$4, event_date=$5, application_url=$6, process_steps=$7, criteria=$8, tags=$9, updated_at=now() WHERE id=$10`,
            [title, organizer, description, prize_money || null, event_date || null, application_url || null, process_steps || null, criteria || null, tags || null, id]
        );
        return res.json({ ok: true });
    } catch (err) {
        console.error('update competition error', err);
        return res.status(500).json({ error: 'update failed', detail: err.message });
    }
});

// DELETE competition
router.delete('/competitions/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await db.query('DELETE FROM competitions WHERE id=$1', [id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error('delete competition error', err);
        return res.status(500).json({ error: 'delete failed', detail: err.message });
    }
});

module.exports = router;
