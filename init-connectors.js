import { initDB } from './db/db.js';
import 'dotenv/config';

console.log('Running database migration for Connectors...');
await initDB();
console.log('Migration complete. You may need to restart the server if endpoints were added.');
process.exit(0);
