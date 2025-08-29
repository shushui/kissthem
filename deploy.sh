#!/bin/bash

# Deploy script for Kiss them! application
# This script builds and deploys the application to Google Cloud Run

set -e

echo "🚀 Starting deployment of Kiss them! to Google Cloud..."

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

# Check if required APIs are enabled
echo "🔍 Checking required APIs..."
APIS=("cloudbuild.googleapis.com" "run.googleapis.com" "aiplatform.googleapis.com")
for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "⚠️  Warning: $api is not enabled. Enabling now..."
        gcloud services enable "$api"
    fi
done

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at:"
echo "   https://kissthem-$(gcloud config get-value run/region)-$(gcloud config get-value project).run.app"

echo ""
echo "📊 To view logs and monitor your application:"
echo "   gcloud run services logs tail kissthem --region=$(gcloud config get-value run/region)"

echo ""
echo "🔧 To update environment variables:"
echo "   gcloud run services update kissthem --region=$(gcloud config get-value run/region) --set-env-vars KEY=VALUE" 