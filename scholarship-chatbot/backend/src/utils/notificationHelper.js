// backend/src/utils/notificationHelper.js
const db = require('../db');

/**
 * Create a notification for a user
 * @param {number} userId - User ID
 * @param {string} type - Notification type (deadline_reminder, new_scholarship, etc.)
 * @param {object} payload - Notification data (title, message, etc.)
 * @param {number|null} scholarshipId - Optional scholarship ID
 */
async function createNotification(userId, type, payload, scholarshipId = null) {
    try {
        const result = await db.query(
            `INSERT INTO notifications (user_id, type, payload, scholarship_id, read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
            [userId, type, JSON.stringify(payload), scholarshipId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
}

/**
 * Get unread notification count for a user
 * @param {number} userId - User ID
 * @returns {number} - Count of unread notifications
 */
async function getUnreadCount(userId) {
    try {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id=$1 AND read=false',
            [userId]
        );
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Get unread count error:', error);
        return 0;
    }
}

/**
 * Create a deadline reminder notification
 * @param {number} userId - User ID
 * @param {object} scholarship - Scholarship object
 * @param {number} daysLeft - Days until deadline
 */
async function createDeadlineReminder(userId, scholarship, daysLeft) {
    const payload = {
        title: 'Scholarship Deadline Approaching',
        message: `The "${scholarship.title}" scholarship deadline is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
        deadline: scholarship.deadline,
        daysLeft: daysLeft,
        actionUrl: `/scholarships/${scholarship.id}`
    };

    return createNotification(userId, 'deadline_reminder', payload, scholarship.id);
}

/**
 * Create a new scholarship match notification
 * @param {number} userId - User ID
 * @param {object} scholarship - Scholarship object
 * @param {number} matchScore - Match score percentage
 */
async function createScholarshipMatch(userId, scholarship, matchScore) {
    const payload = {
        title: 'New Scholarship Match!',
        message: `"${scholarship.title}" matches your profile (${matchScore}% match)`,
        matchScore: matchScore,
        actionUrl: `/scholarships/${scholarship.id}`
    };

    return createNotification(userId, 'new_scholarship', payload, scholarship.id);
}

/**
 * Create an application status update notification
 * @param {number} userId - User ID
 * @param {object} scholarship - Scholarship object
 * @param {string} status - New status
 */
async function createApplicationUpdate(userId, scholarship, status) {
    const statusMessages = {
        submitted: 'Your application has been submitted successfully',
        under_review: 'Your application is now under review',
        accepted: '🎉 Congratulations! Your application has been accepted',
        rejected: 'Your application status has been updated'
    };

    const payload = {
        title: 'Application Status Update',
        message: statusMessages[status] || 'Your application status has changed',
        status: status,
        scholarshipTitle: scholarship.title,
        actionUrl: `/applications`
    };

    return createNotification(userId, 'application_update', payload, scholarship.id);
}

/**
 * Create a profile incomplete reminder
 * @param {number} userId - User ID
 * @param {array} missingFields - Array of missing field names
 */
async function createProfileReminder(userId, missingFields) {
    const payload = {
        title: 'Complete Your Profile',
        message: `Please complete your profile to get better scholarship matches. Missing: ${missingFields.join(', ')}`,
        missingFields: missingFields,
        actionUrl: '/profile'
    };

    return createNotification(userId, 'profile_incomplete', payload, null);
}

module.exports = {
    createNotification,
    getUnreadCount,
    createDeadlineReminder,
    createScholarshipMatch,
    createApplicationUpdate,
    createProfileReminder
};
