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
    // 1. Hyundai Elantra (ID 13)
    await pool.query(
      `UPDATE cars 
       SET image_url = '/uploads/cars/main/hyundai-elantra-cn7-2022-black.webp' 
       WHERE id = 13`
    );
    console.log('Updated Hyundai Elantra image.');

    // 2. Kia Sportage (ID 14)
    await pool.query(
      `UPDATE cars 
       SET image_url = '/uploads/cars/main/kia-sportage-2024-black.png' 
       WHERE id = 14`
    );
    console.log('Updated Kia Sportage image.');

    // 3. Toyota Corolla (ID 15)
    await pool.query(
      `UPDATE cars 
       SET image_url = '/uploads/cars/main/toyota-corolla-smart-2023-silver.webp' 
       WHERE id = 15`
    );
    console.log('Updated Toyota Corolla image.');

    const res = await pool.query('SELECT id, car_name, image_url FROM cars WHERE id IN (13, 14, 15)');
    console.log('Verification:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
