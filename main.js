/**
 * Bernard Lead Scraper - Focused Version
 * Only finds businesses with BROKEN or NO WEBSITE
 * Limits to 10 high-quality leads per run
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import 'dotenv/config';
import { createRun, updateRun, insertLeads } from './db/db.js';

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

    // Create run record
    let runId;
    try {
        runId = await createRun(config.city, config.state, config.niche, config.maxLeads);
        console.log(`📝 Run #${runId} started\n`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('⚠️  Continuing without database (results will be saved to files only)\n');
    }

    const browser = await chromium.launch({ headless: true });
    const allLeads = [];
    let status = 'completed';

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

        // Save to output files (never lose leads)
        saveResultsToFiles(topLeads);

        // Save to database
        if (runId) {
            try {
                await insertLeads(runId, topLeads);
                console.log(`💾 Saved ${topLeads.length} leads to database`);
            } catch (error) {
                console.error('⚠️  Database write failed:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        status = 'failed';
    } finally {
        await browser.close();
        
        // Update run status
        if (runId) {
            try {
                await updateRun(runId, status, allLeads.length);
            } catch (error) {
                console.error('⚠️  Could not update run status:', error.message);
            }
        }
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

        // Extract businesses from search results (fast pass)
        const results = await page.evaluate(() => {
            const businesses = [];
            const items = document.querySelectorAll('[role="feed"] > div > div > a');

            items.forEach(item => {
                const name = item.getAttribute('aria-label');
                if (!name || name.length < 3) return;

                const parent = item.closest('[role="feed"] > div > div');
                let phone = null;
                let address = null;
                let hasWebsite = false;

                if (parent) {
                    const text = parent.innerText;

                    // Check for website indicators
                    hasWebsite = text.includes('Website') || text.includes('.com') || text.includes('.net');

                    // Extract phone
                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    if (phoneMatch) phone = phoneMatch[0];

                    // Extract address
                    const lines = text.split('\n');
                    for (const line of lines) {
                        if (/\d+\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Ln)/i.test(line)) {
                            address = line.trim();
                            break;
                        }
                    }
                }

                // Only keep businesses WITHOUT websites
                if (!hasWebsite) {
                    businesses.push({ 
                        name: name.trim(), 
                        phone, 
                        address,
                        email: '',
                        source: 'Google Maps' 
                    });
                }
            });

            return businesses;
        });

        console.log(`  Found ${results.length} businesses without websites`);

        // Enrich leads missing phone numbers (open detail panel for those only)
        const itemsLocator = page.locator('[role="feed"] > div > div > a');
        const itemCount = Math.min(await itemsLocator.count(), results.length);
        let enriched = 0;

        for (let i = 0; i < itemCount && enriched < 10; i++) {
            const lead = results[i];
            if (!lead || lead.phone) continue; // Skip if already has phone

            try {
                // Click to open detail panel
                await itemsLocator.nth(i).click({ timeout: 5000 });
                await page.waitForTimeout(1500);

                // Extract phone from detail panel
                const detailPhone = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button[data-item-id*="phone"]'));
                    for (const btn of buttons) {
                        const match = btn.getAttribute('data-item-id')?.match(/phone:tel:([\d\s\-\(\)]+)/);
                        if (match) return match[1].trim();
                    }
                    
                    // Fallback: search visible text
                    const text = document.body.innerText;
                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    return phoneMatch ? phoneMatch[0] : null;
                });

                if (detailPhone) {
                    lead.phone = detailPhone;
                    enriched++;
                }
            } catch (err) {
                // Skip if can't open detail
            }
        }

        if (enriched > 0) {
            console.log(`  📞 Enriched ${enriched} leads with phone numbers from detail panels`);
        }

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
 * Save results to JSON and CSV files
 */
function saveResultsToFiles(leads) {
    try {
        const outputDir = './output';
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // Save as JSON
        const jsonPath = path.join(outputDir, 'latest.json');
        writeFileSync(jsonPath, JSON.stringify(leads, null, 2));

        // Save as CSV
        const csvPath = path.join(outputDir, 'latest.csv');
        const headers = 'Name,Phone,Address,Email,Source,City,Niche\n';
        const rows = leads.map(l => 
            `"${l.name || ''}","${l.phone || ''}","${l.address || ''}","${l.email || ''}","${l.source || ''}","${config.city}","${config.niche}"`
        ).join('\n');
        writeFileSync(csvPath, headers + rows);

        console.log(`💾 Results saved to ${outputDir}/latest.json and latest.csv`);
    } catch (error) {
        console.log(`⚠️ Could not save results files: ${error.message}`);
    }
}

// Run
main();
