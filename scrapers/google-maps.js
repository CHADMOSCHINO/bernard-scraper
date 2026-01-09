/**
 * Google Maps Scraper - Robust Version
 * Extracts business data directly from search results
 */

export async function scrapeGoogleMaps(browser, queries, cityConfig) {
    const leads = [];
    const page = await browser.newPage();

    // Set user agent to appear as a real browser
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });

    try {
        for (const { query, industry } of queries.slice(0, 5)) { // Limit queries for speed
            console.log(`  Searching: "${query}"`);

            try {
                // Navigate directly to search
                const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${cityConfig.coordinates?.latitude || 35.7796},${cityConfig.coordinates?.longitude || -78.6382},12z`;

                await page.goto(searchUrl, {
                    waitUntil: 'load',
                    timeout: 30000
                });

                // Wait for content
                await page.waitForTimeout(4000);

                // Scroll to load more results
                const scrollable = page.locator('[role="feed"]');
                if (await scrollable.count() > 0) {
                    for (let i = 0; i < 2; i++) {
                        await scrollable.evaluate(el => el.scrollTop += 500);
                        await page.waitForTimeout(1000);
                    }
                }

                // Get all business entries from the feed
                // Google Maps uses aria-label on the result items
                const results = await page.evaluate(() => {
                    const businesses = [];

                    // Look for all clickable business results
                    const items = document.querySelectorAll('[role="feed"] > div > div > a');

                    items.forEach(item => {
                        const ariaLabel = item.getAttribute('aria-label');
                        if (!ariaLabel) return;

                        // Parse the aria-label which contains business info
                        // Format is typically: "Business Name"
                        const name = ariaLabel;
                        if (!name || name.length < 3) return;

                        // Try to get rating and reviews from nearby elements
                        const parent = item.closest('[role="feed"] > div > div');
                        let rating = null;
                        let reviewCount = null;
                        let address = null;
                        let phone = null;

                        if (parent) {
                            // Look for rating (e.g., "4.5")
                            const ratingMatch = parent.innerText.match(/(\d\.\d)\s*\(\d/);
                            if (ratingMatch) rating = parseFloat(ratingMatch[1]);

                            // Look for review count (e.g., "(234)")
                            const reviewMatch = parent.innerText.match(/\((\d+(?:,\d+)?)\)/);
                            if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(',', ''));

                            // Look for address (usually contains street indicators)
                            const lines = parent.innerText.split('\n');
                            for (const line of lines) {
                                if (/\d+\s+\w+\s+(St|Ave|Rd|Dr|Blvd|Way|Ln)/i.test(line)) {
                                    address = line.trim();
                                    break;
                                }
                            }

                            // Look for phone
                            const phoneMatch = parent.innerText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                            if (phoneMatch) phone = phoneMatch[0];
                        }

                        businesses.push({
                            name: name.trim(),
                            rating,
                            reviewCount,
                            address,
                            phone,
                        });
                    });

                    return businesses;
                });

                console.log(`    Found ${results.length} businesses`);

                // Add to leads
                for (const biz of results) {
                    if (biz.name && biz.name !== 'Results' && biz.name.length > 2) {
                        leads.push({
                            name: biz.name,
                            industry,
                            city: cityConfig.cityName,
                            state: cityConfig.state || '',
                            country: cityConfig.country,
                            address: biz.address || '',
                            phone: biz.phone || '',
                            rating: biz.rating,
                            reviewCount: biz.reviewCount || 0,
                            website: '', // Will be enriched later or marked as "no website"
                            source: 'google_maps',
                            scrapedAt: new Date().toISOString(),
                        });
                        console.log(`    ✓ ${biz.name}`);
                    }
                }

                await page.waitForTimeout(2000);

            } catch (searchError) {
                console.log(`    Error: ${searchError.message}`);
                continue;
            }
        }
    } finally {
        await page.close();
    }

    // Deduplicate
    const unique = deduplicateLeads(leads);
    console.log(`\n  Total: ${unique.length} unique leads from Google Maps`);

    return unique;
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
