const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'db_scripts', 'add_movie_support.sql'), 'utf8');
        await client.query(sql);
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
