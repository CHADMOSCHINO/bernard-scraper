/**
 * Website Checker
 * Validates website status: broken, placeholder, outdated, or active
 */

export async function checkWebsite(browser, url) {
    if (!url) {
        return { status: 'none', hasWebsite: false };
    }

    const page = await browser.newPage();

    try {
        // Normalize URL
        let normalizedUrl = url;
        if (!url.startsWith('http')) {
            normalizedUrl = `https://${url}`;
        }

        // Try to load the page
        const response = await page.goto(normalizedUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        const status = {
            hasWebsite: true,
            url: normalizedUrl,
            httpStatus: response?.status() || 0,
            isSSL: normalizedUrl.startsWith('https'),
        };

        // Check HTTP status
        if (!response || response.status() >= 400) {
            status.status = 'broken';
            status.reason = `HTTP ${response?.status() || 'timeout'}`;
            return status;
        }

        // Check for common placeholder/parked domain indicators
        const pageContent = await page.content();
        const pageText = await page.locator('body').textContent();

        if (isPlaceholder(pageContent, pageText)) {
            status.status = 'placeholder';
            status.reason = 'Parked or placeholder domain detected';
            return status;
        }

        // Check if it's an ancient/outdated site
        const isOutdated = await checkIfOutdated(page, pageContent);
        if (isOutdated) {
            status.status = 'outdated';
            status.reason = isOutdated;
            return status;
        }

        // Check mobile responsiveness
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileContent = await page.locator('body').boundingBox();
        status.mobileResponsive = mobileContent?.width <= 400;

        // Site appears active
        status.status = 'active';
        return status;

    } catch (error) {
        return {
            hasWebsite: true,
            url,
            status: 'broken',
            reason: error.message,
            httpStatus: 0,
        };
    } finally {
        await page.close();
    }
}

function isPlaceholder(html, text) {
    const placeholderIndicators = [
        'domain is for sale',
        'this domain is parked',
        'buy this domain',
        'domain expired',
        'coming soon',
        'under construction',
        'website coming soon',
        'godaddy',
        'squarespace.com/templates',
        'wix.com/website',
        'this site can\'t be reached',
        'page not found',
        'default web page',
    ];

    const lowerText = text?.toLowerCase() || '';
    const lowerHtml = html?.toLowerCase() || '';

    for (const indicator of placeholderIndicators) {
        if (lowerText.includes(indicator) || lowerHtml.includes(indicator)) {
            return true;
        }
    }

    // Check if page has very little content
    if (text && text.trim().length < 100) {
        return true;
    }

    return false;
}

async function checkIfOutdated(page, html) {
    const outdatedIndicators = [];

    // Check for old HTML practices
    if (html.includes('<table') && html.includes('cellpadding')) {
        outdatedIndicators.push('Table-based layout');
    }

    // Check for flash
    if (html.includes('swfobject') || html.includes('.swf')) {
        outdatedIndicators.push('Flash content');
    }

    // Check for old jQuery versions
    const jqueryMatch = html.match(/jquery[.-](\d+)\.(\d+)/i);
    if (jqueryMatch && parseInt(jqueryMatch[1]) < 2) {
        outdatedIndicators.push('Old jQuery version');
    }

    // Check for frames
    if (html.includes('<frameset') || html.includes('<frame ')) {
        outdatedIndicators.push('Uses frames');
    }

    // Check viewport meta tag
    if (!html.includes('viewport')) {
        outdatedIndicators.push('No viewport meta tag');
    }

    // Check for copyright dates more than 3 years old
    const currentYear = new Date().getFullYear();
    const copyrightMatch = html.match(/©\s*(\d{4})|copyright\s*(\d{4})/i);
    if (copyrightMatch) {
        const year = parseInt(copyrightMatch[1] || copyrightMatch[2]);
        if (currentYear - year > 3) {
            outdatedIndicators.push(`Copyright ${year}`);
        }
    }

    if (outdatedIndicators.length >= 2) {
        return outdatedIndicators.join(', ');
    }

    return null;
}
