/**
 * Bernard API Client
 * Connects frontend to the production backend
 */

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
export const API_BASE = `${API_URL}/api`;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Request helper with retry logic
async function request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(error.error || `Request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on 4xx errors
            if (error instanceof Error && error.message.includes('400')) {
                throw error;
            }

            if (attempt < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }
    }

    throw lastError || new Error('Request failed');
}

// =====================================
// LEADS API
// =====================================

export async function getLeads(limit = 100, cursor = 0) {
    return request(`/api/leads?limit=${limit}&cursor=${cursor}`);
}

export async function searchLeads(query: string, limit = 20) {
    return request(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function exportLeadsCSV() {
    const response = await fetch(`${API_URL}/api/leads/export.csv`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bernard-leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// =====================================
// JOBS API
// =====================================

export async function getRuns(limit = 50) {
    return request(`/api/runs?limit=${limit}`);
}

export async function getLeadsForRun(runId: number) {
    return request(`/api/runs/${runId}/leads`);
}

export async function getStatus() {
    return request('/api/status');
}

export async function getConfig() {
    return request('/api/config');
}

export async function updateConfig(config: Record<string, any>) {
    return request('/api/config', {
        method: 'POST',
        body: JSON.stringify(config),
    });
}

export async function startScrape(options?: {
    city?: string;
    state?: string;
    niche?: string;
    maxLeads?: number;
}) {
    return request('/api/scan/single', {
        method: 'POST',
        body: JSON.stringify(options || {}),
    });
}

export async function stopScrape() {
    return request('/api/scan/stop', { method: 'POST' });
}

// =====================================
// AI API (Gemini)
// =====================================

export async function getAIStatus() {
    return request('/api/ai/status');
}

export async function createJobWithAI(prompt: string, contextLocation?: string) {
    return request('/api/ai/create-job', {
        method: 'POST',
        body: JSON.stringify({ prompt, contextLocation }),
    });
}

export async function scoreLead(lead: Record<string, any>) {
    return request('/api/ai/score-lead', {
        method: 'POST',
        body: JSON.stringify(lead),
    });
}

export async function enrichLead(lead: Record<string, any>) {
    return request('/api/ai/enrich-lead', {
        method: 'POST',
        body: JSON.stringify(lead),
    });
}

export async function generateOutreach(lead: Record<string, any>, template = 'cold_email') {
    return request('/api/ai/generate-outreach', {
        method: 'POST',
        body: JSON.stringify({ lead, template }),
    });
}

export async function scoreLeadsBatch(leads: Record<string, any>[]) {
    return request('/api/ai/score-batch', {
        method: 'POST',
        body: JSON.stringify({ leads }),
    });
}

// =====================================
// STATS & CREDITS
// =====================================

export async function getStats() {
    return request('/api/stats');
}

export async function getCredits() {
    return request('/api/credits');
}

export async function deductCredits(amount: number) {
    return request('/api/credits/deduct', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
}

// =====================================
// REAL-TIME
// =====================================

export async function getLiveFeed() {
    return request('/api/live-feed');
}

export async function getVitalityFeed() {
    return request('/api/vitality/feed');
}

// =====================================
// POLLING (for real-time simulation)
// =====================================

export function createPollingService(options: {
    onStats?: (stats: any) => void;
    onFeed?: (feed: any[]) => void;
    onCredits?: (credits: any) => void;
    interval?: number;
}) {
    const { interval = 5000 } = options;
    let active = true;

    const poll = async () => {
        while (active) {
            try {
                if (options.onStats) {
                    const stats = await getStats();
                    options.onStats(stats);
                }

                if (options.onFeed) {
                    const { feed } = await getLiveFeed();
                    options.onFeed(feed);
                }

                if (options.onCredits) {
                    const credits = await getCredits();
                    options.onCredits(credits);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }
    };

    poll();

    return {
        stop: () => { active = false; },
    };
}
