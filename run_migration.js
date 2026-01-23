const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to get connection string
const envPath = path.join(__dirname, '.env.local');
let connectionString = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres'; // Fallback

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        // Look for typicalSupabase keys
        // Usually POSTGRES_URL or DATABASE_URL
        if (line.trim().startsWith('POSTGRES_URL=')) {
            connectionString = line.trim().split('=', 2)[1].replace(/"/g, ''); // Remove quotes if any
            break;
        } else if (line.trim().startsWith('DATABASE_URL=')) {
            connectionString = line.trim().split('=', 2)[1].replace(/"/g, '');
            break;
        }
    }
}

// Remove query params like ?pgbouncer=true if they cause issues with 'pg' client directly sometimes, 
// strictly speaking pg supports them but let's be safe. standard supabase url works.

console.log('Connecting to:', connectionString.replace(/:[^:]*@/, ':****@')); // Log masked url

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'db_scripts', 'add_book_support.sql'), 'utf8');
        await client.query(sql);
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
