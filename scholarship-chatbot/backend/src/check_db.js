const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        const res = await pool.query('SELECT * FROM profiles LIMIT 0');
        console.log('COLUMNS:', res.fields.map(f => f.name).join(', '));
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        pool.end();
    }
}

check();
