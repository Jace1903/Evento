import 'dotenv/config';
import { runAllAggregators } from '../services/aggregator';
import pool from '../db';

async function main() {
  console.log('Starting event aggregation...');
  await runAllAggregators();
  await pool.end();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Aggregation failed:', err);
  process.exit(1);
});
