import { Client } from '@notionhq/client';
import { google } from 'googleapis';
import { getConnector, saveConnector } from '../db/db.js';

// ============================================================================
// NOTION INTEGRATION
// ============================================================================

export async function verifyNotion(apiKey) {
    try {
        const notion = new Client({ auth: apiKey });
        // Try to list databases to verify the key and getting a list of potential targets
        const response = await notion.search({
            filter: { property: 'object', value: 'database' },
            page_size: 100
        });
        return {
            valid: true,
            databases: response.results.map(db => ({
                id: db.id,
                name: db.title?.[0]?.plain_text || 'Untitled Database',
                icon: db.icon
            }))
        };
    } catch (error) {
        console.error('Notion Verification Error:', error.message);
        return { valid: false, error: error.message };
    }
}

export async function pushToNotion(apiKey, databaseId, leads) {
    const notion = new Client({ auth: apiKey });
    const results = { success: 0, failed: 0, errors: [] };

    for (const lead of leads) {
        try {
            await notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    Name: {
                        title: [{ text: { content: lead.name || 'Unknown' } }]
                    },
                    Company: {
                        rich_text: [{ text: { content: lead.name || '' } }]
                    },
                    Phone: {
                        phone_number: lead.phone || null
                    },
                    Email: {
                        email: lead.email || null
                    },
                    Website: {
                        url: lead.website || null
                    },
                    Address: {
                        rich_text: [{ text: { content: lead.address || '' } }]
                    },
                    Status: {
                        select: { name: 'New Lead' }
                    },
                    Source: {
                        select: { name: lead.source || 'Bernard.ai' }
                    },
                    "Vitality Score": {
                        number: lead.vitality_score || 0
                    }
                }
            });
            results.success++;
        } catch (error) {
            console.error(`Failed to push lead ${lead.name} to Notion:`, error.message);
            results.failed++;
            results.errors.push(error.message);
        }
    }

    return results;
}

// ============================================================================
// GOOGLE INTEGRATION
// ============================================================================

// These should be in your .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';

export const googleOauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

export function getGoogleAuthUrl() {
    const scopes = [
        'https://www.googleapis.com/auth/drive.file', // Create/edit files created by this app
        'https://www.googleapis.com/auth/spreadsheets' // Manage sheets
    ];

    return googleOauth2Client.generateAuthUrl({
        access_type: 'offline', // Get a refresh token
        scope: scopes,
        prompt: 'consent' // Force consent to ensure refresh token
    });
}

export async function createGoogleSheet(auth, title) {
    const sheets = google.sheets({ version: 'v4', auth });
    const resource = {
        properties: {
            title,
        },
    };
    const spreadsheet = await sheets.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
    });

    // Add header row
    await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.data.spreadsheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        resource: {
            values: [['Name', 'Phone', 'Email', 'Website', 'Address', 'Source', 'Vitality Score', 'Description', 'Created At']]
        }
    });

    return spreadsheet.data.spreadsheetId;
}

export async function pushToGoogleSheet(auth, spreadsheetId, leads) {
    const sheets = google.sheets({ version: 'v4', auth });

    const rows = leads.map(lead => [
        lead.name || '',
        lead.phone || '',
        lead.email || '',
        lead.website || '',
        lead.address || '',
        lead.source || '',
        lead.vitality_score || 0,
        lead.description || '',
        lead.created_at || new Date().toISOString()
    ]);

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A1', // Appends to the first sheet found
        valueInputOption: 'RAW',
        resource: { values: rows }
    });

    return { success: rows.length };
}

// Helper to get authenticated client from DB tokens
export async function getAuthenticatedGoogleClient() {
    const connector = await getConnector('google');
    if (!connector || !connector.access_token) {
        throw new Error('Google Drive not connected');
    }

    const client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
        access_token: connector.access_token,
        refresh_token: connector.refresh_token
    });

    // Handle token refresh automatically
    client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            console.log('🔄 Refreshing Google Access Token...');
            await saveConnector('google', connector.config, tokens.access_token, tokens.refresh_token);
        }
    });

    return client;
}
