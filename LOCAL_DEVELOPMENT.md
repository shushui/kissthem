# 🚀 Local Development Setup for "Kiss them!"

## 🔧 Prerequisites

1. **Google Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Node.js**: Version 18 or higher
3. **npm**: For package management

## ⚙️ Environment Setup

### 1. Set Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit `.env` and add your Gemini API key:

```bash
# Google Gemini API Key (Required for AI image processing)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Other variables are already set
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run start:dev
```

The backend will run on http://localhost:8080

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY environment variable is required"

**Solution**: Set the `GEMINI_API_KEY` environment variable in your `.env` file.

### Issue: Gallery not loading

**Solution**: Check the browser console and backend logs for authentication errors.

### Issue: Image processing not working

**Solution**: Ensure your Gemini API key is valid and has access to the Gemini API.

## 📝 Notes

- The backend uses Google Cloud services (Firestore, Storage, Secret Manager)
- For local development, some services may not work without proper Google Cloud credentials
- The OAuth client ID is hardcoded for local development
- Check the backend console for detailed error messages 