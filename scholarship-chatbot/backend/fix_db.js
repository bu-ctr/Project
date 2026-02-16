// Simple database migration to fix Google Sign-In
const { Pool } = require('pg');

// Get DATABASE_URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:Manchester@localhost:5432/scholarship_db';

const pool = new Pool({
    connectionString: DATABASE_URL
});

async function runMigration() {
    try {
        console.log('🔍 Connecting to database...');

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

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
        await pool.end();
        process.exit(1);
    }
}

runMigration();
