# 🚀 START HERE - Railway Setup

## You Are Here: Ready to Deploy! ✅

Everything is prepared. Just follow the commands below.

---

## 🎯 Quick Start (5 Commands)

Copy and paste these commands **one at a time**:

### 1️⃣ Navigate to Project
```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
```

### 2️⃣ Login to Railway (opens browser)
```bash
railway login
```
**➜ Browser will open → Login with GitHub → Return to terminal**

### 3️⃣ Create Project
```bash
railway init
```
**➜ Type:** `bernard-scraper` **→ Press Enter**

### 4️⃣ Deploy!
```bash
railway up
```
**➜ Wait 2-3 minutes for deployment**

### 5️⃣ Get Your URL
```bash
railway domain
```
**➜ Copy the URL that appears**

---

## 🔑 Then Set Environment Variables

Replace with your actual Notion credentials:

```bash
railway variables set NOTION_API_KEY="your_actual_notion_api_key"
railway variables set NOTION_DATABASE_ID="your_actual_notion_database_id"
```

**Where to find these:**
- **API Key**: https://www.notion.so/my-integrations
- **Database ID**: From your Notion database URL (32-character code)

---

## ✅ Test It Works

```bash
# View logs
railway logs

# Test API (replace YOUR_URL with actual URL)
curl https://YOUR_URL.up.railway.app/api/status
```

**Should return:** `{"isRunning": false, "logs": []}`

---

## 📚 Need More Detail?

- **Step-by-step guide**: `SETUP_RAILWAY_NOW.md`
- **Interactive checklist**: `RAILWAY_CHECKLIST.md`
- **Troubleshooting**: `RAILWAY_DEPLOYMENT_GUIDE.md`

---

## 🆘 Problems?

```bash
# View detailed logs
railway logs --follow

# Check status
railway status

# Open dashboard
railway open

# Restart
railway restart
```

---

## That's It!

Just run the 5 commands above and you're done. 🎉

**Ready? Start with Step 1!** ⬆️
