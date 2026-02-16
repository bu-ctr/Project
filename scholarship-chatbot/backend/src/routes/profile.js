// backend/src/routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { matchProfile } = require('../services/matcher');
const { sendEligibilityEmail } = require('../services/mailer');

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

// get profile
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const r = await db.query('SELECT * FROM profiles WHERE user_id=$1', [userId]);
  res.json({ profile: r.rows[0] || null });
});

// update profile and run matching -> create notifications
router.put('/', auth, async (req, res) => {
  const userId = req.user.id;
  const p = req.body || {};

  try {
    const {
      full_name,
      course,
      date_of_birth,
      year_of_study,
      income,
      caste,
      disability,
      disability_details,
      tenth_marks,
      tenth_percentage,
      twelfth_marks,
      twelfth_percentage,
      last_semester_marks,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country
    } = req.body;

    // Dynamic UPSERT query builder
    const cols = ['user_id'];
    const values = [userId];
    const updateClauses = [];
    let idx = 2; // $1 is userId

    // Helper to add field if present
    const addField = (col, val) => {
      // Treat undefined as "do not update"
      if (val === undefined) return;

      // Treat empty string as null (for numeric/date fields coming from forms)
      const dbVal = (val === "") ? null : val;

      cols.push(col);
      values.push(dbVal);
      updateClauses.push(`${col} = $${idx++}`);
    };

    // Map request body to DB columns
    addField('full_name', full_name);
    addField('course', course);

    // handle 'dob' mapping
    if (req.body.dob !== undefined) addField('dob', req.body.dob);
    else if (req.body.date_of_birth !== undefined) addField('dob', req.body.date_of_birth);

    addField('year_of_study', year_of_study);
    addField('income', income);
    addField('caste', caste);
    addField('disability', disability);
    addField('disability_details', disability_details);
    addField('tenth_marks', tenth_marks);
    addField('tenth_percentage', tenth_percentage);
    addField('twelfth_marks', twelfth_marks);
    addField('twelfth_percentage', twelfth_percentage);
    addField('last_semester_marks', last_semester_marks);
    addField('address_line1', address_line1);
    addField('address_line2', address_line2);
    addField('city', city);
    addField('state', state);
    addField('postal_code', postal_code);
    addField('country', country);

    // If only user_id is present (no data fields), just ensure profile exists
    if (cols.length === 1) {
      await db.query(`INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [userId]);
      return res.json({ ok: true, message: "Profile ensured, no updates" });
    }

    // Construct UPSERT statement
    // INSERT INTO profiles (...) VALUES (...) ON CONFLICT (user_id) DO UPDATE SET ...
    const sql = `
      INSERT INTO profiles (${cols.join(', ')})
      VALUES (${cols.map((_, i) => '$' + (i + 1)).join(', ')})
      ON CONFLICT (user_id) 
      DO UPDATE SET ${updateClauses.join(', ')}
    `;

    await db.query(sql, values);

    // ... matching logic ...


    // run matching against all scholarships and create notifications for newly eligible scholarships
    const scholarships = (await db.query('SELECT id, title, description, criteria FROM scholarships')).rows;
    const profileRes = (await db.query('SELECT * FROM profiles WHERE user_id=$1', [userId])).rows[0];

    for (const s of scholarships) {
      let criteria = s.criteria || {};
      if (typeof criteria === 'string') {
        try { criteria = JSON.parse(criteria); } catch (e) { }
      }
      const m = matchProfile(profileRes, criteria || {});
      if (m.eligible) {
        const exists = await db.query('SELECT id FROM notifications WHERE user_id=$1 AND scholarship_id=$2', [userId, s.id]);
        if (exists.rows.length === 0) {
          await db.query('INSERT INTO notifications(user_id, scholarship_id, type, payload, read, created_at) VALUES($1,$2,$3,$4,$5,now())', [userId, s.id, 'eligible', JSON.stringify({ title: s.title }), false]);
          try {
            const u = (await db.query('SELECT email FROM users WHERE id=$1', [userId])).rows[0];
            if (u && u.email) await sendEligibilityEmail(u.email, s);
          } catch (e) {
            console.warn('Email error:', e && e.message);
          }
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('profile update error', err);
    res.status(500).json({ error: 'profile update failed', detail: err.message });
  }
});

// DELETE account
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query('BEGIN');

    await db.query('DELETE FROM notifications WHERE user_id=$1', [userId]);
    await db.query('DELETE FROM profiles WHERE user_id=$1', [userId]);
    await db.query('DELETE FROM users WHERE id=$1', [userId]);

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('delete account error:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;

