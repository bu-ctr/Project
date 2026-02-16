// Script to create sample notifications for testing
// Run with: node backend/src/scripts/createSampleNotifications.js

require('dotenv').config();
const db = require('../db');
const {
    createDeadlineReminder,
    createScholarshipMatch,
    createApplicationUpdate,
    createProfileReminder
} = require('../utils/notificationHelper');

async function createSampleNotifications() {
    try {
        console.log('Creating sample notifications...');

        // Get a user to test with (you'll need an actual user ID)
        const userResult = await db.query('SELECT id FROM users LIMIT 1');

        if (userResult.rows.length === 0) {
            console.error('No users found. Please create a user first.');
            return;
        }

        const userId = userResult.rows[0].id;
        console.log(`Creating notifications for user ID: ${userId}`);

        // Get a scholarship to reference (or create sample data)
        const scholarshipResult = await db.query('SELECT id, title, deadline FROM scholarships LIMIT 1');
        let scholarship;

        if (scholarshipResult.rows.length > 0) {
            scholarship = scholarshipResult.rows[0];
        } else {
            // Create a sample scholarship
            const insertResult = await db.query(
                `INSERT INTO scholarships (title, provider, description, amount, deadline, application_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, deadline`,
                [
                    'Merit-Based Excellence Scholarship',
                    'National Education Foundation',
                    'Scholarship for high-achieving students with GPA above 3.5',
                    '$5,000',
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    'https://example.com/apply'
                ]
            );
            scholarship = insertResult.rows[0];
            console.log('Created sample scholarship:', scholarship.title);
        }

        // 1. Create deadline reminder notification
        console.log('Creating deadline reminder...');
        await createDeadlineReminder(userId, scholarship, 7);

        // 2. Create new scholarship match notification
        console.log('Creating scholarship match...');
        await createScholarshipMatch(userId, scholarship, 85);

        // 3. Create application update notification
        console.log('Creating application update...');
        await createApplicationUpdate(userId, scholarship, 'under_review');

        // 4. Create profile incomplete reminder
        console.log('Creating profile reminder...');
        await createProfileReminder(userId, ['GPA', 'Date of Birth', 'Address']);

        // 5. Create some generic notifications directly
        console.log('Creating additional notifications...');

        await db.query(
            `INSERT INTO notifications (user_id, type, payload, scholarship_id, read, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
                userId,
                'new_scholarship',
                JSON.stringify({
                    title: 'New Opportunity Available!',
                    message: 'A new STEM scholarship worth $10,000 has been added that matches your profile',
                    actionUrl: '/scholarships'
                }),
                scholarship.id,
                false
            ]
        );

        await db.query(
            `INSERT INTO notifications (user_id, type, payload, scholarship_id, read, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days')`,
            [
                userId,
                'deadline_reminder',
                JSON.stringify({
                    title: 'Deadline Alert',
                    message: 'The application deadline for International Student Scholarship is tomorrow!',
                    daysLeft: 1,
                    actionUrl: '/scholarships'
                }),
                scholarship.id,
                true // This one is already read
            ]
        );

        console.log('\n✅ Sample notifications created successfully!');
        console.log(`Total notifications created for user ${userId}`);

        // Show what was created
        const notifications = await db.query(
            'SELECT id, type, read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',
            [userId]
        );

        console.log(`\nCreated ${notifications.rows.length} notifications:`);
        notifications.rows.forEach(n => {
            console.log(`- ${n.type} (${n.read ? 'read' : 'unread'}) - ${n.created_at}`);
        });

    } catch (error) {
        console.error('Error creating sample notifications:', error);
    } finally {
        await db.end();
    }
}

// Run the script
createSampleNotifications();
