// backend/src/routes/chatbot.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { matchProfile } = require('../services/matcher');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Optional auth middleware (does not block unauthenticated users)
function optionalAuth(req, res, next) {
    const h = req.headers.authorization;
    if (h) {
        try {
            const token = h.split(' ')[1];
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            // Ignore invalid tokens for optional auth
        }
    }
    next();
}

/**
 * POST /api/chatbot/chat
 * Accepts a message and optional profile context.
 * Returns a bot reply and, if the user is logged in, personalised scholarship matches.
 */
router.post('/chat', optionalAuth, async (req, res) => {
    try {
        const { message, profile: guestProfile } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'message string is required' });
        }

        const lower = message.toLowerCase();

        // ── Determine intent ──────────────────────────────────────────────────────
        let intent = null;
        if (lower.includes('scholarship')) intent = 'scholarship';
        else if (lower.includes('internship')) intent = 'internship';
        else if (lower.includes('competition')) intent = 'competition';
        else if (lower.includes('course')) intent = 'course';

        // ── Build reply ───────────────────────────────────────────────────────────
        let reply = '';
        let matches = [];

        if (intent === 'scholarship') {
            reply = "I'll help you find scholarships! Let me check what matches your profile.";

            // Resolve profile (logged-in user or guest)
            let profile = guestProfile || null;
            if (!profile && req.user) {
                const r = await db.query('SELECT * FROM profiles WHERE user_id=$1', [req.user.id]);
                profile = r.rows[0] || null;
            }

            if (profile) {
                const scholRes = await db.query(
                    'SELECT id, title, provider, description, amount, deadline, application_url, criteria, tags FROM scholarships'
                );
                for (const s of scholRes.rows) {
                    let criteria = s.criteria || {};
                    if (typeof criteria === 'string') {
                        try { criteria = JSON.parse(criteria); } catch (e) { criteria = {}; }
                    }
                    const m = matchProfile(profile, criteria);
                    if (m.eligible) {
                        matches.push({ ...s, score: m.score });
                    }
                }
                matches.sort((a, b) => (b.score || 0) - (a.score || 0));
                matches = matches.slice(0, 5);

                if (matches.length > 0) {
                    reply = `Great news! I found ${matches.length} scholarship${matches.length > 1 ? 's' : ''} that match your profile. Here are the top results:`;
                } else {
                    reply = "I couldn't find exact scholarship matches right now. Try completing your profile with more details (income, caste, grades) to unlock better matches!";
                }
            } else {
                reply = "To find personalised scholarships, please complete your profile or log in. You can also use the chatbot to fill in your details step by step!";
            }
        } else if (intent === 'internship') {
            reply = "Looking for internships! Head to the Internships page to browse all opportunities filtered for your field.";
        } else if (intent === 'competition') {
            reply = "Check out our Competitions page for national and international events where you can showcase your skills and win prizes!";
        } else if (intent === 'course') {
            reply = "We have a variety of courses to help you upskill. Visit the Courses section for personalised recommendations.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            reply = "Hello! 👋 I'm the EduNext AI assistant. Ask me about Scholarships, Internships, Competitions, or Courses. How can I help you today?";
        } else if (lower.includes('help')) {
            reply = "I can help you find:\n• 🎓 Scholarships – financial aid matched to your profile\n• 💼 Internships – career opportunities in your field\n• 🏆 Competitions – events to showcase your talent\n• 📚 Courses – learning paths for your career goals\n\nWhat are you interested in?";
        } else if (lower.includes('profile')) {
            reply = req.user
                ? "You can update your profile at /profile. A complete profile unlocks more personalised matches!"
                : "Please log in or sign up to manage your profile and get personalised opportunities.";
        } else {
            reply = "I'm not sure I understood that. Try asking about Scholarships, Internships, Competitions, or Courses. Type 'help' to see what I can do!";
        }

        return res.json({ reply, matches });
    } catch (err) {
        console.error('Chatbot error:', err);
        return res.status(500).json({ error: 'Chatbot service error', detail: err.message });
    }
});

/**
 * GET /api/chatbot/suggestions
 * Returns quick-reply suggestions for the chatbot UI.
 */
router.get('/suggestions', (req, res) => {
    res.json({
        suggestions: [
            'Find me scholarships',
            'Browse internships',
            'Show competitions',
            'Help'
        ]
    });
});

module.exports = router;
