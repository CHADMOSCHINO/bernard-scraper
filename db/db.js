/**
 * Database connection and helpers
 */
import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL?.includes('render.com') 
                ? { rejectUnauthorized: false } 
                : false,
        });
    }
    return pool;
}

/**
 * Create a new run and return its ID
 */
export async function createRun(city, state, niche, maxLeads) {
    const db = getPool();
    const result = await db.query(
        `INSERT INTO runs (city, state, niche, max_leads, status, started_at)
         VALUES ($1, $2, $3, $4, 'running', NOW())
         RETURNING id`,
        [city, state, niche, maxLeads]
    );
    return result.rows[0].id;
}

/**
 * Update run status and logs
 */
export async function updateRun(runId, status, totalLeads, logs = null) {
    const db = getPool();
    const updates = ['status = $2', 'total_leads = $3'];
    const params = [runId, status, totalLeads];
    
    if (status === 'completed' || status === 'failed') {
        updates.push('finished_at = NOW()');
    }
    
    if (logs !== null) {
        updates.push(`logs = $${params.length + 1}`);
        params.push(logs);
    }
    
    await db.query(
        `UPDATE runs SET ${updates.join(', ')} WHERE id = $1`,
        params
    );
}

/**
 * Insert leads for a run
 */
export async function insertLeads(runId, leads) {
    const db = getPool();
    
    for (const lead of leads) {
        await db.query(
            `INSERT INTO leads (run_id, name, phone, email, address, website, website_status, source, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
                runId,
                lead.name || 'Unknown',
                lead.phone || null,
                lead.email || null,
                lead.address || null,
                lead.website || null,
                lead.websiteStatus?.status || 'none',
                lead.source || 'Google Maps'
            ]
        );
    }
}

/**
 * Get recent runs
 */
export async function getRuns(limit = 50) {
    const db = getPool();
    const result = await db.query(
        `SELECT id, started_at, finished_at, city, state, niche, max_leads, status, total_leads
         FROM runs
         ORDER BY started_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

/**
 * Get leads for a run
 */
export async function getLeadsForRun(runId) {
    const db = getPool();
    const result = await db.query(
        `SELECT id, name, phone, email, address, website, website_status, source, created_at
         FROM leads
         WHERE run_id = $1
         ORDER BY created_at DESC`,
        [runId]
    );
    return result.rows;
}

/**
 * Get all recent leads (across runs)
 */
export async function getRecentLeads(limit = 100) {
    const db = getPool();
    const result = await db.query(
        `SELECT l.id, l.name, l.phone, l.email, l.address, l.website, l.website_status, l.source, l.created_at,
                r.city, r.state, r.niche
         FROM leads l
         JOIN runs r ON l.run_id = r.id
         ORDER BY l.created_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

/**
 * Initialize database schema (run on startup if needed)
 */
export async function initDB() {
    const db = getPool();
    
    // Create tables if they don't exist
    await db.query(`
        CREATE TABLE IF NOT EXISTS runs (
            id SERIAL PRIMARY KEY,
            started_at TIMESTAMPTZ DEFAULT NOW(),
            finished_at TIMESTAMPTZ,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(10) NOT NULL,
            niche VARCHAR(100) NOT NULL,
            max_leads INTEGER DEFAULT 10,
            status VARCHAR(20) DEFAULT 'running',
            total_leads INTEGER DEFAULT 0,
            logs TEXT
        )
    `);
    
    await db.query(`
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            run_id INTEGER REFERENCES runs(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            email VARCHAR(255),
            address TEXT,
            website VARCHAR(500),
            website_status VARCHAR(50),
            source VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    
    // Create indexes
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC)
    `);
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_leads_run_id ON leads(run_id)
    `);
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)
    `);
    
    console.log('✅ Database initialized');
}
