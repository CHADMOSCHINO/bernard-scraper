-- Bernard Lead Scraper Database Schema

CREATE TABLE IF NOT EXISTS runs (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(10) NOT NULL,
    niche VARCHAR(100) NOT NULL,
    max_leads INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
    total_leads INTEGER DEFAULT 0,
    logs TEXT
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES runs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    website VARCHAR(500),
    website_status VARCHAR(50), -- none, broken, placeholder, outdated, working
    source VARCHAR(50), -- Google Maps, Yelp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_run_id ON leads(run_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
