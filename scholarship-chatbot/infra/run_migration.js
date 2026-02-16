// Database migration script to fix Google Sign-In
// Run with: node infra/run_migration.js

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log('🔍 Checking database connection...');

        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected');

        console.log('🔧 Running migration: Allow NULL password_hash for Google Sign-In users...');

        // Run the migration
        await pool.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('🎉 Google Sign-In is now ready to use!');
        console.log('   Try signing in at: http://localhost:5173/login');

        process.exit(0);
    } catch (error) {
        if (error.code === '42703') {
            console.log('ℹ️  Column constraint already removed or does not exist');
            console.log('✅ No migration needed - you\'re good to go!');
            process.exit(0);
        } else {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        }
    }
}

runMigration();
