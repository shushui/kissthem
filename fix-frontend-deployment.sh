#!/bin/bash

# Fix Frontend Deployment Script
# This script fixes the Cloud Storage configuration for React applications

set -e

echo "🔧 Fixing frontend deployment configuration..."

PROJECT_ID=$(gcloud config get-value project)
BUCKET_NAME="${PROJECT_ID}-frontend"

echo "📋 Using project: $PROJECT_ID"
echo "🪣 Using bucket: $BUCKET_NAME"

# Step 1: Update the bucket to be publicly accessible
echo "🔓 Making bucket publicly accessible..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Step 2: Set proper website configuration
echo "🌐 Setting website configuration..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Step 3: Set proper CORS for React app
echo "🔗 Setting CORS configuration..."
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$BUCKET_NAME

# Step 4: Set proper content types for React build files
echo "📁 Setting proper content types..."
gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/*.html
gsutil -m setmeta -h "Content-Type:application/javascript" gs://$BUCKET_NAME/static/js/*.js
gsutil -m setmeta -h "Content-Type:text/css" gs://$BUCKET_NAME/static/css/*.css

# Step 5: Create a proper index.html redirect for SPA routing
echo "🔄 Creating SPA routing support..."
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kiss them!</title>
    <script>
        // Redirect to the main app
        window.location.href = './index.html';
    </script>
</head>
<body>
    <p>Redirecting to Kiss them! application...</p>
</body>
</html>
EOF

gsutil cp index.html gs://$BUCKET_NAME/

# Step 6: Clean up temporary files
rm -f cors.json index.html

echo ""
echo "✅ Frontend deployment configuration fixed!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "   https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo ""
echo "🔧 If you still have issues, try:"
echo "   1. Clear your browser cache"
echo "   2. Wait a few minutes for changes to propagate"
echo "   3. Check the browser console for specific errors"
echo ""
echo "📱 Alternative: You can also access individual files directly:"
echo "   Main app: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "   JavaScript: https://storage.googleapis.com/$BUCKET_NAME/static/js/main.*.js"
echo "   CSS: https://storage.googleapis.com/$BUCKET_NAME/static/css/main.*.css" 