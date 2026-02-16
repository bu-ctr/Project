// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { matchProfile } = require('../services/matcher');

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

// Calculate profile completion percentage
function calculateProfileCompletion(profile) {
    if (!profile) return 0;

    const fields = [
        'full_name',
        'course',
        'dob',
        'year_of_study',
        'income',
        'caste',
        'tenth_percentage',
        'twelfth_percentage',
        'last_semester_marks',
        'address_line1',
        'city',
        'state',
        'postal_code',
        'country'
    ];

    const filledFields = fields.filter(field => {
        const value = profile[field];
        return value !== null && value !== undefined && value !== '';
    });

    return Math.round((filledFields.length / fields.length) * 100);
}

// Determine next best action based on profile state
function getNextBestAction(profile, profileCompletion, totalMatches) {
    if (!profile) {
        return {
            title: "Create Your Profile",
            description: "Get started by setting up your profile to unlock personalized opportunities",
            action: "Start Now",
            link: "/profile",
            icon: "👤"
        };
    }

    if (profileCompletion < 50) {
        return {
            title: "Complete Your Profile",
            description: `You're ${profileCompletion}% done! Complete your profile to unlock more matches`,
            action: "Complete Profile",
            link: "/profile",
            icon: "✏️"
        };
    }

    if (totalMatches === 0) {
        return {
            title: "Update Your Preferences",
            description: "Adjust your profile details to discover more opportunities",
            action: "Update Profile",
            link: "/profile",
            icon: "🔧"
        };
    }

    if (totalMatches > 0 && totalMatches < 5) {
        return {
            title: "Explore Your Matches",
            description: `You have ${totalMatches} personalized ${totalMatches === 1 ? 'opportunity' : 'opportunities'} waiting!`,
            action: "View Matches",
            link: "/scholarships",
            icon: "🎯"
        };
    }

    return {
        title: "Start Applying",
        description: `Amazing! You've matched with ${totalMatches} opportunities. Time to apply!`,
        action: "See All Matches",
        link: "/scholarships",
        icon: "🚀"
    };
}

// Get missing critical fields
function getMissingFields(profile) {
    if (!profile) return ['All profile fields'];

    const criticalFields = [
        { key: 'course', label: 'Course' },
        { key: 'year_of_study', label: 'Year of Study' },
        { key: 'tenth_percentage', label: '10th Grade %' },
        { key: 'twelfth_percentage', label: '12th Grade %' },
        { key: 'income', label: 'Family Income' }
    ];

    return criticalFields
        .filter(({ key }) => {
            const value = profile[key];
            return value === null || value === undefined || value === '';
        })
        .map(({ label }) => label);
}

// GET /api/dashboard/stats - Get personalized dashboard stats
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user profile
        const profileRes = await db.query('SELECT * FROM profiles WHERE user_id=$1', [userId]);
        const profile = profileRes.rows[0] || null;

        // Calculate profile completion
        const profileCompletion = calculateProfileCompletion(profile);

        if (!profile) {
            return res.json({
                profileCompletion,
                opportunitiesAvailable: 0,
                matchesFound: 0,
                newMatchesToday: 0,
                recommendations: [],
                nextBestAction: getNextBestAction(null, 0, 0),
                missingFields: getMissingFields(null)
            });
        }

        // Get all scholarships and count matches
        const scholarshipsRes = await db.query('SELECT id, title, description, criteria, amount FROM scholarships');
        const scholarships = scholarshipsRes.rows;

        let matchedScholarships = [];
        let totalScore = 0;

        for (const scholarship of scholarships) {
            let criteria = scholarship.criteria || {};
            if (typeof criteria === 'string') {
                try {
                    criteria = JSON.parse(criteria);
                } catch (e) {
                    criteria = {};
                }
            }

            const match = matchProfile(profile, criteria);
            if (match.eligible) {
                matchedScholarships.push({
                    id: scholarship.id,
                    title: scholarship.title,
                    description: scholarship.description,
                    amount: scholarship.amount,
                    score: match.score
                });
                totalScore += match.score;
            }
        }

        // Sort by score descending
        matchedScholarships.sort((a, b) => b.score - a.score);

        // Get internships 
        const internshipsRes = await db.query('SELECT id, title, company, stipend FROM internships LIMIT 100');
        const internshipsCount = internshipsRes.rowCount || 0;

        // Get courses
        const coursesRes = await db.query('SELECT id, title FROM courses LIMIT 100');
        const coursesCount = coursesRes.rowCount || 0;

        // Count matches from last 24 hours (using notifications as proxy)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newMatchesRes = await db.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND created_at >= $2',
            [userId, oneDayAgo]
        );
        const newMatchesToday = parseInt(newMatchesRes.rows[0]?.count || 0);

        // Generate top recommendations (top 3 matches)
        const recommendations = matchedScholarships.slice(0, 3).map(s => ({
            type: 'scholarship',
            title: s.title,
            description: s.description,
            amount: s.amount,
            id: s.id,
            matchScore: Math.round(s.score)
        }));

        // Total opportunities (scholarships + internships + courses)
        const totalOpportunities = scholarships.length + internshipsCount + coursesCount;
        const totalMatches = matchedScholarships.length;

        // Get next best action
        const nextBestAction = getNextBestAction(profile, profileCompletion, totalMatches);

        // Get missing fields
        const missingFields = getMissingFields(profile);

        res.json({
            profileCompletion,
            opportunitiesAvailable: totalOpportunities,
            matchesFound: totalMatches,
            newMatchesToday,
            recommendations,
            nextBestAction,
            missingFields,
            stats: {
                scholarshipsMatched: matchedScholarships.length,
                internshipsAvailable: internshipsCount,
                coursesAvailable: coursesCount
            }
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats', detail: err.message });
    }
});

module.exports = router;
