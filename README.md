# 💋 Kiss them! - Modern TypeScript Application

A complete, modern web application that uses AI to add cute kisses to your photos, built with TypeScript, React, and NestJS.

## 🏗️ **Architecture Overview**

### **Frontend (React + TypeScript)**
- **React 18** with TypeScript
- **Modern Hooks** and functional components
- **Google OAuth** integration
- **Responsive design** for mobile and desktop
- **Type-safe** API communication

### **Backend (NestJS + TypeScript)**
- **NestJS framework** with proper module structure
- **TypeScript** throughout
- **Google Cloud services** integration
- **RESTful API** with proper controllers and services
- **Authentication guards** and middleware

### **Cloud Services**
- **Google Cloud Storage** - Image storage
- **Firestore** - Database and metadata
- **Secret Manager** - Secure credential storage
- **Gemini AI** - Image processing and naming

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- Google Cloud Project with billing enabled
- Google Cloud CLI (`gcloud`) configured

### **1. Install Dependencies**
```bash
npm run install:all
```

### **2. Set Up Google Cloud Services**
```bash
# Enable required APIs
gcloud services enable storage.googleapis.com --project=kissthem
gcloud services enable firestore.googleapis.com --project=kissthem

# Create storage bucket
gsutil mb gs://kissthem-images
gsutil iam ch allUsers:objectViewer gs://kissthem-images

# Set up service account permissions
gcloud projects add-iam-policy-binding kissthem \
  --member="serviceAccount:123679151422-compute@developer.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding kissthem \
  --member="serviceAccount:123679151422-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### **3. Configure Environment**
Create `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=8080
GOOGLE_CLOUD_PROJECT=kissthem
```

### **4. Set Up Google Secrets**
```bash
# OAuth Client ID
echo -n "your-oauth-client-id" | gcloud secrets create oauth-client-id --data-file=-

# Gemini API Key
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
```

### **5. Run Development Servers**
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend    # Backend on port 8080
npm run dev:frontend   # Frontend on port 3000
```

## 📁 **Project Structure**

```
kissthem/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── image/      # Image processing
│   │   │   ├── gallery/    # Photo gallery
│   │   │   └── google-cloud/ # Cloud services
│   │   ├── interfaces/     # TypeScript interfaces
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── package.json             # Root package.json
└── README.md
```

## 🔧 **Development Commands**

### **Backend (NestJS)**
```bash
cd backend
npm run start:dev      # Development with hot reload
npm run build          # Build for production
npm run start:prod     # Run production build
```

### **Frontend (React)**
```bash
cd frontend
npm start              # Development server
npm run build          # Build for production
npm test               # Run tests
```

### **Root Commands**
```bash
npm run dev            # Run both frontend and backend
npm run build          # Build both applications
npm run install:all    # Install all dependencies
```

## 🌐 **API Endpoints**

### **Public Endpoints**
- `GET /health` - Health check
- `GET /api/oauth-client-id` - Get OAuth client ID

### **Protected Endpoints (Require Authentication)**
- `POST /api/process-image` - Process image with AI
- `GET /api/gallery` - Get user's photo gallery
- `DELETE /api/photos/:photoId` - Delete specific photo
- `DELETE /api/gallery` - Delete user's entire gallery

## 🔐 **Authentication**

- **Google OAuth 2.0** integration
- **JWT token validation** on backend
- **User isolation** - users can only access their own photos
- **Secure API endpoints** with authentication guards

## 💾 **Data Storage**

### **Google Cloud Storage**
- **Original images** stored in `users/{userId}/originals/`
- **Generated images** stored in `users/{userId}/generated/`
- **Public URLs** for easy access

### **Firestore Database**
- **Photo metadata** and relationships
- **User information** and preferences
- **AI processing results** and prompts

## 🧠 **AI Features**

- **Gemini 2.5 Flash Image Preview** for image generation
- **Automatic photo naming** using AI
- **Smart prompts** for better results
- **Fallback handling** for failed generations

## 🚀 **Deployment**

### **Local Development**
- Backend runs on port 8080
- Frontend runs on port 3000
- CORS enabled for local development
- Hot reload for both frontend and backend

### **Production Deployment**
- Build both applications: `npm run build`
- Deploy backend to Google Cloud Run
- Deploy frontend to Google Cloud Storage or similar
- Configure environment variables for production

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Google Cloud permissions** - Ensure service account has proper roles
2. **CORS errors** - Check CORS configuration in backend
3. **Authentication failures** - Verify OAuth client ID and secrets
4. **Image upload issues** - Check Cloud Storage bucket permissions

### **Debug Mode**
```bash
# Backend debug mode
cd backend && npm run start:debug

# Frontend with detailed logging
cd frontend && npm start
```

## �� **Learning Resources**

- [NestJS Documentation](https://docs.nestjs.com/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

---

**Happy coding! 💋✨**
