/**
 * Gemini AI Service for Bernard
 * Handles all AI-powered features: lead scoring, intent parsing, enrichment
 */

import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// In-memory cache for frequent calls (production: use Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 100; // 100ms between calls

/**
 * Make a call to Gemini API with retry logic
 */
async function callGemini(prompt, options = {}) {
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not configured');
        return null;
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastCallTime < MIN_CALL_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL));
    }
    lastCallTime = Date.now();

    // Check cache
    const cacheKey = `gemini:${Buffer.from(prompt).toString('base64').slice(0, 64)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const maxRetries = options.retries || 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxTokens || 1024,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                if (response.status === 429) {
                    // Rate limited - exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Rate limited, waiting ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new Error(`Gemini API error ${response.status}: ${error}`);
            }

            const data = await response.json();
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Cache successful response
            cache.set(cacheKey, { data: result, timestamp: Date.now() });

            return result;
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 500;
                console.log(`Gemini retry ${attempt}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error('Gemini call failed after retries:', lastError);
    return null;
}

/**
 * Parse natural language job creation prompt
 */
export async function parseJobIntent(prompt, contextLocation = null) {
    const systemPrompt = `You are a lead scraping assistant. Parse this job request and extract:
- niche: the type of business to scrape (e.g., "restaurants", "plumbers", "dentists")
- city: target city
- state: US state code (e.g., "CA", "TX", "NY")
- maxLeads: number of leads requested (default 50)
- filters: any special requirements (e.g., "has website", "open Sunday")

User context location: ${contextLocation || 'Unknown'}
User request: "${prompt}"

Respond in JSON format only:
{"niche": "string", "city": "string", "state": "string", "maxLeads": number, "filters": {}, "confidence": 0.0-1.0}`;

    const result = await callGemini(systemPrompt, { temperature: 0.3 });
    if (!result) return null;

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error('Failed to parse job intent:', e);
    }
    return null;
}

/**
 * Score a lead for sales potential (0-100)
 */
export async function scoreLeadWithAI(lead) {
    const prompt = `Score this business lead for sales potential (0-100).
Consider: completeness of info, industry value, growth signals.

Business: ${lead.name}
Phone: ${lead.phone || 'N/A'}
Email: ${lead.email || 'N/A'}
Website: ${lead.website || 'N/A'}
Address: ${lead.address || 'N/A'}
Description: ${lead.description || 'N/A'}
Source: ${lead.source || 'Google Maps'}

Respond JSON only:
{"score": number, "intent": "hot"|"warm"|"cold", "confidence": 0.0-1.0, "signals": ["signal1", "signal2"], "suggestedAction": "brief next step"}`;

    const result = await callGemini(prompt, { temperature: 0.4 });
    if (!result) {
        return { score: 50, intent: 'warm', confidence: 0, signals: [], suggestedAction: 'Manual review' };
    }

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error('Failed to parse lead score:', e);
    }
    return { score: 50, intent: 'warm', confidence: 0, signals: [], suggestedAction: 'Manual review' };
}

/**
 * Enrich lead data with AI insights
 */
export async function enrichLeadWithAI(lead) {
    const prompt = `Analyze this business and provide enrichment data:

Business: ${lead.name}
Location: ${lead.address || 'Unknown'}
Website: ${lead.website || 'N/A'}
Description: ${lead.description || 'N/A'}

Provide JSON with:
{"industry": "string", "estimatedSize": "small|medium|large", "likelyServices": ["service1"], "potentialPainPoints": ["pain1"], "bestContactApproach": "string", "idealTimezone": "string"}`;

    const result = await callGemini(prompt, { temperature: 0.5 });
    if (!result) return null;

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error('Failed to parse enrichment:', e);
    }
    return null;
}

/**
 * Generate personalized outreach message
 */
export async function generateOutreach(lead, template = 'cold_email') {
    const prompt = `Write a short, personalized ${template.replace('_', ' ')} for:

Business: ${lead.name}
Industry: ${lead.niche || 'Business Services'}
Location: ${lead.city || 'their area'}
Pain Point: Lead generation and customer acquisition

Keep it under 80 words, friendly, value-focused. No placeholder brackets.`;

    return await callGemini(prompt, { temperature: 0.7 });
}

/**
 * Detect anomalies in scraping results
 */
export async function detectAnomalies(results) {
    const prompt = `Analyze these scraping results for anomalies:

Total leads: ${results.total}
By source: ${JSON.stringify(results.bySrouce || {})}
Average per hour: ${results.avgPerHour || 'N/A'}
Error rate: ${results.errorRate || 0}%

Identify any concerning patterns. Respond JSON:
{"anomalyDetected": boolean, "severity": "low"|"medium"|"high", "issues": ["issue1"], "recommendations": ["rec1"]}`;

    const result = await callGemini(prompt, { temperature: 0.3 });
    if (!result) {
        return { anomalyDetected: false, severity: 'low', issues: [], recommendations: [] };
    }

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error('Failed to parse anomalies:', e);
    }
    return { anomalyDetected: false, severity: 'low', issues: [], recommendations: [] };
}

/**
 * Get predictive analytics for conversion
 */
export async function predictConversion(lead, historicalData = {}) {
    const prompt = `Predict conversion probability for this lead:

Business: ${lead.name}
Vitality Score: ${lead.vitality_score || 50}
Signals: ${JSON.stringify(lead.signals || [])}
Historical avg conversion: ${historicalData.avgConversion || 15}%

Respond JSON:
{"conversionProbability": 0.0-1.0, "bestNextAction": "string", "optimalContactTime": "string", "riskFactors": ["factor1"]}`;

    const result = await callGemini(prompt, { temperature: 0.4 });
    if (!result) {
        return { conversionProbability: 0.15, bestNextAction: 'Follow up', optimalContactTime: 'Morning', riskFactors: [] };
    }

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error('Failed to parse prediction:', e);
    }
    return { conversionProbability: 0.15, bestNextAction: 'Follow up', optimalContactTime: 'Morning', riskFactors: [] };
}

/**
 * Check if Gemini is configured and working
 */
export async function checkGeminiStatus() {
    if (!GEMINI_API_KEY) {
        return { active: false, model: 'Not configured', error: 'No API key' };
    }

    try {
        const response = await callGemini('Respond with exactly: OK', { retries: 1 });
        return {
            active: response?.toLowerCase().includes('ok'),
            model: 'Gemini 2.0 Flash',
            cacheSize: cache.size
        };
    } catch (error) {
        return { active: false, model: 'Gemini 2.0 Flash', error: error.message };
    }
}

/**
 * Clear cache (useful for forcing fresh data)
 */
export function clearCache() {
    cache.clear();
    return { cleared: true, timestamp: new Date().toISOString() };
}
