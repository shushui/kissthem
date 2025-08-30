#!/bin/bash

# 🧪 Kiss them! API Test Script
# This script tests the backend API endpoints

BASE_URL="http://localhost:8080"
ROBERT_PHOTO="../resources/robert.jpg"

echo "🧪 Testing Kiss them! Backend API"
echo "=================================="

# Test 1: Health Check
echo -e "\n🔍 Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq .

# Test 2: Get OAuth Client ID
echo -e "\n🔐 Testing OAuth Client ID..."
curl -s "$BASE_URL/api/oauth-client-id" | jq .

# Test 3: Test Protected Endpoints (should return 401)
echo -e "\n🛡️ Testing Protected Endpoints (should return 401)..."
echo "Gallery endpoint:"
curl -s -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/gallery"

echo -e "\nImage processing endpoint:"
curl -s -X POST "$BASE_URL/api/process-image" \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=","prompt":"Add cute kisses to this photo"}' \
  -w "HTTP Status: %{http_code}\n"

echo -e "\n✅ API Test Complete!"
echo -e "\n📝 Note: To test with real authentication, you need to:"
echo "1. Get a valid Google OAuth token"
echo "2. Include it in the Authorization header: 'Bearer <token>'"
echo "3. Then the protected endpoints will work" 