const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query('SELECT id, car_name, car_model, plate_number, image_url FROM cars');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
