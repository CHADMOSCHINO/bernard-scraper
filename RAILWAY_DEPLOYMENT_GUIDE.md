# 🚂 Railway Deployment Guide - Bernard Scraper Backend

Your backend is **100% ready** for Railway deployment! Follow these simple steps:

## ✅ Pre-Deployment Checklist (Already Done!)

- ✅ Git repository initialized
- ✅ `.gitignore` configured
- ✅ Railway CLI installed
- ✅ Code committed to git
- ✅ `railway.json` configuration ready
- ✅ `railway.toml` with health checks
- ✅ `server.js` with Express API
- ✅ `Procfile` for Railway

---

## 🚀 Deployment Steps

### Step 1: Login to Railway

```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
railway login
```

This will open your browser. Log in with GitHub (recommended) or email.

---

### Step 2: Initialize Railway Project

```bash
railway init
```

When prompted:
- **Project name**: `bernard-scraper` (or your preferred name)
- Press Enter to confirm

---

### Step 3: Deploy Your Backend

```bash
railway up
```

This will:
1. Upload your code to Railway
2. Install dependencies (`npm install`)
3. Build your project
4. Start the server with `npm run server`

Wait for the deployment to complete. You'll see output like:
```
✓ Deployment successful
```

---

### Step 4: Set Environment Variables

You need to configure your Notion credentials:

```bash
railway variables set NOTION_API_KEY="your_actual_notion_api_key_here"
railway variables set NOTION_DATABASE_ID="your_actual_notion_database_id_here"
```

**Important**: Replace the placeholder values with your actual Notion credentials!

Or set them via the Railway Dashboard:
1. Go to https://railway.app/dashboard
2. Select your project
3. Click on your service
4. Go to **Variables** tab
5. Add:
   - `NOTION_API_KEY` = your Notion API key
   - `NOTION_DATABASE_ID` = your Notion database ID

---

### Step 5: Get Your Public URL

Generate a public domain for your backend:

```bash
railway domain
```

This will output something like:
```
https://bernard-scraper-production.up.railway.app
```

**Copy this URL!** You'll need it for your frontend configuration.

---

### Step 6: Test Your Deployment

Test the status endpoint:

```bash
curl https://your-railway-url.up.railway.app/api/status
```

Expected response:
```json
{"isRunning": false, "logs": []}
```

---

## 📋 Quick Reference Commands

```bash
# View logs
railway logs

# Check status
railway status

# Open Railway dashboard
railway open

# Restart service
railway restart

# View environment variables
railway variables

# Link to existing project (if needed)
railway link
```

---

## 🔍 Your Backend Endpoints

Once deployed, your backend will have these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Check if scraper is running |
| `/api/config` | GET | Get current configuration |
| `/api/config` | POST | Update configuration |
| `/api/scan/single` | POST | Run single scan |
| `/api/scan/auto` | POST | Run 5-day auto mode |
| `/api/scan/stop` | POST | Stop running scan |
| `/api/clear` | POST | Clear Notion database |
| `/api/logs` | GET | Get recent logs |

---

## 🎯 What to Do Next

1. **Get your Railway URL** from Step 5
2. **Update your frontend** to use this URL:
   - In `bernard-dashboard`, set `NEXT_PUBLIC_API_URL` to your Railway URL
   - Redeploy your frontend to Netlify

3. **Test the integration**:
   - Visit your frontend
   - Click "Initiate" button
   - Check if it connects to the backend
   - Monitor logs in Railway dashboard

---

## ⚙️ Railway Configuration Summary

Your deployment uses these settings (already configured):

- **Start Command**: `npm run server`
- **Health Check**: `/api/status`
- **Port**: Automatically set by Railway (via `process.env.PORT`)
- **Builder**: Nixpacks (Railway's default)
- **Restart Policy**: ON_FAILURE (max 10 retries)

---

## 🐛 Troubleshooting

### Deployment fails with "Module not found"
```bash
# Ensure all dependencies are in package.json
railway up --force
```

### Can't access the API
- Check if the service is running: `railway status`
- View logs: `railway logs`
- Ensure you generated a public domain: `railway domain`

### Environment variables not working
```bash
# List current variables
railway variables

# Set them again if needed
railway variables set NOTION_API_KEY="your_key"
```

### Port binding errors
Railway automatically sets the `PORT` environment variable. Your `server.js` already handles this:
```javascript
const PORT = process.env.PORT || 3001;
```

### Playwright issues on Railway
If you encounter Playwright browser installation issues, add this to your `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx playwright install --with-deps chromium"
  }
}
```

---

## 💡 Pro Tips

1. **Monitor your deployment**: Use `railway logs --follow` to see real-time logs
2. **Environment management**: Railway automatically restarts your service when you change environment variables
3. **Custom domains**: You can add your own domain in Railway dashboard → Settings → Domains
4. **Scaling**: Railway automatically scales based on usage (pay-as-you-go)

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Your Project: Run `railway open` to open in browser

---

## ✅ Deployment Checklist

- [ ] Run `railway login`
- [ ] Run `railway init`
- [ ] Run `railway up`
- [ ] Set `NOTION_API_KEY` variable
- [ ] Set `NOTION_DATABASE_ID` variable
- [ ] Run `railway domain` to get URL
- [ ] Test `/api/status` endpoint
- [ ] Copy URL for frontend configuration
- [ ] Update frontend `NEXT_PUBLIC_API_URL`
- [ ] Redeploy frontend to Netlify
- [ ] Test end-to-end integration

---

**Your backend is ready to deploy! Just run the commands above.** 🚀
