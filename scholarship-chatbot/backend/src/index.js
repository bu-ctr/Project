// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const scholarshipsRoutes = require('./routes/scholarships');
const matchRoutes = require('./routes/match');
const processRoutes = require('./routes/process');
const notificationsRoutes = require('./routes/notifications');
const internshipsRoutes = require('./routes/internships');
const competitionsRoutes = require('./routes/competitions');
const dashboardRoutes = require('./routes/dashboard');
const gpaRoutes = require('./routes/gpa');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});


// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', scholarshipsRoutes); // includes GET /api/scholarships and POST /api/scholarships
app.use('/api', matchRoutes); // POST /api/match
app.use('/api', processRoutes); // POST /api/scholarships/:id/fetch-process
app.use('/api/notifications', notificationsRoutes);
app.use('/api', internshipsRoutes);
app.use('/api', competitionsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gpa', gpaRoutes);

// fallback 404 for /api/*
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

async function ensureSchema() {
  try {
    const queries = [
      // Profile columns
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS caste TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disability BOOLEAN DEFAULT FALSE",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disability_details TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line2 TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenth_marks NUMERIC(5,2)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenth_percentage NUMERIC(5,2)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twelfth_marks NUMERIC(6,2)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twelfth_percentage NUMERIC(5,2)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_semester_marks NUMERIC(5,2)",
      // User auth columns for Google Sign-In
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)"
    ];
    for (const q of queries) {
      await db.query(q);
    }
    console.log("Schema verification passed (columns ensured)");
  } catch (err) {
    console.error("Schema verification failed:", err.message);
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await ensureSchema();
  console.log(`Backend listening on ${PORT}`);
});
