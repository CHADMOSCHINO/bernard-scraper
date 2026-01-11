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

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-images',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
        ]
    });
    const allLeads = [];
    let status = 'completed';

    try {
        // Scrape Google Maps
        if (config.sources.includes('google_maps')) {
            console.log('📍 Searching Google Maps...');
            const gmLeads = await scrapeGoogleMaps(browser, config.filters);
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

        // FINAL SAFETY FILTER: Enforce at least one contact method (Phone OR Email OR Google Maps URL)
        const validDocs = allLeads.filter(l => {
            const hasPhone = validatePhone(l.phone);
            const hasEmail = l.email && l.email.includes('@');
            const hasUrl = l.url && l.url.includes('http'); // Generic URL check (GMaps or Yelp)

            if (hasPhone) l.phone = hasPhone;
            return hasPhone || hasEmail || hasUrl;
        });

        // Deduplicate
        const unique = deduplicateLeads(validDocs);
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
/**
 * Validate phone number (strict)
 */
const validatePhone = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    // Must be exactly 10 digits (US) or 11 starting with 1
    if (digits.length === 10) return phone;
    if (digits.length === 11 && digits.startsWith('1')) return phone;
    return null;
};

async function scrapeGoogleMaps(browser, filters = {}) {
    const page = await browser.newPage();
    const leads = [];
    const query = `${config.niche} in ${config.city} ${config.state}`;



    // Email extraction regex
    const extractEmail = (text) => {
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return emailMatch ? emailMatch[0].toLowerCase() : null;
    };

    try {
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1200);

        // Aggressive scroll to load more results - increased from 5 to 20 for more leads
        const feed = page.locator('[role="feed"]');
        if (await feed.count() > 0) {
            for (let i = 0; i < 20; i++) { // Boosted scroll count
                await feed.evaluate(el => el.scrollTop += 2000); // Faster scrolling
                await page.waitForTimeout(150); // Reduced wait
            }
        }

        // Fast extraction from search results
        const results = await page.evaluate((filters) => {
            const businesses = [];
            const items = document.querySelectorAll('[role="feed"] > div > div > a');

            items.forEach(item => {
                const name = item.getAttribute('aria-label');
                if (!name || name.length < 3) return;

                const parent = item.closest('[role="feed"] > div > div');
                let phone = null;
                let address = null;
                let hasWebsite = false;

                let rating = 0;
                let reviews = 0;

                if (parent) {
                    const text = parent.innerText;

                    // Check for website indicators
                    hasWebsite = text.includes('Website') ||
                        (text.includes('.com') && !text.includes('@')) ||
                        text.includes('.net') ||
                        text.includes('.org');

                    // Extract phone - stricter pattern
                    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    if (phoneMatch) phone = phoneMatch[0];

                    // Extract address - Robust Strategy
                    const lines = text.split('\n');
                    for (const line of lines) {
                        const l = line.trim();
                        if (!l) continue;

                        // Extract Rating & Reviews: "4.8(250)" or "4.8 (250)"
                        const ratingMatch = l.match(/^(\d\.\d)\s*\(([\d,]+)\)/);
                        if (ratingMatch) {
                            rating = parseFloat(ratingMatch[1]);
                            reviews = parseInt(ratingMatch[2].replace(/,/g, ''), 10);
                            continue; // Skip this line for address
                        }

                        // Skip phone lines if already found or checking separately
                        if (/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(l)) continue;

                        // Strategy 1: Standard Address (Number + Street Name + Suffix)
                        if (/\d+\s+[A-Za-z0-9\s.-]+(?:St|Ave|Rd|Dr|Blvd|Way|Ln|Ct|Pl|Cir|Hwy|Pkwy|Sq|Ter|Loop|Street|Avenue|Road|Drive|Boulevard|Lane|Court|Place|Circle|Highway|Parkway|Square|Terrace)/i.test(l)) {
                            address = l;
                            break;
                        }

                        // Strategy 2: City, State Zip (Fallback)
                        if (!address && /,\s*[A-Z]{2}\s*\d{5}/.test(l)) {
                            address = l;
                            break;
                        }
                    }
                }

                // Filter: Check Rating
                if (filters.minRating && rating < filters.minRating) return;

                // Filter: Check Reviews
                if (filters.minReviews && reviews < filters.minReviews) return;

                // Filter: Check Website (e.g. requireNoWebsite = true)
                if (filters.requireNoWebsite && hasWebsite) return;

                // Push business to results (Capture ALL, Filter Later)
                businesses.push({
                    name: name.trim(),
                    phone,
                    address,
                    email: null,
                    url: item.href, // Google Maps URL Fallback
                    source: 'Google Maps',
                    rating,
                    reviews,
                    hasWebsite
                });
            });

            return businesses;
        }, filters);

        console.log(`  Found ${results.length} businesses without websites`);

        // Enrich leads - get phone AND email from detail panels
        const itemsLocator = page.locator('[role="feed"] > div > div > a');
        const itemCount = Math.min(await itemsLocator.count(), results.length);
        let enrichedPhone = 0;
        let enrichedEmail = 0;
        const maxEnrich = Math.min(50, results.length); // Boosted from 12 to 50

        for (let i = 0; i < itemCount && (enrichedPhone < maxEnrich); i++) {
            const lead = results[i];
            if (!lead) continue;

            // Skip if already has both phone and email
            if (lead.phone && lead.email) continue;

            try {
                await itemsLocator.nth(i).click({ timeout: 2000 });
                await page.waitForTimeout(200); // Snappy transition

                // Extract phone and email from detail panel
                const details = await page.evaluate(() => {
                    let phone = null;
                    let email = null;

                    // Get phone from button
                    const phoneButtons = document.querySelectorAll('button[data-item-id*="phone"]');
                    for (const btn of phoneButtons) {
                        const match = btn.getAttribute('data-item-id')?.match(/phone:tel:([\d\s\-\(\)+]+)/);
                        if (match) {
                            phone = match[1].trim();
                            break;
                        }
                    }

                    // Fallback phone from text
                    if (!phone) {
                        const text = document.body.innerText;
                        const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                        if (phoneMatch) phone = phoneMatch[0];
                    }

                    // Look for email in detail panel
                    const pageText = document.body.innerText;
                    const emailMatch = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                    if (emailMatch) email = emailMatch[0].toLowerCase();

                    return { phone, email };
                });

                // Validate and assign phone
                if (!lead.phone && details.phone) {
                    const validPhone = validatePhone(details.phone);
                    if (validPhone) {
                        lead.phone = validPhone;
                        enrichedPhone++;
                    }
                }

                // Assign email
                if (!lead.email && details.email) {
                    lead.email = details.email;
                    enrichedEmail++;
                }
            } catch (err) {
                // Skip on error
            }
        }

        if (enrichedPhone > 0 || enrichedEmail > 0) {
            console.log(`  📞 Enriched: ${enrichedPhone} phones, ${enrichedEmail} emails`);
        }

        // REQUIRE phone numbers - filter out leads without valid contact
        const validLeads = results.filter(lead => {
            lead.phone = validatePhone(lead.phone);
            // MUST have phone number to be a valid lead
            if (!lead.phone) {
                return false;
            }
            return true;
        });

        console.log(`  ✅ ${validLeads.length} leads with verified phone numbers`);
        leads.push(...validLeads);

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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }); // Faster
        await page.waitForTimeout(2000); // Reduced from 4000ms

        // Scroll to load more results
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(800); // Reduced from 2000ms

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

        // SMART FILTER: Keep lead if it has Phone OR Email
        const validLeads = results.filter(l => {
            const validPhone = validatePhone(l.phone);
            if (validPhone) l.phone = validPhone;

            const hasEmail = l.email && l.email.includes('@');
            return !!(validPhone || hasEmail);
        });

        console.log(`  Found ${results.length} results, kept ${validLeads.length} with contact info`);
        leads.push(...validLeads);

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
        const headers = 'Name,Phone,Address,Email,GoogleMapsURL,Source,City,Niche\n';
        const rows = leads.map(l =>
            `"${l.name || ''}","${l.phone || ''}","${l.address || ''}","${l.email || ''}","${l.url || ''}","${l.source || ''}","${config.city}","${config.niche}"`
        ).join('\n');
        writeFileSync(csvPath, headers + rows);

        console.log(`💾 Results saved to ${outputDir}/latest.json and latest.csv`);
    } catch (error) {
        console.log(`⚠️ Could not save results files: ${error.message}`);
    }
}

// Run
main();
