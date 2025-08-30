#!/bin/bash

# Fix OAuth Origins Script
# This script helps you fix the OAuth origin mismatch error

echo "🔧 Fixing OAuth Origin Mismatch Error"
echo "======================================"
echo ""

echo "📋 Your current OAuth client ID:"
echo "   123679151422-eeij1ta83fh2gh4cjfgn6m0p93bia6d3.apps.googleusercontent.com"
echo ""

echo "🌐 You need to add these Authorized JavaScript origins:"
echo "   ✅ https://kissthem-frontend.storage.googleapis.com"
echo "   ✅ https://storage.googleapis.com"
echo "   ✅ http://localhost:3000"
echo "   ✅ http://localhost:3001"
echo ""

echo "🛠️  How to fix:"
echo "   1. Go to: https://console.cloud.google.com/"
echo "   2. Select project: kissthem"
echo "   3. Navigate to: APIs & Services > Credentials"
echo "   4. Find your OAuth 2.0 Client ID"
echo "   5. Click on it to edit"
echo "   6. Add the origins listed above"
echo "   7. Click Save"
echo ""

echo "🔗 Direct link to OAuth credentials:"
echo "   https://console.cloud.google.com/apis/credentials?project=kissthem"
echo ""

echo "💡 After updating, your app should work at:"
echo "   https://kissthem-frontend.storage.googleapis.com/index.html"
echo ""

echo "🚀 Alternative: Deploy to Firebase Hosting"
echo "   This would give you a cleaner URL like:"
echo "   https://kissthem-app.web.app"
echo ""

echo "Press Enter when you've updated the OAuth origins..."
read

echo "✅ Great! Now let's test if it's working..."
echo "Visit: https://kissthem-frontend.storage.googleapis.com/index.html"
echo "Try signing in with Google - it should work now!" 