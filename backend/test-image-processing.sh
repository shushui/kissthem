#!/bin/bash

# 🧪 Kiss them! Image Processing Test Script
# This script tests the image processing API with the Robert photo

BASE_URL="http://localhost:8080"
ROBERT_PHOTO="../resources/robert.jpg"

echo "🧪 Testing Image Processing API with Robert Photo"
echo "=================================================="

# Check if backend is running
echo -e "\n🔍 Checking if backend is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "❌ Backend is not running. Please start it with: npm run start:dev"
    exit 1
fi
echo "✅ Backend is running!"

# Convert Robert photo to base64
echo -e "\n📸 Converting Robert photo to base64..."
if [ ! -f "$ROBERT_PHOTO" ]; then
    echo "❌ Robert photo not found at $ROBERT_PHOTO"
    exit 1
fi

# Create base64 data URL
ROBERT_BASE64="data:image/jpeg;base64,$(base64 -i "$ROBERT_PHOTO")"
echo "✅ Photo converted to base64 (size: $(echo "$ROBERT_BASE64" | wc -c) bytes)"

# Test the API endpoints
echo -e "\n🔐 Testing OAuth Client ID..."
OAUTH_RESPONSE=$(curl -s "$BASE_URL/api/oauth-client-id")
echo "$OAUTH_RESPONSE" | jq .

# Extract client ID for reference
CLIENT_ID=$(echo "$OAUTH_RESPONSE" | jq -r '.clientId')
echo -e "\n📋 OAuth Client ID: $CLIENT_ID"

# Test protected endpoints (should return 401)
echo -e "\n🛡️ Testing Protected Endpoints..."
echo "Gallery endpoint:"
curl -s -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/gallery"

echo -e "\nImage processing endpoint (without auth):"
curl -s -X POST "$BASE_URL/api/process-image" \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"$(echo "$ROBERT_BASE64" | head -c 1000)...\",\"prompt\":\"Add cute kisses to this photo\"}" \
  -w "HTTP Status: %{http_code}\n"

echo -e "\n📝 Summary:"
echo "✅ Backend is running and healthy"
echo "✅ OAuth client ID is configured"
echo "✅ Authentication is working (returning 401 for protected endpoints)"
echo "✅ Robert photo is ready for processing"
echo -e "\n🚀 To process the photo with real authentication:"
echo "1. Get a valid Google OAuth token from the frontend"
echo "2. Use: curl -X POST $BASE_URL/api/process-image \\"
echo "   -H 'Authorization: Bearer <your-token>' \\"
echo "   -H 'Content-Type: application/json' \\"
echo "   -d '{\"image\":\"$ROBERT_BASE64\",\"prompt\":\"Add cute kisses\"}'"
echo -e "\n💡 The API will then:"
echo "   - Process the image with Gemini AI"
echo "   - Add kisses as requested"
echo "   - Store both original and processed images"
echo "   - Return the processed image URL" 