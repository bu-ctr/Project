// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Auth middleware
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No authorization token' });
  try {
    req.user = jwt.verify(h.split(' ')[1], JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/notifications - Fetch all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await db.query(
      `SELECT n.*, s.title as scholarship_title 
       FROM notifications n 
       LEFT JOIN scholarships s ON s.id = n.scholarship_id 
       WHERE n.user_id=$1 
       ORDER BY n.created_at DESC`,
      [userId]
    );
    return res.json({ notifications: r.rows });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id=$1 AND read=false',
      [userId]
    );
    return res.json({ count: parseInt(r.rows[0].count) });
  } catch (err) {
    console.error('Get unread count error:', err);
    return res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    await db.query(
      'UPDATE notifications SET read = true WHERE id=$1 AND user_id=$2',
      [id, userId]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query(
      'UPDATE notifications SET read = true WHERE user_id=$1 AND read=false',
      [userId]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'DELETE FROM notifications WHERE id=$1 AND user_id=$2',
      [id, userId]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// POST /api/notifications/mark-read - Legacy support (backwards compatible)
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;
    await db.query(
      'UPDATE notifications SET read = true WHERE id=$1 AND user_id=$2',
      [id, userId]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

module.exports = router;
