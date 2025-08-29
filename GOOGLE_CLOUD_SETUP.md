# 🚀 Google Cloud Setup Guide for "Kiss them!"

This guide will walk you through setting up your "Kiss them!" application on Google Cloud Platform.

## 📋 Prerequisites

- ✅ Google Cloud billing account (you have this)
- ✅ Project ID: `kissthem` (you have this)
- ✅ Google Cloud CLI installed and authenticated (completed)

## 🔧 Step 1: Enable Required APIs

The following APIs have been enabled for your project:
- ✅ Cloud Build API
- ✅ Cloud Run API  
- ✅ AI Platform API
- ✅ Cloud Resource Manager API

## 🔑 Step 2: Create OAuth 2.0 Credentials

### 2.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `kissthem`
3. Navigate to **APIs & Services** → **Credentials**

### 2.2 Create OAuth 2.0 Client ID
1. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
2. Choose **Web application**
3. Set **Name**: `Kiss them! Web Client`
4. Add **Authorized JavaScript origins**:
   - `http://localhost:8080` (for local testing)
   - `https://kissthem-us-central1-123679151422.run.app` (after deployment)
5. Click **Create**
6. **Save the Client ID** - you'll need this for the frontend

## 🤖 Step 3: Enable Gemini API

### 3.1 Go to Google AI Studio
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. **Save the API Key** - you'll need this for AI processing

## ⚙️ Step 4: Update Configuration

### 4.1 Update Frontend Configuration
In `script.js`, replace `YOUR_GOOGLE_CLIENT_ID` with your actual OAuth Client ID:

```javascript
google.accounts.id.initialize({
    client_id: '123456789-abcdefghijklmnop.apps.googleusercontent.com', // Your actual Client ID
    callback: handleCredentialResponse
});
```

### 4.2 Set Environment Variables (Optional)
You can set environment variables in Cloud Run after deployment:

```bash
gcloud run services update kissthem \
  --region=us-central1 \
  --set-env-vars \
  GOOGLE_CLIENT_ID=your_client_id_here,\
  GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 Step 5: Deploy to Google Cloud

### 5.1 Quick Deploy
Run the deployment script:

```bash
./deploy.sh
```

### 5.2 Manual Deploy
Or deploy manually:

```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml .
```

## 🌐 Step 6: Access Your Application

After successful deployment, your application will be available at:
```
https://kissthem-us-central1-123679151422.run.app
```

## 📊 Step 7: Monitor and Manage

### View Logs
```bash
gcloud run services logs tail kissthem --region=us-central1
```

### Update Environment Variables
```bash
gcloud run services update kissthem \
  --region=us-central1 \
  --set-env-vars GOOGLE_CLIENT_ID=your_new_client_id
```

### Scale Your Application
```bash
gcloud run services update kissthem \
  --region=us-central1 \
  --max-instances=20 \
  --memory=1Gi
```

## 🔒 Security Considerations

1. **Never commit API keys** to your repository
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (automatically handled by Cloud Run)
4. **Set up proper CORS** if needed
5. **Monitor usage** and set up billing alerts

## 💰 Cost Optimization

- **Cloud Run** scales to zero when not in use
- **Cloud Build** charges per build minute
- **Gemini API** charges per request
- Set up **billing alerts** to monitor costs

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   gcloud auth login
   gcloud config set project kissthem
   ```

2. **API Not Enabled**
   ```bash
   gcloud services enable [API_NAME]
   ```

3. **Build Fails**
   - Check Dockerfile syntax
   - Verify all files are present
   - Check Cloud Build logs

4. **Deployment Fails**
   - Verify project permissions
   - Check Cloud Run quotas
   - Review build logs

### Get Help

- **Cloud Build logs**: `gcloud builds log [BUILD_ID]`
- **Cloud Run logs**: `gcloud run services logs tail kissthem`
- **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)

## 📱 Next Steps

1. **Test your deployed application**
2. **Set up custom domain** (optional)
3. **Configure monitoring and alerts**
4. **Set up CI/CD pipeline** (optional)
5. **Implement Gemini API integration**

## 🎉 Congratulations!

Your "Kiss them!" application is now running on Google Cloud! 

The application will automatically scale based on demand and you only pay for what you use. Monitor your usage and costs through the Google Cloud Console.

---

**Need help?** Check the [Google Cloud documentation](https://cloud.google.com/docs) or create an issue in your repository. 