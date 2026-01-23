
const path = require('path');
const fs = require('fs');
const https = require('https');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let apiKey = '';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_TMDB_API_KEY=')) {
            apiKey = line.split('=')[1].trim();
            break;
        }
    }
}

if (!apiKey) {
    console.error('API Key not found in .env.local');
    process.exit(1);
}

console.log(`Testing TMDB API with key: ${apiKey.substring(0, 5)}...`);

const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=Inception&language=ko-KR`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                console.log('Success! API responded.');
                console.log(`Found ${json.total_results} results for "Inception".`);
                if (json.results && json.results.length > 0) {
                    console.log('First result title:', json.results[0].title);
                }
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
            }
        } else {
            console.error(`API Request Failed. Status Code: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
