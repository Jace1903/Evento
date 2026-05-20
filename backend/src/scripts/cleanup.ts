import 'dotenv/config';
import pool from '../db';

async function main() {
  const r = await pool.query("DELETE FROM events WHERE source = 'predicthq'");
  console.log('Deleted predicthq rows:', r.rowCount);
  await pool.end();
}
main().catch(console.error);
