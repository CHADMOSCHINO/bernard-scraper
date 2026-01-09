/**
 * Bernard API Server - Simplified
 * Handles scraper configuration and execution
 */

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_BIN = process.execPath;

const SETTINGS_PATH = path.join(__dirname, 'config', 'settings.json');
const DEFAULT_SETTINGS = {
    city: 'Raleigh',
    state: 'NC',
    niche: 'restaurants',
    maxLeads: 10,
    sources: ['google_maps', 'yelp'],
};

function readSettingsSafe() {
    try {
        return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function writeSettingsSafe(settings) {
    try {
        writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Failed to write settings.json:', error?.message ?? error);
        return false;
    }
}

function normalizeNotionDatabaseId(raw) {
    // Accept: UUID, 32-hex id, quoted values, and values with whitespace/newlines.
    let trimmed = (raw ?? '').trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1).trim();
    }
    const cleaned = trimmed.replace(/[^0-9a-fA-F-]/g, '');
    const hex = cleaned.replace(/-/g, '');
    // Notion accepts UUIDs; allow 32-char IDs (no hyphens) too.
    if (/^[0-9a-fA-F]{32}$/.test(hex)) {
        return (
            hex.slice(0, 8) + '-' +
            hex.slice(8, 12) + '-' +
            hex.slice(12, 16) + '-' +
            hex.slice(16, 20) + '-' +
            hex.slice(20)
        ).toLowerCase();
    }
    return cleaned.trim();
}

function scraperEnv() {
    return {
        ...process.env,
        NOTION_API_KEY: (process.env.NOTION_API_KEY ?? '').trim(),
        NOTION_DATABASE_ID: normalizeNotionDatabaseId(process.env.NOTION_DATABASE_ID),
    };
}

app.use(cors());
app.use(express.json());

// State
let isRunning = false;
let logs = [];
let currentProcess = null;

// Get current config
app.get('/api/config', (req, res) => {
    try {
        res.json(readSettingsSafe());
    } catch {
        res.json({ ...DEFAULT_SETTINGS });
    }
});

// Update config
app.post('/api/config', (req, res) => {
    try {
        const config = { ...DEFAULT_SETTINGS, ...(req.body ?? {}) };
        if (!writeSettingsSafe(config)) {
            return res.status(500).json({ error: 'Failed to save config' });
        }
        log(`⚙️ Config updated: ${config.city}, ${config.niche}, max ${config.maxLeads}`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get status
app.get('/api/status', (req, res) => {
    res.json({ isRunning, logs: logs.slice(-30) });
});

// Run single scan
app.post('/api/scan/single', (req, res) => {
    if (isRunning) {
        return res.status(400).json({ error: 'Already running' });
    }

    try {
        // Update config if provided
        if (req.body?.city || req.body?.niche || req.body?.maxLeads) {
            const config = readSettingsSafe();
            if (req.body.city) config.city = req.body.city;
            if (req.body.niche) config.niche = req.body.niche;
            if (req.body.maxLeads) config.maxLeads = req.body.maxLeads;
            writeSettingsSafe(config);
        }

        runScraper();
        res.json({ success: true, message: 'Scraper started' });
    } catch (error) {
        console.error('Scan single failed:', error);
        res.status(500).json({ error: error?.message ?? String(error) });
    }
});

// Run 5-day auto
app.post('/api/scan/auto', (req, res) => {
    if (isRunning) {
        return res.status(400).json({ error: 'Already running' });
    }

    try {
        // Update config
        if (req.body?.city || req.body?.niche || req.body?.maxLeads) {
            const config = readSettingsSafe();
            if (req.body.city) config.city = req.body.city;
            if (req.body.niche) config.niche = req.body.niche;
            if (req.body.maxLeads) config.maxLeads = req.body.maxLeads;
            writeSettingsSafe(config);
        }

        runAutoMode(req.body.days || 5);
        res.json({ success: true, message: '5-day auto mode started' });
    } catch (error) {
        console.error('Scan auto failed:', error);
        res.status(500).json({ error: error?.message ?? String(error) });
    }
});

// Stop
app.post('/api/scan/stop', (req, res) => {
    if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
    }
    isRunning = false;
    log('⏹️ Stopped');
    res.json({ success: true });
});

// Clear database
app.post('/api/clear', (req, res) => {
    log('🗑️ Clearing database...');
    const proc = spawn(NODE_BIN, ['clear-database.js'], { cwd: __dirname });
    proc.on('close', () => log('✅ Database cleared'));
    res.json({ success: true });
});

// Get logs
app.get('/api/logs', (req, res) => {
    res.json({ logs: logs.slice(-50) });
});

// Get latest results written by main.js (fallback output)
app.get('/api/results/latest', (req, res) => {
    try {
        const jsonPath = path.join(__dirname, 'output', 'latest.json');
        const raw = readFileSync(jsonPath, 'utf-8');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(raw);
    } catch (error) {
        res.status(404).json({ error: 'No results yet' });
    }
});

app.get('/api/results/latest.csv', (req, res) => {
    try {
        const csvPath = path.join(__dirname, 'output', 'latest.csv');
        const raw = readFileSync(csvPath, 'utf-8');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.send(raw);
    } catch {
        res.status(404).send('No results yet\n');
    }
});

function log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    logs.push(entry);
    console.log(entry);
}

function runScraper() {
    try {
        isRunning = true;
        logs = [];
        log('🤖 Starting Bernard...');

        // Use the current Node binary to avoid PATH issues in PaaS environments
        currentProcess = spawn(NODE_BIN, ['main.js'], {
            cwd: __dirname,
            env: scraperEnv(),
        });

        currentProcess.stdout.on('data', data => {
            data.toString().split('\n').filter(l => l.trim()).forEach(line => log(line));
        });

        currentProcess.stderr.on('data', data => {
            log(`⚠️ ${data.toString()}`);
        });

        currentProcess.on('close', code => {
            isRunning = false;
            currentProcess = null;
            log(code === 0 ? '✅ Complete!' : `❌ Exited with code ${code}`);
        });
    } catch (error) {
        isRunning = false;
        currentProcess = null;
        console.error('Failed to start scraper:', error);
        logs = [];
        log(`❌ Failed to start scraper: ${error?.message ?? String(error)}`);
        throw error;
    }
}

async function runAutoMode(days) {
    isRunning = true;
    logs = [];
    log(`🔄 Starting ${days}-day auto mode...`);

    for (let day = 1; day <= days; day++) {
        if (!isRunning) break;

        log(`\n📅 Day ${day}/${days}`);

        await new Promise(resolve => {
            currentProcess = spawn(NODE_BIN, ['main.js'], { cwd: __dirname, env: scraperEnv() });
            currentProcess.stdout.on('data', d => d.toString().split('\n').filter(l => l.trim()).forEach(l => log(l)));
            currentProcess.on('close', resolve);
        });

        if (day < days && isRunning) {
            log(`⏳ Waiting for next cycle... (demo: 10s)`);
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    isRunning = false;
    log('✅ Auto mode complete!');
}

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║  🤖 Bernard API Server                             ║
║                                                    ║
║  URL: http://localhost:${PORT}                       ║
║                                                    ║
║  Endpoints:                                        ║
║  GET  /api/config  - Get current config            ║
║  POST /api/config  - Update config                 ║
║  POST /api/scan/single - Run once                  ║
║  POST /api/scan/auto   - Run 5-day cycle           ║
║  POST /api/scan/stop   - Stop running              ║
║  POST /api/clear       - Clear database            ║
║  GET  /api/status      - Check status              ║
╚════════════════════════════════════════════════════╝
`);
});
