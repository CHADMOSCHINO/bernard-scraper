# Bernard Scraper - Setup Guide

## ✅ Notion Integration Connected!

Your Notion API key is already configured. Just one more step:

---

## Get Your Notion Database ID

1. **Create a new Database in Notion:**
   - Open Notion
   - Create a new page
   - Type `/database` and select "Database - Inline"
   - Title it "Bernard Lead Database"

2. **Share with Bernard Integration:**
   - Click the `•••` menu (top right of database)
   - Select "Add connections"
   - Find and select "Bernard Lead Scraper" (your integration)

3. **Copy the Database ID:**
   - Open the database as a full page
   - Look at the URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - Copy the part that looks like: `a1b2c3d4e5f67890a1b2c3d4e5f67890`
   - It's the long string of letters/numbers before the `?v=`

4. **Add it to your .env file:**
   ```bash
   cd /Users/c/Desktop/automation\ for\ leadscraper/bernard-scraper
   nano .env
   ```
   Replace `your_database_id_here` with your actual database ID

---

## Database Schema

Bernard will auto-create these columns when it pushes leads:

- **Business Name** (Title)
- **City** (Select)
- **State** (Text)
- **Address** (Text)
- **Phone** (Phone)
- **Website** (URL)
- **Website Status** (Select: None, Broken, Placeholder, Outdated, Active)
- **Hotness** (Select: Premium, Hot, Warm, Cool)
- **Score** (Number)
- **Reviews Count** (Number)
- **Rating** (Number)
- **Industry** (Select)
- **Niche** (Select)
- **Source** (Select)
- **Outreach Angle** (Text)
- **Notes** (Text)
- **Status** (Select: New, Contacted, In Progress, Converted, Lost)
- **Date Added** (Created Time)

---

## Run the Scraper

Once you have the database ID configured:

```bash
cd /Users/c/Desktop/automation\ for\ leadscraper/bernard-scraper
npm start
```

This will:
1. Load your city/niche config (currently: Raleigh / Web Design)
2. Scrape Google Maps for businesses
3. Check their websites
4. Score them as Premium/Hot/Warm/Cool
5. Push to your Notion database

---

## Customize What to Scrape

Edit `config/master.json` to change:
- **Cities**: `["miami", "atlanta", "chicago"]`
- **Niches**: `["web-design", "payment-processors"]`

New city/niche JSON files are in:
- `config/cities/` - Add new cities
- `config/niches/` - Add new niches

---

## Need Help?

Contact @imChadGPT on Telegram
