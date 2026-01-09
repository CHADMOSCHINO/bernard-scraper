/**
 * Setup Notion Database Schema
 * Adds all the columns Bernard needs to your existing database
 * 
 * Run once: node setup-notion.js
 */

import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function setupDatabase() {
    console.log('🔧 Setting up Notion database columns...\n');

    try {
        // Get current database schema
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const existingProps = Object.keys(db.properties);
        console.log('Current columns:', existingProps.join(', '));

        // Define all columns we need
        const requiredProperties = {
            // Contact Information
            'Phone': { phone_number: {} },
            'Email': { email: {} },
            'Website': { url: {} },
            'Address': { rich_text: {} },

            // Scoring
            'Score': { number: { format: 'number' } },
            'hotness': {
                select: {
                    options: [
                        { name: 'Premium', color: 'yellow' },
                        { name: 'Hot', color: 'orange' },
                        { name: 'Warm', color: 'blue' },
                        { name: 'Cool', color: 'gray' },
                    ],
                },
            },

            // Business Details
            'Industry': { select: { options: [] } },
            'Rating': { number: { format: 'number' } },
            'Reviews': { number: { format: 'number' } },

            // Website Analysis
            'Website Status': {
                select: {
                    options: [
                        { name: 'None', color: 'red' },
                        { name: 'Broken', color: 'orange' },
                        { name: 'Placeholder', color: 'yellow' },
                        { name: 'Outdated', color: 'purple' },
                        { name: 'Slow', color: 'pink' },
                        { name: 'Active', color: 'green' },
                    ],
                },
            },

            // Why we scraped them
            'Reason Scraped': { rich_text: {} },
            'What They Need': { rich_text: {} },

            // Outreach
            'Status': {
                select: {
                    options: [
                        { name: 'New', color: 'blue' },
                        { name: 'Contacted', color: 'yellow' },
                        { name: 'Responded', color: 'orange' },
                        { name: 'Meeting', color: 'purple' },
                        { name: 'Converted', color: 'green' },
                        { name: 'Lost', color: 'red' },
                    ],
                },
            },
            'Notes': { rich_text: {} },
        };

        // Add missing properties
        const propsToAdd = {};
        for (const [name, config] of Object.entries(requiredProperties)) {
            if (!existingProps.includes(name)) {
                propsToAdd[name] = config;
                console.log(`  + Adding: ${name}`);
            } else {
                console.log(`  ✓ Exists: ${name}`);
            }
        }

        if (Object.keys(propsToAdd).length > 0) {
            await notion.databases.update({
                database_id: databaseId,
                properties: propsToAdd,
            });
            console.log(`\n✅ Added ${Object.keys(propsToAdd).length} new columns!`);
        } else {
            console.log('\n✅ All columns already exist!');
        }

        console.log('\n📊 Your Notion database is ready for Bernard!\n');
        console.log('Columns available:');
        console.log('  - Name (title)');
        console.log('  - Phone, Email, Website, Address');
        console.log('  - Score (0-100), Hotness (Premium/Hot/Warm/Cool)');
        console.log('  - Industry, Rating, Reviews');
        console.log('  - Website Status, Reason Scraped, What They Need');
        console.log('  - Status, Notes');

    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.code === 'validation_error') {
            console.log('\nNote: Some properties may already exist with different types.');
            console.log('You can manually adjust them in Notion if needed.');
        }
    }
}

setupDatabase();
