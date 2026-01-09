/**
 * Clear Postgres Database
 * Removes all runs + leads to start fresh
 */

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function clearDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set. Cannot clear database.');
        process.exitCode = 1;
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
    });

    console.log('🗑️  Clearing Postgres database...\n');

    try {
        // Order matters because of FK constraint
        await pool.query('DELETE FROM leads;');
        await pool.query('DELETE FROM runs;');
        console.log('✅ Database cleared (runs + leads)\n');
    } catch (error) {
        console.error('❌ Error clearing database:', error?.message ?? error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

clearDatabase();

