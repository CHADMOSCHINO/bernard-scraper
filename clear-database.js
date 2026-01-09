/**
 * Clear Notion Database
 * Removes all existing entries to start fresh
 */

import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function clearDatabase() {
    console.log('🗑️  Clearing Notion database...\n');

    try {
        // Get all pages in the database
        let hasMore = true;
        let startCursor = undefined;
        let deletedCount = 0;

        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                start_cursor: startCursor,
                page_size: 100,
            });

            for (const page of response.results) {
                await notion.pages.update({
                    page_id: page.id,
                    archived: true, // Archive = delete
                });
                deletedCount++;
                process.stdout.write(`\r  Deleted: ${deletedCount} entries`);
            }

            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }

        console.log(`\n\n✅ Cleared ${deletedCount} entries from database`);
        console.log('📊 Database is now empty and ready for fresh leads!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

clearDatabase();
