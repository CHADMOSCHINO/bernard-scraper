/**
 * Bernard Lead Scraper - Focused Version
 * Only finds businesses with BROKEN or NO WEBSITE
 * Limits to 10 high-quality leads per run
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { Client } from '@notionhq/client';
import 'dotenv/config';
import { checkWebsite } from './scrapers/website-checker.js';

// Load config or use defaults
const configPath = './config/settings.json';
let config = {
    city: 'Raleigh',
    state: 'NC',
    niche: 'restaurants',
    maxLeads: 10,
    sources: ['google_maps', 'yelp'],
};

if (existsSync(configPath)) {
    config = { ...config, ...JSON.parse(readFileSync(configPath, 'utf-8')) };
}

// Initialize Notion
const notion = new Client({ auth: process.env.NOTION_API_KEY });
function normalizeNotionDatabaseId(raw) {
    // Accept: UUID, 32-hex id, quoted values, and values with whitespace/newlines.
    let trimmed = (raw ?? '').trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1).trim();
    }
    // Strip everything except hex digits and hyphens
    const cleaned = trimmed.replace(/[^0-9a-fA-F-]/g, '');
    const hex = cleaned.replace(/-/g, '');

    // Notion accepts UUIDs; allow 32-char IDs without hyphens.
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

const databaseId = normalizeNotionDatabaseId(process.env.NOTION_DATABASE_ID);

async function main() {
    console.log(`
╔════════════════════════════════════════════════════╗
║  🤖 Bernard Lead Scraper - Focused Mode            ║
║                                                    ║
║  City: ${config.city.padEnd(20)}                   ║
║  Niche: ${config.niche.padEnd(19)}                   ║
║  Max Leads: ${String(config.maxLeads).padEnd(15)}                   ║
╚════════════════════════════════════════════════════╝
`);

    const browser = await chromium.launch({ headless: true });
    const allLeads = [];

    try {
        // Scrape Google Maps
        if (config.sources.includes('google_maps')) {
            console.log('📍 Searching Google Maps...');
            const gmLeads = await scrapeGoogleMaps(browser);
            allLeads.push(...gmLeads);
        }

        // Scrape Yelp
        if (config.sources.includes('yelp')) {
            console.log('\n📍 Searching Yelp...');
            try {
                const yelpLeads = await scrapeYelp(browser);
                allLeads.push(...yelpLeads);
            } catch (error) {
                console.log(`  ⚠️  Yelp scraping unavailable: ${error.message}`);
                console.log(`  💡 Note: Yelp may block automated access. Google Maps results are sufficient.`);
            }
        }

        // Deduplicate
        const unique = deduplicateLeads(allLeads);
        console.log(`\n📊 Found ${unique.length} unique businesses without websites`);

        // Limit to max leads
        const topLeads = unique.slice(0, config.maxLeads);
        console.log(`✂️  Keeping top ${topLeads.length} leads\n`);

        // Always persist results (so you never lose leads)
        writeOutputs(topLeads);

        // Push to Notion
        await pushToNotion(topLeads);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }

    console.log('\n✅ Bernard complete!');
}

/**
 * Scrape Google Maps for businesses without websites
 */
async function scrapeGoogleMaps(browser) {
    const page = await browser.newPage();
    const leads = [];
    const query = `${config.niche} in ${config.city} ${config.state}`;

    try {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Scroll to load more
        const feed = page.locator('[role="feed"]');
        if (await feed.count() > 0) {
            for (let i = 0; i < 3; i++) {
                await feed.evaluate(el => el.scrollTop += 500);
                await page.waitForTimeout(1000);
            }
        }

        // Extract businesses (open details so we can reliably read website/phone/address)
        const results = [];
        const items = page.locator('[role="feed"] > div > div > a');
        const count = Math.min(await items.count(), 25);

        for (let i = 0; i < count; i++) {
            try {
                await items.nth(i).click({ timeout: 10000 });
                await page.waitForTimeout(1500);

                const details = await extractGoogleMapsDetails(page);
                if (!details?.name) continue;

                // Website classification
                const websiteStatus = await checkWebsite(browser, details.website);
                const keep =
                    websiteStatus.status === 'none' ||
                    websiteStatus.status === 'broken' ||
                    websiteStatus.status === 'placeholder' ||
                    websiteStatus.status === 'outdated';

                if (!keep) continue;

                const email = details.website ? await extractEmailsFromWebsite(browser, details.website) : '';

                results.push({
                    name: details.name,
                    phone: details.phone || null,
                    address: details.address || null,
                    website: details.website || '',
                    email: email || '',
                    websiteStatus,
                    source: 'Google Maps',
                });
            } catch {
                // Ignore per-item errors and continue
            }
        }

        console.log(`  Found ${results.length} businesses (none/broken/placeholder/outdated websites)`);
        leads.push(...results);

    } catch (error) {
        console.log(`  Error: ${error.message}`);
    } finally {
        await page.close();
    }

    return leads;
}

/**
 * Scrape Yelp for businesses without websites
 */
async function scrapeYelp(browser) {
    const page = await browser.newPage();
    const leads = [];
    const query = config.niche.replace(/\s+/g, '+');

    try {
        const url = `https://www.yelp.com/search?find_desc=${query}&find_loc=${config.city}%2C+${config.state}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(4000);

        // Scroll to load more results
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);

        // Extract businesses with multiple selector fallbacks
        const results = await page.evaluate(() => {
            const businesses = [];
            
            // Try multiple selectors for Yelp business cards
            let cards = [];
            
            // Selector 1: Modern Yelp structure
            cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
            
            // Selector 2: Alternative structure
            if (cards.length === 0) {
                cards = document.querySelectorAll('div[class*="container"], div[class*="business"]');
            }
            
            // Selector 3: Look for business links
            if (cards.length === 0) {
                const bizLinks = document.querySelectorAll('a[href*="/biz/"]');
                bizLinks.forEach(link => {
                    const card = link.closest('div[class*="container"], div[class*="business"], li, div[role="listitem"]');
                    if (card) cards.push(card);
                });
            }
            
            // Selector 4: Generic list items
            if (cards.length === 0) {
                cards = document.querySelectorAll('ul[class*="list"] > li, div[role="list"] > div');
            }

            cards.forEach(card => {
                try {
                    // Find business name - multiple strategies
                    let name = null;
                    const nameLink = card.querySelector('a[href*="/biz/"]');
                    if (nameLink) {
                        name = nameLink.innerText?.trim() || nameLink.textContent?.trim();
                    }
                    
                    // Fallback: look for h3 or h4 with business name
                    if (!name) {
                        const heading = card.querySelector('h3, h4, h2, [class*="heading"], [class*="title"]');
                        if (heading) name = heading.innerText?.trim() || heading.textContent?.trim();
                    }
                    
                    // Fallback: first strong or bold text
                    if (!name) {
                        const strong = card.querySelector('strong, b, [class*="name"]');
                        if (strong) name = strong.innerText?.trim() || strong.textContent?.trim();
                    }
                    
                    if (!name || name.length < 2) return;

                    const text = card.innerText || card.textContent || '';

                    // Check for website indicators (more comprehensive)
                    const hasWebsite = 
                        text.includes('Website') || 
                        text.includes('Visit website') ||
                        text.includes('yelp.com/biz_redir') ||
                        card.querySelector('a[href*="biz_redir"]') ||
                        card.querySelector('a[href*="yelp.com/redirect"]') ||
                        /https?:\/\/[^\s]+/.test(text);

                    // Extract phone
                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    const phone = phoneMatch ? phoneMatch[0] : null;

                    // Extract address
                    let address = '';
                    const addressLines = text.split('\n');
                    for (const line of addressLines) {
                        if (/\d+\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Ln|Street|Avenue|Road)/i.test(line)) {
                            address = line.trim();
                            break;
                        }
                    }

                    // Only keep businesses WITHOUT websites
                    if (!hasWebsite) {
                        businesses.push({ 
                            name: name.trim(), 
                            phone, 
                            address: address || '', 
                            source: 'Yelp' 
                        });
                    }
                } catch (err) {
                    // Skip this card if there's an error
                    console.error('Error processing card:', err);
                }
            });

            return businesses;
        });

        console.log(`  Found ${results.length} businesses without websites`);
        leads.push(...results);

    } catch (error) {
        console.log(`  Error: ${error.message}`);
        console.log(`  Stack: ${error.stack}`);
    } finally {
        await page.close();
    }

    return leads;
}

/**
 * Remove duplicates by name
 */
function deduplicateLeads(leads) {
    const seen = new Set();
    return leads.filter(lead => {
        const key = lead.name?.toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Push leads to Notion with simple schema
 */
async function pushToNotion(leads) {
    console.log('📤 Pushing to Notion...\n');
    let success = 0;

    for (const lead of leads) {
        try {
            await notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    'Name': {
                        title: [{ text: { content: lead.name } }],
                    },
                    'Phone': lead.phone ? { phone_number: lead.phone } : { phone_number: null },
                    'Email': lead.email ? { email: lead.email } : { email: null },
                    'Website': lead.website ? { url: lead.website } : { url: null },
                    'Address': lead.address ? { rich_text: [{ text: { content: lead.address } }] } : { rich_text: [] },
                    'city': {
                        rich_text: [{ text: { content: config.city } }],
                    },
                    'Website Status': {
                        select: { name: (lead.websiteStatus?.status || 'none').charAt(0).toUpperCase() + (lead.websiteStatus?.status || 'none').slice(1) },
                    },
                    'hotness': {
                        select: { name: 'Premium' }, // No website = Premium opportunity
                    },
                    'Score': { number: 90 },
                    'Reason Scraped': {
                        rich_text: [{ text: { content: '❌ No website found - needs online presence' } }],
                    },
                    'Status': { select: { name: 'New' } },
                },
            });

            success++;
            console.log(`  ✓ ${lead.name} (${lead.source})`);
            if (lead.phone) console.log(`    📞 ${lead.phone}`);

        } catch (error) {
            console.log(`  ✗ ${lead.name}: ${error.message}`);
        }
    }

    console.log(`\n✅ Added ${success}/${leads.length} leads to Notion`);
}

function writeOutputs(leads) {
    const outDir = path.join(process.cwd(), 'output');
    mkdirSync(outDir, { recursive: true });

    const jsonPath = path.join(outDir, 'latest.json');
    const csvPath = path.join(outDir, 'latest.csv');

    writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), leads }, null, 2));
    writeFileSync(csvPath, toCsv(leads));
}

function toCsv(leads) {
    const cols = ['name', 'phone', 'email', 'address', 'website', 'source', 'websiteStatus'];
    const esc = (v) => {
        const s = v == null ? '' : String(v);
        const safe = s.replace(/"/g, '""');
        return `"${safe}"`;
    };
    const rows = [
        cols.join(','),
        ...leads.map((l) =>
            cols
                .map((c) => {
                    if (c === 'websiteStatus') return esc(l.websiteStatus?.status || '');
                    return esc(l[c]);
                })
                .join(',')
        ),
    ];
    return rows.join('\n') + '\n';
}

async function extractEmailsFromWebsite(browser, url) {
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(500);

        const emails = new Set();
        const addFromText = (text) => {
            const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
            for (const m of matches) {
                const e = m.toLowerCase();
                if (e.endsWith('@example.com')) continue;
                emails.add(e);
            }
        };

        addFromText(await page.content());
        const bodyText = await page.locator('body').textContent().catch(() => '');
        if (bodyText) addFromText(bodyText);

        // Try a couple likely “contact” pages if available
        const hrefs = await page.evaluate(() => {
            const out = [];
            document.querySelectorAll('a[href]').forEach((a) => {
                const href = a.getAttribute('href') || '';
                const text = (a.textContent || '').toLowerCase();
                if (text.includes('contact') || text.includes('about')) out.push(href);
            });
            return Array.from(new Set(out)).slice(0, 3);
        });

        for (const href of hrefs) {
            try {
                const nextUrl = new URL(href, url).toString();
                await page.goto(nextUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                await page.waitForTimeout(300);
                addFromText(await page.content());
                const t = await page.locator('body').textContent().catch(() => '');
                if (t) addFromText(t);
            } catch {
                // ignore
            }
        }

        return Array.from(emails)[0] || '';
    } catch {
        return '';
    } finally {
        await page.close();
    }
}

async function extractGoogleMapsDetails(page) {
    const name = await page.locator('h1.DUwDvf, h1').first().textContent().catch(() => null);

    const phone = await page
        .locator('button[data-item-id^="phone:"], button[data-item-id="phone"], button[aria-label^="Phone"]')
        .first()
        .textContent()
        .catch(() => null);

    const address = await page
        .locator('button[data-item-id="address"], button[aria-label^="Address"]')
        .first()
        .textContent()
        .catch(() => null);

    const websiteHref = await page
        .locator('a[data-item-id="authority"], a[data-item-id="website"], a[aria-label^="Website"]')
        .first()
        .getAttribute('href')
        .catch(() => null);

    return {
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        website: websiteHref?.trim() || '',
    };
}

// Run
main();
