/**
 * Bernard Lead Scraper - Focused Version
 * Only finds businesses with BROKEN or NO WEBSITE
 * Limits to 10 high-quality leads per run
 */

import { readFileSync, existsSync } from 'fs';
import { chromium } from 'playwright';
import { Client } from '@notionhq/client';
import 'dotenv/config';

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
const databaseId = process.env.NOTION_DATABASE_ID;

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

        // Extract businesses
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
                    businesses.push({ name: name.trim(), phone, address, source: 'Google Maps' });
                }
            });

            return businesses;
        });

        console.log(`  Found ${results.length} businesses without websites`);
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
                    'city': {
                        rich_text: [{ text: { content: config.city } }],
                    },
                    'Website Status': {
                        select: { name: 'None' },
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

// Run
main();
