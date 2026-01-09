/**
 * Test All Configurations
 * Tests the scraper with different city/niche/industry combinations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { chromium } from 'playwright';
import { Client } from '@notionhq/client';
import 'dotenv/config';

// Test configurations
const testConfigs = [
    // Raleigh + Web Design niche
    { city: 'Raleigh', state: 'NC', niche: 'restaurants', maxLeads: 5, sources: ['google_maps', 'yelp'] },
    { city: 'Raleigh', state: 'NC', niche: 'gyms', maxLeads: 5, sources: ['google_maps', 'yelp'] },
    { city: 'Raleigh', state: 'NC', niche: 'salons', maxLeads: 5, sources: ['google_maps', 'yelp'] },
    
    // Kingston + Payment Processors niche
    { city: 'Kingston', state: 'JM', niche: 'restaurants', maxLeads: 5, sources: ['google_maps', 'yelp'] },
    { city: 'Kingston', state: 'JM', niche: 'retail stores', maxLeads: 5, sources: ['google_maps', 'yelp'] },
    
    // Test with single source
    { city: 'Raleigh', state: 'NC', niche: 'contractors', maxLeads: 5, sources: ['google_maps'] },
    { city: 'Raleigh', state: 'NC', niche: 'dentists', maxLeads: 5, sources: ['yelp'] },
];

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Import scraping functions from main.js
async function scrapeGoogleMaps(browser, config) {
    const page = await browser.newPage();
    const leads = [];
    const query = `${config.niche} in ${config.city} ${config.state}`;

    try {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(3000);

        const feed = page.locator('[role="feed"]');
        if (await feed.count() > 0) {
            for (let i = 0; i < 3; i++) {
                await feed.evaluate(el => el.scrollTop += 500);
                await page.waitForTimeout(1000);
            }
        }

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
                    hasWebsite = text.includes('Website') || text.includes('.com') || text.includes('.net');
                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    if (phoneMatch) phone = phoneMatch[0];
                    const lines = text.split('\n');
                    for (const line of lines) {
                        if (/\d+\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Ln)/i.test(line)) {
                            address = line.trim();
                            break;
                        }
                    }
                }

                if (!hasWebsite) {
                    businesses.push({ name: name.trim(), phone, address, source: 'Google Maps' });
                }
            });

            return businesses;
        });

        leads.push(...results);

    } catch (error) {
        console.log(`    Error: ${error.message}`);
    } finally {
        await page.close();
    }

    return leads;
}

async function scrapeYelp(browser, config) {
    const page = await browser.newPage();
    const leads = [];
    const query = config.niche.replace(/\s+/g, '+');

    try {
        const url = `https://www.yelp.com/search?find_desc=${query}&find_loc=${config.city}%2C+${config.state}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);

        const results = await page.evaluate(() => {
            const businesses = [];
            let cards = [];
            
            cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
            if (cards.length === 0) {
                cards = document.querySelectorAll('div[class*="container"], div[class*="business"]');
            }
            if (cards.length === 0) {
                const bizLinks = document.querySelectorAll('a[href*="/biz/"]');
                bizLinks.forEach(link => {
                    const card = link.closest('div[class*="container"], div[class*="business"], li, div[role="listitem"]');
                    if (card) cards.push(card);
                });
            }
            if (cards.length === 0) {
                cards = document.querySelectorAll('ul[class*="list"] > li, div[role="list"] > div');
            }

            cards.forEach(card => {
                try {
                    let name = null;
                    const nameLink = card.querySelector('a[href*="/biz/"]');
                    if (nameLink) {
                        name = nameLink.innerText?.trim() || nameLink.textContent?.trim();
                    }
                    if (!name) {
                        const heading = card.querySelector('h3, h4, h2, [class*="heading"], [class*="title"]');
                        if (heading) name = heading.innerText?.trim() || heading.textContent?.trim();
                    }
                    if (!name) {
                        const strong = card.querySelector('strong, b, [class*="name"]');
                        if (strong) name = strong.innerText?.trim() || strong.textContent?.trim();
                    }
                    
                    if (!name || name.length < 2) return;

                    const text = card.innerText || card.textContent || '';
                    const hasWebsite = 
                        text.includes('Website') || 
                        text.includes('Visit website') ||
                        text.includes('yelp.com/biz_redir') ||
                        card.querySelector('a[href*="biz_redir"]') ||
                        card.querySelector('a[href*="yelp.com/redirect"]') ||
                        /https?:\/\/[^\s]+/.test(text);

                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    const phone = phoneMatch ? phoneMatch[0] : null;

                    let address = '';
                    const addressLines = text.split('\n');
                    for (const line of addressLines) {
                        if (/\d+\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Ln|Street|Avenue|Road)/i.test(line)) {
                            address = line.trim();
                            break;
                        }
                    }

                    if (!hasWebsite) {
                        businesses.push({ 
                            name: name.trim(), 
                            phone, 
                            address: address || '', 
                            source: 'Yelp' 
                        });
                    }
                } catch (err) {
                    // Skip this card
                }
            });

            return businesses;
        });

        leads.push(...results);

    } catch (error) {
        console.log(`    Error: ${error.message}`);
    } finally {
        await page.close();
    }

    return leads;
}

function deduplicateLeads(leads) {
    const seen = new Set();
    return leads.filter(lead => {
        const key = lead.name?.toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function testConfig(config, testNumber, totalTests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST ${testNumber}/${totalTests}: ${config.city}, ${config.state} - ${config.niche}`);
    console.log(`Sources: ${config.sources.join(', ')}`);
    console.log(`${'='.repeat(60)}\n`);

    const browser = await chromium.launch({ headless: true });
    const allLeads = [];
    const results = {
        config,
        googleMaps: { found: 0, error: null },
        yelp: { found: 0, error: null },
        total: 0,
        unique: 0,
        pushed: 0,
        success: false
    };

    try {
        // Test Google Maps
        if (config.sources.includes('google_maps')) {
            try {
                console.log('📍 Testing Google Maps...');
                const gmLeads = await scrapeGoogleMaps(browser, config);
                results.googleMaps.found = gmLeads.length;
                allLeads.push(...gmLeads);
                console.log(`  ✅ Found ${gmLeads.length} businesses without websites`);
            } catch (error) {
                results.googleMaps.error = error.message;
                console.log(`  ❌ Error: ${error.message}`);
            }
        }

        // Test Yelp
        if (config.sources.includes('yelp')) {
            try {
                console.log('\n📍 Testing Yelp...');
                const yelpLeads = await scrapeYelp(browser, config);
                results.yelp.found = yelpLeads.length;
                allLeads.push(...yelpLeads);
                console.log(`  ✅ Found ${yelpLeads.length} businesses without websites`);
            } catch (error) {
                results.yelp.error = error.message;
                console.log(`  ❌ Error: ${error.message}`);
            }
        }

        // Deduplicate
        const unique = deduplicateLeads(allLeads);
        results.total = allLeads.length;
        results.unique = unique.length;
        console.log(`\n📊 Total: ${allLeads.length} leads, ${unique.length} unique`);

        // Limit and test Notion push (only first 3 to avoid flooding)
        const testLeads = unique.slice(0, Math.min(3, config.maxLeads));
        if (testLeads.length > 0) {
            console.log(`\n📤 Testing Notion push (${testLeads.length} leads)...`);
            let pushed = 0;
            for (const lead of testLeads) {
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
                                select: { name: 'Premium' },
                            },
                            'Score': { number: 90 },
                            'Reason Scraped': {
                                rich_text: [{ text: { content: `Test: ${config.niche} in ${config.city}` } }],
                            },
                            'Status': { select: { name: 'New' } },
                        },
                    });
                    pushed++;
                    console.log(`  ✓ ${lead.name} (${lead.source})`);
                } catch (error) {
                    console.log(`  ✗ ${lead.name}: ${error.message}`);
                }
            }
            results.pushed = pushed;
            results.success = pushed > 0;
        }

    } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
        results.success = false;
    } finally {
        await browser.close();
    }

    return results;
}

async function runAllTests() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 Bernard Scraper - Comprehensive Configuration Test    ║
║                                                            ║
║  Testing ${testConfigs.length} different configurations...              ║
╚════════════════════════════════════════════════════════════╝
`);

    const allResults = [];

    for (let i = 0; i < testConfigs.length; i++) {
        const result = await testConfig(testConfigs[i], i + 1, testConfigs.length);
        allResults.push(result);
        
        // Small delay between tests
        if (i < testConfigs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 TEST SUMMARY');
    console.log(`${'='.repeat(60)}\n`);

    allResults.forEach((result, i) => {
        const config = result.config;
        console.log(`Test ${i + 1}: ${config.city}, ${config.state} - ${config.niche}`);
        console.log(`  Google Maps: ${result.googleMaps.found} found${result.googleMaps.error ? ` (Error: ${result.googleMaps.error})` : ''}`);
        console.log(`  Yelp: ${result.yelp.found} found${result.yelp.error ? ` (Error: ${result.yelp.error})` : ''}`);
        console.log(`  Unique: ${result.unique}`);
        console.log(`  Pushed to Notion: ${result.pushed}`);
        console.log(`  Status: ${result.success ? '✅ PASS' : '❌ FAIL'}\n`);
    });

    const passed = allResults.filter(r => r.success).length;
    const total = allResults.length;
    
    console.log(`${'='.repeat(60)}`);
    console.log(`Overall: ${passed}/${total} tests passed`);
    console.log(`${'='.repeat(60)}\n`);
}

runAllTests().catch(console.error);

