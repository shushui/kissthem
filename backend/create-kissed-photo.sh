#!/bin/bash

# 🎯 Create Kissed Photo Script
# This script shows how to use the API to create kissed photos

BASE_URL="http://localhost:8080"
ROBERT_PHOTO="../resources/robert.jpg"

echo "🎯 Creating Kissed Photo from Robert's Photo"
echo "============================================="

# Check if backend is running
echo -e "\n🔍 Checking if backend is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "❌ Backend is not running. Please start it with: npm run start:dev"
    exit 1
fi
echo "✅ Backend is running!"

# Test 1: Health Check
echo -e "\n🔍 Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq .

# Test 2: Get OAuth Client ID
echo -e "\n🔐 Testing OAuth Client ID..."
OAUTH_RESPONSE=$(curl -s "$BASE_URL/api/oauth-client-id")
echo "$OAUTH_RESPONSE" | jq .

# Test 3: Show how to authenticate and process image
echo -e "\n📸 Image Processing Instructions:"
echo "=================================="
echo "To create a kissed photo, you need to:"
echo ""
echo "1. 🔐 Get Google OAuth Token:"
echo "   - Use the frontend app to sign in with Google"
echo "   - The frontend will get an OAuth token"
echo "   - Use that token in the Authorization header"
echo ""
echo "2. 🖼️  Process the Photo:"
echo "   curl -X POST $BASE_URL/api/process-image \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"Authorization: Bearer YOUR_OAUTH_TOKEN\" \\"
echo "     -d '{"
echo "       \"image\": \"data:image/jpeg;base64,YOUR_BASE64_IMAGE\","
echo "       \"prompt\": \"Add cute kisses to this photo\""
echo "     }'"
echo ""
echo "3. 📱 Alternative: Use the Frontend App"
echo "   - Open the frontend in your browser"
echo "   - Sign in with Google"
echo "   - Upload the Robert photo"
echo "   - Add kisses using the app interface"
echo ""

# Test 4: Show the Robert photo is ready
echo -e "\n📸 Robert Photo Status:"
echo "========================"
if [ -f "$ROBERT_PHOTO" ]; then
    echo "✅ Robert photo found: $ROBERT_PHOTO"
    echo "📏 Size: $(ls -lh "$ROBERT_PHOTO" | awk '{print $5}')"
    echo "🔢 Base64 ready: $(ls -lh robert_data_url.txt | awk '{print $5}')"
else
    echo "❌ Robert photo not found at $ROBERT_PHOTO"
fi

# Test 5: Show current gallery (should be empty or require auth)
echo -e "\n🖼️  Current Gallery Status:"
echo "============================"
echo "Attempting to access gallery (should require authentication):"
curl -s -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/gallery"

echo -e "\n🎯 Next Steps:"
echo "==============="
echo "1. Start the frontend: cd ../frontend && npm start"
echo "2. Sign in with Google in the frontend"
echo "3. Upload and process the Robert photo"
echo "4. View your kissed photos in the gallery"
echo ""
echo "�� Happy kissing! 💋" 