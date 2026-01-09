/**
 * Lead Scoring / Triage
 * Ranks leads by "hotness" using configurable scoring rules
 */

export function scoreLeads(leads, scoringRules) {
    return leads.map(lead => {
        const score = calculateScore(lead);
        const hotness = determineHotness(lead, score, scoringRules);

        return {
            ...lead,
            score,
            hotness,
        };
    }).sort((a, b) => b.score - a.score);
}

function calculateScore(lead) {
    let score = 0;

    // Website status scoring
    if (!lead.website || lead.websiteStatus?.status === 'none') {
        score += 40; // No website = high opportunity
    } else if (lead.websiteStatus?.status === 'broken') {
        score += 35;
    } else if (lead.websiteStatus?.status === 'placeholder') {
        score += 30;
    } else if (lead.websiteStatus?.status === 'outdated') {
        score += 25;
    }

    // Review count scoring
    if (lead.reviewCount >= 100) {
        score += 20;
    } else if (lead.reviewCount >= 50) {
        score += 15;
    } else if (lead.reviewCount >= 20) {
        score += 10;
    } else if (lead.reviewCount >= 5) {
        score += 5;
    }

    // Rating scoring
    if (lead.rating >= 4.5) {
        score += 10;
    } else if (lead.rating >= 4.0) {
        score += 7;
    } else if (lead.rating >= 3.5) {
        score += 3;
    }

    // Has phone number
    if (lead.phone) {
        score += 5;
    }

    // Mobile responsive check
    if (lead.websiteStatus?.mobileResponsive === false) {
        score += 10; // Not mobile responsive = opportunity
    }

    return score;
}

function determineHotness(lead, score, scoringRules) {
    // Premium: No website + lots of reviews + high rating
    if (score >= 60) {
        return 'premium';
    }

    // Hot: Broken/placeholder + good reviews
    if (score >= 45) {
        return 'hot';
    }

    // Warm: Some issues, decent presence
    if (score >= 30) {
        return 'warm';
    }

    // Cool: Lower priority but worth tracking
    return 'cool';
}

export function generateSummary(leads) {
    const summary = {
        total: leads.length,
        byHotness: {
            premium: leads.filter(l => l.hotness === 'premium').length,
            hot: leads.filter(l => l.hotness === 'hot').length,
            warm: leads.filter(l => l.hotness === 'warm').length,
            cool: leads.filter(l => l.hotness === 'cool').length,
        },
        byWebsiteStatus: {
            none: leads.filter(l => l.websiteStatus?.status === 'none').length,
            broken: leads.filter(l => l.websiteStatus?.status === 'broken').length,
            placeholder: leads.filter(l => l.websiteStatus?.status === 'placeholder').length,
            outdated: leads.filter(l => l.websiteStatus?.status === 'outdated').length,
            active: leads.filter(l => l.websiteStatus?.status === 'active').length,
        },
        topLeads: leads.slice(0, 10).map(l => ({
            name: l.name,
            hotness: l.hotness,
            score: l.score,
            website: l.websiteStatus?.status || 'unknown',
        })),
    };

    return summary;
}
