# ✅ Railway Setup Checklist

Use this to track your progress!

---

## Pre-Setup (Already Done!)

- [x] Railway CLI installed
- [x] Git repository initialized
- [x] Code committed to git
- [x] Configuration files ready

---

## Step-by-Step Setup

### Step 1: Login to Railway
```bash
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"
railway login
```

- [ ] Command executed
- [ ] Browser window opened
- [ ] Logged in (GitHub or email)
- [ ] Terminal shows "Logged in successfully"

---

### Step 2: Initialize Project
```bash
railway init
```

- [ ] Command executed
- [ ] Project name entered (or auto-generated)
- [ ] Project created successfully
- [ ] `.railway` folder created

---

### Step 3: Deploy Code
```bash
railway up
```

- [ ] Command executed
- [ ] Build process started
- [ ] Dependencies installed (npm install)
- [ ] Deployment successful (✓ message)
- [ ] No error messages

**Expected time:** 2-3 minutes

---

### Step 4: Set Environment Variables

First, gather your credentials:

**NOTION_API_KEY:**
- [ ] Went to https://www.notion.so/my-integrations
- [ ] Created integration (or found existing)
- [ ] Copied API key
- [ ] Key ready to paste

**NOTION_DATABASE_ID:**
- [ ] Opened Notion database
- [ ] Clicked "Share" → Copied link
- [ ] Extracted 32-character database ID
- [ ] ID ready to paste

**Set variables:**
```bash
railway variables set NOTION_API_KEY="paste_your_key_here"
railway variables set NOTION_DATABASE_ID="paste_your_id_here"
```

- [ ] NOTION_API_KEY set
- [ ] NOTION_DATABASE_ID set
- [ ] Service restarted automatically
- [ ] Waited 30 seconds for restart

---

### Step 5: Generate Public Domain
```bash
railway domain
```

- [ ] Command executed
- [ ] URL generated (e.g., `https://bernard-scraper-production-xxxxx.up.railway.app`)
- [ ] URL copied to clipboard
- [ ] URL saved somewhere safe

**Your Railway URL:** ________________________________

---

### Step 6: Test Deployment

```bash
# View logs
railway logs
```
- [ ] Logs showing (no errors)
- [ ] See "Bernard API Server" message
- [ ] Server is listening on port

```bash
# Test API (replace YOUR_URL)
curl https://YOUR_URL.up.railway.app/api/status
```
- [ ] Command executed
- [ ] Got JSON response: `{"isRunning": false, "logs": []}`
- [ ] No error messages

---

### Step 7: Open Dashboard (Optional)
```bash
railway open
```

- [ ] Dashboard opened in browser
- [ ] Can see deployment logs
- [ ] Service status is "Active"
- [ ] No warnings or errors

---

## Verification Tests

Run these to make sure everything works:

### Test 1: Health Check
```bash
curl https://YOUR_URL.up.railway.app/api/status
```
**Expected:** `{"isRunning": false, "logs": []}`
- [ ] ✅ Passed

### Test 2: Config Endpoint
```bash
curl https://YOUR_URL.up.railway.app/api/config
```
**Expected:** JSON with `city`, `state`, `niche`, etc.
- [ ] ✅ Passed

### Test 3: Logs Endpoint
```bash
curl https://YOUR_URL.up.railway.app/api/logs
```
**Expected:** `{"logs": [...]}`
- [ ] ✅ Passed

### Test 4: Check Railway Status
```bash
railway status
```
**Expected:** Service is healthy
- [ ] ✅ Passed

---

## Post-Deployment

### Update Frontend
- [ ] Copied Railway URL
- [ ] Opened Netlify dashboard
- [ ] Found bernard-dashboard site
- [ ] Went to Site Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_API_URL` = Railway URL
- [ ] Triggered redeploy
- [ ] Waited for deployment to complete

### Test Frontend-Backend Integration
- [ ] Opened frontend URL in browser
- [ ] Dashboard loads correctly
- [ ] Backend status shows "Online" (green)
- [ ] Can click "Initiate" button
- [ ] Backend responds to requests
- [ ] Logs appear in dashboard

---

## Troubleshooting (If Needed)

If something went wrong, check these:

### Login Issues
- [ ] Tried `railway login` again
- [ ] Browser opened successfully
- [ ] Cleared browser cache
- [ ] Tried different browser

### Deployment Issues
- [ ] Checked logs: `railway logs`
- [ ] Verified environment variables: `railway variables`
- [ ] Tried force deploy: `railway up --force`
- [ ] Restarted service: `railway restart`

### API Not Accessible
- [ ] Verified domain generated: `railway domain`
- [ ] Checked service status: `railway status`
- [ ] Tested with curl (see above)
- [ ] Checked CORS settings (already configured)

### Environment Variable Issues
- [ ] Listed variables: `railway variables`
- [ ] Variables are set correctly (no typos)
- [ ] Notion integration has access to database
- [ ] Database ID is correct format (32 chars)

---

## Success Criteria

You're done when ALL of these are true:

- [x] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Project initialized
- [ ] Code deployed successfully
- [ ] Environment variables set
- [ ] Public domain generated
- [ ] Health check endpoint returns 200
- [ ] All test endpoints work
- [ ] Frontend knows backend URL
- [ ] End-to-end test successful

---

## Quick Command Reference

```bash
# Check where you are
pwd

# Navigate to project
cd "/Users/c/Desktop/automation for leadscraper/bernard-scraper"

# Check Railway status
railway status

# View logs
railway logs

# Follow logs in real-time
railway logs --follow

# List environment variables
railway variables

# Open dashboard
railway open

# Restart service
railway restart

# Get domain
railway domain
```

---

## 📝 Notes Section

Use this space to write down important info:

**My Railway URL:**
```
https://________________________________.up.railway.app
```

**My Notion API Key (first 8 chars for reference):**
```
________...
```

**Deployment Date:**
```
_______________
```

**Issues Encountered:**
```




```

**Solutions:**
```




```

---

## 🎉 Next Steps After Setup

Once everything is checked off:

1. **Save your Railway URL** - You'll need it
2. **Bookmark Railway dashboard** - For monitoring
3. **Test your workflow** - Run a full scan
4. **Monitor usage** - Check Railway dashboard for metrics
5. **Set up alerts** (optional) - Railway can notify you of issues

---

**Start with Step 1 and work through each step carefully!** 

Good luck! 🚀
