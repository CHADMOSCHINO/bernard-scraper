/**
 * Test Notion Connection
 * Run this to verify your API key works before running the full scraper
 */

import { Client } from '@notionhq/client';
import 'dotenv/config';

async function testNotionConnection() {
    console.log('🔍 Testing Notion Connection...\n');

    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    // Check API key
    if (!apiKey || apiKey === 'your_api_key_here') {
        console.log('❌ NOTION_API_KEY not set in .env file');
        console.log('   Please add your API key to /bernard-scraper/.env\n');
        process.exit(1);
    }

    console.log('✅ API Key found');

    // Check database ID
    if (!databaseId || databaseId === 'your_database_id_here') {
        console.log('⚠️  NOTION_DATABASE_ID not set in .env file');
        console.log('   You need to create a database and add its ID to .env');
        console.log('   See README.md for instructions\n');
        process.exit(1);
    }

    console.log('✅ Database ID found');

    // Try to connect
    try {
        const notion = new Client({ auth: apiKey });

        console.log('\n🔌 Connecting to Notion...');
        const database = await notion.databases.retrieve({ database_id: databaseId });

        console.log('✅ Connection successful!\n');
        console.log('📊 Database Info:');
        console.log(`   Name: ${database.title[0]?.plain_text || 'Untitled'}`);
        console.log(`   ID: ${database.id}`);
        console.log(`   Created: ${new Date(database.created_time).toLocaleDateString()}`);


        console.log('\n✅ Connection test passed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Make sure your database has a Title property (any name is fine)');
        console.log('   2. Run: npm start');
        console.log('   3. Bernard will scrape leads and push them to this database');
        console.log('\n💡 Tip: The scraper will auto-create columns it needs in Notion\n');

    } catch (error) {
        console.log('❌ Connection failed\n');
        console.log('Error:', error.message);

        if (error.code === 'object_not_found') {
            console.log('\n💡 This usually means:');
            console.log('   1. The database ID is incorrect');
            console.log('   2. You haven\'t shared the database with your integration');
            console.log('   → Go to your database → ••• → Add connections → Bernard Lead Scraper\n');
        } else if (error.code === 'unauthorized') {
            console.log('\n💡 The API key is invalid or doesn\'t have access');
            console.log('   → Check your integration settings at notion.so/my-integrations\n');
        }

        process.exit(1);
    }
}

testNotionConnection();
