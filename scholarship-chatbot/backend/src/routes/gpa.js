const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authenticate(req, res, next) {
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

// Get all GPA calculations for user
router.get('/calculations', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT * FROM gpa_calculations 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ calculations: result.rows });
    } catch (error) {
        console.error('Error fetching GPA calculations:', error);
        res.status(500).json({ error: 'Failed to fetch calculations' });
    }
});

// Get latest calculation
router.get('/latest', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT * FROM gpa_calculations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ calculation: null });
        }

        res.json({ calculation: result.rows[0] });
    } catch (error) {
        console.error('Error fetching latest calculation:', error);
        res.status(500).json({ error: 'Failed to fetch latest calculation' });
    }
});

// Save new calculation
router.post('/calculations', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            calculationType,
            semesterName,
            gradingScale,
            courses,
            totalCredits,
            totalGradePoints,
            gpa,
            previousCgpa,
            previousCredits
        } = req.body;

        // Validate required fields
        if (!calculationType || !gradingScale || !courses || !totalCredits || !gpa) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await db.query(
            `INSERT INTO gpa_calculations 
       (user_id, calculation_type, semester_name, grading_scale, courses, 
        total_credits, total_grade_points, gpa, previous_cgpa, previous_credits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [
                userId,
                calculationType,
                semesterName,
                gradingScale,
                JSON.stringify(courses),
                totalCredits,
                totalGradePoints,
                gpa,
                previousCgpa || null,
                previousCredits || null
            ]
        );

        res.json({ calculation: result.rows[0], message: 'Calculation saved successfully' });
    } catch (error) {
        console.error('Error saving calculation:', error);
        res.status(500).json({ error: 'Failed to save calculation' });
    }
});

// Delete calculation
router.delete('/calculations/:id', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const calculationId = req.params.id;

        // Verify ownership
        const check = await db.query(
            'SELECT user_id FROM gpa_calculations WHERE id = $1',
            [calculationId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Calculation not found' });
        }

        if (check.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.query('DELETE FROM gpa_calculations WHERE id = $1', [calculationId]);

        res.json({ ok: true, message: 'Calculation deleted' });
    } catch (error) {
        console.error('Error deleting calculation:', error);
        res.status(500).json({ error: 'Failed to delete calculation' });
    }
});

module.exports = router;
