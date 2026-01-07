
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Fetching notices with ANON KEY...');
    const { data: notices, error } = await supabase
        .from('notices')
        .select(`
        *,
        profiles (username)
    `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notices:', error);
    } else {
        console.log('Notices found:', notices.length);
        if (notices.length > 0) {
            console.log('First notice:', JSON.stringify(notices[0], null, 2));
        }
    }
}

testFetch();
