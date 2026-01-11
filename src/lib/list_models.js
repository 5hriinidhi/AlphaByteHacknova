import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import https from 'https';

// Read .env manually since we are running this with node directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!API_KEY) {
    console.error('API Key not found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('models_output.txt', data);
        console.log('Output written to models_output.txt');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
