#!/bin/bash

# 🚀 Quick Railway Deploy Script
# Run this script to deploy your backend to Railway

set -e

echo "🚂 Bernard Scraper - Railway Deployment"
echo "========================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    brew install railway
fi

echo "✅ Railway CLI installed"
echo ""

# Step 1: Login
echo "📝 Step 1: Login to Railway"
echo "This will open your browser..."
railway login
echo ""

# Step 2: Initialize project
echo "🔧 Step 2: Initialize Railway project"
railway init
echo ""

# Step 3: Deploy
echo "🚀 Step 3: Deploying to Railway..."
railway up
echo ""

# Step 4: Generate domain
echo "🌐 Step 4: Generating public domain..."
railway domain
echo ""

echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Set your environment variables:"
echo "   railway variables set NOTION_API_KEY=\"your_key\""
echo "   railway variables set NOTION_DATABASE_ID=\"your_db_id\""
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables (see above)"
echo "   2. Test your API: curl https://your-url.up.railway.app/api/status"
echo "   3. Copy your Railway URL"
echo "   4. Update frontend with NEXT_PUBLIC_API_URL"
echo ""
echo "📖 For detailed guide, see: RAILWAY_DEPLOYMENT_GUIDE.md"
