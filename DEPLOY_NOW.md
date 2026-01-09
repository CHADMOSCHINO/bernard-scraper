# 🚀 Deploy to Railway NOW - Copy/Paste Commands

## Quick Deploy (Easiest)

```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
./QUICK_DEPLOY.sh
```

---

## Or Run These Commands Manually

### 1️⃣ Navigate to backend
```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
```

### 2️⃣ Login to Railway (opens browser)
```bash
railway login
```

### 3️⃣ Initialize Railway project
```bash
railway init
```
- Type a project name (or press Enter for default)

### 4️⃣ Deploy your backend
```bash
railway up
```
- Wait for deployment to complete (~2-3 minutes)

### 5️⃣ Set environment variables
```bash
railway variables set NOTION_API_KEY="your_actual_notion_api_key"
railway variables set NOTION_DATABASE_ID="your_actual_notion_database_id"
```
⚠️ **Replace with your actual Notion credentials!**

### 6️⃣ Generate public URL
```bash
railway domain
```
- Copy the URL that's displayed
- Example: `https://bernard-scraper-production.up.railway.app`

### 7️⃣ Test your deployment
```bash
railway logs
```
- Look for: "Bernard API Server" and "listening on port..."

### 8️⃣ Test the API
```bash
# Replace YOUR_URL with the actual Railway URL
curl https://YOUR_URL.up.railway.app/api/status
```
Expected: `{"isRunning": false, "logs": []}`

---

## ✅ Success Checklist

After deployment:
- [ ] Railway login successful
- [ ] Project initialized
- [ ] Code deployed (`railway up` succeeded)
- [ ] Environment variables set
- [ ] Public domain generated
- [ ] `/api/status` endpoint returns JSON
- [ ] No errors in `railway logs`

---

## 📋 Next: Update Your Frontend

1. Copy your Railway URL
2. Go to Netlify: https://app.netlify.com
3. Open your `bernard-dashboard` site
4. Site settings → Environment variables
5. Add variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Railway URL (no trailing slash)
6. Trigger redeploy

---

## 🆘 If Something Goes Wrong

```bash
# View logs
railway logs

# Check status
railway status

# Restart service
railway restart

# View environment variables
railway variables

# Open Railway dashboard
railway open
```

---

## 📚 More Help

- Full guide: `RAILWAY_DEPLOYMENT_GUIDE.md`
- Project summary: `DEPLOY_SUMMARY.md`
- Railway docs: https://docs.railway.app

---

**That's it! You're ready to deploy.** 🎉
