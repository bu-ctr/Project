// Run GPA calculations table migration
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log('Running GPA calculations migration...');

        const sqlPath = path.join(__dirname, '../../../infra/gpa_calculations.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('   - gpa_calculations table created');
        console.log('   - Indexes created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
