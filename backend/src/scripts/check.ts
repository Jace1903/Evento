import 'dotenv/config';
import pool from '../db';

async function main() {
  const { rows: cats } = await pool.query(`
    SELECT c.name AS category, COUNT(*) AS count
    FROM events e
    LEFT JOIN categories c ON e.category_id = c.id
    GROUP BY c.name
    ORDER BY count DESC
  `);
  console.table(cats);

  const { rows: sample } = await pool.query(`
    SELECT title, start_at::date AS date, location_name
    FROM events
    ORDER BY start_at
    LIMIT 8
  `);
  console.table(sample);

  await pool.end();
}

main().catch(console.error);
