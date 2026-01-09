# 🚂 Railway Setup - Step by Step Guide

## Current Status: ✅ Railway CLI Installed (v4.23.0)

Follow these steps **in order**. I'll help you through each one!

---

## 📝 Step 1: Login to Railway

Open your **terminal** and run:

```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
railway login
```

**What will happen:**
1. A browser window will open
2. You'll see Railway's login page
3. Click **"Login with GitHub"** (recommended) or use email
4. Authorize the Railway CLI
5. Browser will show "You can close this window"
6. Return to terminal - you should see "Logged in successfully"

**Don't have a Railway account?**
- Railway will prompt you to sign up
- GitHub authentication is fastest
- It's free (includes $5/month credit)

---

## 🎯 Step 2: Create/Initialize Project

After logging in, run:

```bash
railway init
```

**You'll be asked:**

```
? Enter project name (or leave blank to generate one): 
```

**Options:**
- **Type**: `bernard-scraper` (recommended)
- **Or**: Press Enter to let Railway generate a name
- **Or**: Type your own custom name

**What happens:**
- Railway creates a new project
- Links your local folder to the project
- Creates a `.railway` folder (hidden)

---

## 🚀 Step 3: Deploy Your Backend

Now deploy your code:

```bash
railway up
```

**What you'll see:**
```
[nixpacks] Building...
[nixpacks] Installing dependencies...
[nixpacks] Running npm install...
[nixpacks] Build complete!
[railway] Deploying...
[railway] ✓ Deployment successful
[railway] URL: https://bernard-scraper-production-xxxxx.up.railway.app
```

**This takes 2-3 minutes.** Railway will:
1. Upload your code
2. Detect Node.js automatically
3. Run `npm install`
4. Start your server with `npm run server`

**Wait for:** `✓ Deployment successful`

---

## 🔑 Step 4: Set Environment Variables

Your app needs Notion credentials to work. Run these commands:

```bash
railway variables set NOTION_API_KEY="your_actual_notion_key_here"
railway variables set NOTION_DATABASE_ID="your_actual_database_id_here"
```

### 🔍 Where to Find These:

**NOTION_API_KEY:**
1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name it "Bernard Scraper"
4. Copy the "Internal Integration Token"
5. That's your API key

**NOTION_DATABASE_ID:**
1. Open your Notion database
2. Click "Share" button (top right)
3. Copy the link
4. The database ID is the 32-character code in the URL:
   ```
   https://notion.so/workspace/DATABASE_ID?v=...
                              ^^^^^^^^^^^^ this part
   ```

**After setting variables:**
- Railway automatically restarts your service
- Wait ~30 seconds for restart

---

## 🌐 Step 5: Generate Public Domain

Make your API accessible via public URL:

```bash
railway domain
```

**Output:**
```
https://bernard-scraper-production.up.railway.app
```

**📋 COPY THIS URL!** You'll need it for:
- Testing your backend
- Configuring your frontend

---

## ✅ Step 6: Verify Deployment

Test that everything works:

```bash
# View logs
railway logs

# Test the API (replace with your actual URL)
curl https://your-railway-url.up.railway.app/api/status
```

**Expected response:**
```json
{"isRunning": false, "logs": []}
```

If you see this, **your backend is live!** 🎉

---

## 🎨 Step 7: Open Railway Dashboard (Optional)

To see your deployment visually:

```bash
railway open
```

This opens the Railway dashboard where you can:
- View logs in real-time
- Monitor resource usage
- See deployment history
- Manage environment variables
- Check service health

---

## 📊 Verify Everything is Working

Run these checks:

### 1. Check Service Status
```bash
railway status
```
Should show: `✓ Service is healthy`

### 2. View Recent Logs
```bash
railway logs --tail 20
```
Look for: `"Bernard API Server"` message

### 3. Test Each Endpoint
```bash
# Replace YOUR_URL with your actual Railway URL

# Health check
curl https://YOUR_URL.up.railway.app/api/status

# Get config
curl https://YOUR_URL.up.railway.app/api/config

# Get logs
curl https://YOUR_URL.up.railway.app/api/logs
```

---

## 🎯 Next: Connect Your Frontend

Now that your backend is deployed:

### 1. Copy your Railway URL

### 2. Update Netlify (if you have frontend deployed)
```bash
# Go to Netlify dashboard
# Site Settings → Environment Variables
# Add new variable:
#   Key: NEXT_PUBLIC_API_URL
#   Value: https://your-railway-url.up.railway.app (no trailing slash)
# Click "Redeploy"
```

### 3. Test the Integration
- Visit your frontend URL
- Click "Initiate" button
- Should connect to Railway backend
- Check status updates

---

## 📋 Summary of Commands You Ran

```bash
# 1. Login
railway login

# 2. Initialize project
railway init

# 3. Deploy
railway up

# 4. Set environment variables
railway variables set NOTION_API_KEY="your_key"
railway variables set NOTION_DATABASE_ID="your_db_id"

# 5. Generate public domain
railway domain

# 6. View logs
railway logs
```

---

## 🔧 Useful Commands Going Forward

```bash
# View real-time logs
railway logs --follow

# Check status
railway status

# Restart service
railway restart

# List environment variables
railway variables

# Open dashboard
railway open

# Redeploy (after code changes)
railway up

# Link to existing project (if you start in new terminal)
railway link
```

---

## 🐛 Troubleshooting

### "Cannot login in non-interactive mode"
- Make sure you're running in a regular terminal (not script)
- Railway needs to open a browser window

### "No railway project found"
- Run `railway init` first
- Or `railway link` to connect to existing project

### "Service unhealthy"
```bash
railway logs
```
Check for error messages about missing environment variables

### "Port binding failed"
- Don't worry! Railway sets PORT automatically
- Your code already handles this: `const PORT = process.env.PORT || 3001`

### "Module not found" errors
```bash
# Force reinstall dependencies
railway up --force
```

---

## ✅ Setup Complete Checklist

- [ ] Railway CLI installed (v4.23.0) ✅
- [ ] Logged in to Railway
- [ ] Project initialized
- [ ] Code deployed
- [ ] Environment variables set (Notion keys)
- [ ] Public domain generated
- [ ] `/api/status` endpoint working
- [ ] Logs show no errors
- [ ] Railway URL copied

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit per month
- **Your usage**: Typically $3-5/month for this project
- **What you get**: 
  - 512MB RAM
  - 1GB disk
  - Shared CPU
  - Unlimited bandwidth

Perfect for development and small-scale production!

---

## 🆘 Need Help?

1. Check Railway docs: https://docs.railway.app
2. View your dashboard: `railway open`
3. Check logs: `railway logs --follow`
4. Railway Discord: https://discord.gg/railway

---

**Ready to start? Begin with Step 1!** 🚀

Run this command to begin:
```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper" && railway login
```
