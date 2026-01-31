// Gemini AI Integration for Bernard.ai
// Provides AI-powered lead scoring, intent detection, and content generation

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
}

interface LeadScoreResult {
    score: number;
    intent: 'hot' | 'warm' | 'cold';
    reasoning: string;
    suggestedAction: string;
}

// Generate content using Gemini
export async function generateWithGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured');
        return '';
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('Gemini generation error:', error);
        return '';
    }
}

// Score a lead using AI
export async function scoreLeadWithAI(lead: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    description?: string;
}): Promise<LeadScoreResult> {
    const prompt = `Analyze this business lead and provide a score from 1-100, intent level (hot/warm/cold), and a brief action suggestion.

Lead Details:
- Business Name: ${lead.name}
- Email: ${lead.email || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Website: ${lead.website || 'N/A'}
- Description: ${lead.description || 'N/A'}

Respond in JSON format only:
{"score": number, "intent": "hot"|"warm"|"cold", "reasoning": "brief explanation", "suggestedAction": "next step"}`;

    try {
        const response = await generateWithGemini(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Lead scoring error:', error);
    }

    // Default fallback
    return {
        score: 50,
        intent: 'warm',
        reasoning: 'Unable to analyze lead',
        suggestedAction: 'Manual review recommended'
    };
}

// Generate outreach email
export async function generateOutreachEmail(lead: {
    name: string;
    industry?: string;
    pain_point?: string;
}): Promise<string> {
    const prompt = `Write a short, professional cold outreach email for:
Business: ${lead.name}
Industry: ${lead.industry || 'General'}
Pain Point: ${lead.pain_point || 'Lead generation'}

Keep it under 100 words, friendly, and value-focused. No placeholders.`;

    return await generateWithGemini(prompt);
}

// Analyze scraping results
export async function analyzeScrapingResults(results: {
    total: number;
    byCategory: Record<string, number>;
    topLocations: string[];
}): Promise<string> {
    const prompt = `Provide a brief 2-3 sentence insight about these scraping results:
- Total leads: ${results.total}
- By category: ${JSON.stringify(results.byCategory)}
- Top locations: ${results.topLocations.join(', ')}

Be specific and actionable.`;

    return await generateWithGemini(prompt);
}

// Check if Gemini is configured
export function isGeminiConfigured(): boolean {
    return Boolean(GEMINI_API_KEY);
}

// Get API status
export async function checkGeminiStatus(): Promise<{ active: boolean; model: string }> {
    if (!GEMINI_API_KEY) {
        return { active: false, model: 'Not configured' };
    }

    try {
        const response = await generateWithGemini('Say "OK" in one word.');
        return {
            active: response.toLowerCase().includes('ok'),
            model: 'Gemini 2.0 Flash'
        };
    } catch {
        return { active: false, model: 'Connection error' };
    }
}
