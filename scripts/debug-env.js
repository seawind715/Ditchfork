const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length > 0 && parts[0].trim()) {
            console.log('Key found:', parts[0].trim());
        }
    });
} else {
    console.log('.env.local not found');
}
