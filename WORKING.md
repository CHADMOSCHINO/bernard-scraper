# Bernard Scraper - What's Working Now

## ✅ FIXED: The scraper is now working!

### What Was Wrong:
- Google Maps navigation was timing out
- Selectors weren't reliable
- Page load strategy was too strict

### What I Fixed:
1. **Direct URL Navigation** - No more typing in search boxes
2. **Better Selectors** - Multiple fallback selectors for business data
3. **Error Handling** - Continues even if one extraction fails
4. **Timeout Adjustments** - More realistic wait times
5. **Simplified Workflow** - Less fragile, more robust

---

## How to Run Bernard

### Quick Start:
```bash
cd /Users/c/Desktop/automation\ for\ leadscraper/bernard-scraper
npm start
```

### What Happens:
1. ✅ Opens headless browser (Playwright)
2. ✅ Searches Google Maps for businesses
3. ✅ Extracts: name, address, phone, website, rating, reviews
4. ✅ Validates each website (broken/placeholder/outdated/active)
5. ✅ Scores leads (Premium/Hot/Warm/Cool)
6. ✅ Pushes everything to your Notion database

---

## Your Current Configuration:

**Cities:** Raleigh, NC  
**Niches:** Web Design  
**Industries:** Restaurants, Gyms, Salons, Contractors, Dentists (first 5)

**To change:** Edit `/bernard-scraper/config/master.json`

---

## Expected Output:

```
🤖 Bernard Lead Scraper Starting...
📍 Processing: Web Design in Raleigh  
  Searching: "restaurants in Raleigh"
    Found 10 potential listings  
    ✓ Extracted: Business Name 1  
    ✓ Extracted: Business Name 2  
    ...  
  ✓ Extracted 47 unique leads from Google Maps  
  
Validating websites...  
  ✓ Checked 47 websites  
  
Scoring leads...  
  Premium=12, Hot=18, Warm=15, Cool=2  
  
Pushing to Notion...  
  Notion: 47 added, 0 failed  
  
✅ Bernard Lead Scraper Complete
```

---

## Troubleshooting

### If It's Still Not Working:

**1. Playwright Not Installed?**
```bash
cd /Users/c/Desktop/automation\ for\ leadscraper/bernard-scraper
npx playwright install chromium
```

**2. Notion Connection Issues?**
```bash
npm run test-notion
```
Should show "✅ Connection test passed!"

**3. Check Your .env File:**
```bash
cat .env
```
Make sure:
- `NOTION_API_KEY=ntn_...` (your actual key)
- `NOTION_DATABASE_ID=2e3a3600c7d58098aa48f721efda3957`

**4. Node Version:**
```bash
node --version
```
Should be v20 or higher

---

## What Gets Pushed to Notion:

Every lead includes:
- Business Name ✅
- City & State ✅  
- Address ✅  
- Phone ✅  
- Website ✅  
- Website Status (None/Broken/Placeholder/Outdated/Active) ✅  
- Hotness Score (Premium/Hot/Warm/Cool) ✅  
- Lead Score (0-100) ✅  
- Reviews Count ✅  
- Star Rating ✅  
- Industry ✅  
- Niche ✅  
- Source (google_maps) ✅  
- Outreach Angle ✅  
- Date Added ✅  

---

## Dashboard Integration (Future):

The dashboard buttons (Initiate & Auto Run) are set up to display status. To wire them to actually trigger the scraper, you'd need to:

1. Create an API endpoint in the dashboard
2. Have it run the scraper via `child_process.exec('npm start')`
3. Stream progress back to the UI

**For now:** Just run `npm start` from terminal when you want leads.

---

## Need Help?

Telegram: @imChadGPT  
Scraper is located at: `/Users/c/Desktop/automation for leadscraper/bernard-scraper/`
