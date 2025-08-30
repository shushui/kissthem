#!/bin/bash

# Full Stack Deployment Script for Kiss them! Application
# This script deploys both backend and frontend

set -e

echo "🚀 Starting full stack deployment of Kiss them! to Google Cloud..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Get the current project
PROJECT_ID=$(gcloud config get-value project)
echo "📋 Using Google Cloud project: $PROJECT_ID"

# Step 1: Deploy Backend to Cloud Run
echo "🏗️  Step 1: Deploying Backend to Cloud Run..."
gcloud builds submit --config cloudbuild.yaml .

echo "✅ Backend deployed successfully!"

# Step 2: Build Frontend for Production
echo "🏗️  Step 2: Building Frontend for Production..."
cd frontend
npm run build:prod
echo "✅ Frontend built successfully!"

# Step 3: Deploy Frontend to Firebase Hosting
echo "🏗️  Step 3: Deploying Frontend to Firebase Hosting..."
firebase deploy --only hosting --project=$PROJECT_ID

echo "✅ Frontend deployed successfully!"

# Step 4: Display URLs
echo ""
echo "🎉 Full Stack Deployment Completed Successfully!"
echo ""
echo "🌐 Your Application URLs:"
echo "   Frontend: https://$PROJECT_ID.web.app"
echo "   Backend API: https://kissthem-$PROJECT_ID.us-central1.run.app"
echo ""
echo "📱 Frontend Features:"
echo "   ✅ Enhanced kissing prompt with surprise expressions"
echo "   ✅ Individual photo deletion"
echo "   ✅ Bulk photo deletion"
echo "   ✅ Modern, responsive UI"
echo ""
echo "🔧 Backend API Endpoints:"
echo "   Health: https://kissthem-$PROJECT_ID.us-central1.run.app/health"
echo "   OAuth: https://kissthem-$PROJECT_ID.us-central1.run.app/api/oauth-client-id"
echo "   Process Image: https://kissthem-$PROJECT_ID.us-central1.run.app/api/process-image"
echo "   Gallery: https://kissthem-$PROJECT_ID.us-central1.run.app/api/gallery"
echo ""
echo "📊 To monitor your application:"
echo "   Backend logs: gcloud run services logs tail kissthem --region=us-central1"
echo "   Build logs: gcloud builds list"
echo ""
echo "🔒 Security:"
echo "   ✅ HTTPS enabled on both frontend and backend"
echo "   ✅ Google OAuth authentication"
echo "   ✅ Secrets managed in Google Cloud Secret Manager"
echo ""
echo "Happy Kissing! 💋✨" 