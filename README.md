# Kiss them! 💋

A mobile-first web application that uses AI to add kisses to your photos! Upload a photo, let our AI work its magic, and download your kissed photo.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 📱 **Mobile-First Design** - Optimized for mobile devices with responsive layout
- 🖼️ **Drag & Drop Upload** - Easy photo upload with drag & drop support
- ✨ **AI-Powered Processing** - Integration with Google Gemini API for adding kisses
- 💾 **Instant Download** - Download your processed photos immediately
- 🎨 **Beautiful UI** - Modern, intuitive interface with smooth animations

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Google OAuth 2.0
- **AI Processing**: Google Gemini API
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)

## Prerequisites

Before running this application, you'll need:

1. **Google Cloud Project** with Gemini API enabled
2. **Google OAuth 2.0 Client ID** for authentication
3. **Gemini API Key** for AI processing
4. **Web server** (local or hosted)

## Setup Instructions

### 1. Google Cloud Setup

#### Enable Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Save the API key securely

#### Create OAuth 2.0 Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:8000` (for local development)
   - Your production domain
7. Save the Client ID

### 2. Configuration

#### Update Google Client ID
In `script.js`, replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google OAuth Client ID:

```javascript
google.accounts.id.initialize({
    client_id: 'YOUR_ACTUAL_CLIENT_ID_HERE',
    callback: handleCredentialResponse
});
```

#### Add Gemini API Integration
The current version includes a placeholder for Gemini API integration. To implement it:

1. **Backend Integration** (Recommended):
   - Create a backend service (Node.js, Python, etc.)
   - Handle image processing with Gemini API
   - Secure API key storage

2. **Frontend Integration** (For demo purposes):
   - Replace `simulateGeminiProcessing()` function
   - Add actual Gemini API calls
   - Handle API responses

### 3. Local Development

#### Option 1: Python HTTP Server
```bash
# Navigate to project directory
cd kissthem

# Start Python HTTP server
python3 -m http.server 8000

# Open browser to http://localhost:8000
```

#### Option 2: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8000

# Open browser to http://localhost:8000
```

#### Option 3: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 4. Production Deployment

For production deployment:

1. **Hosting**: Deploy to services like:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

2. **HTTPS**: Ensure HTTPS is enabled (required for OAuth)

3. **Domain**: Update Google OAuth authorized origins

4. **Environment Variables**: Store API keys securely

## Project Structure

```
kissthem/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Upload Photo**: Drag & drop or browse for an image
3. **Process**: Click "Add Kiss with AI" to process your photo
4. **Download**: Download your kissed photo when processing is complete
5. **Repeat**: Process another photo or sign out

## API Integration

### Gemini API Integration Example

```javascript
async function processWithGemini(imageFile) {
    const base64Image = await fileToBase64(imageFile);
    
    try {
        const response = await fetch('YOUR_BACKEND_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                image: base64Image,
                prompt: "Add a cute kiss to this photo"
            })
        });
        
        const result = await response.json();
        return result.processedImage;
    } catch (error) {
        throw new Error('Failed to process image with Gemini API');
    }
}
```

## Security Considerations

- **API Keys**: Never expose API keys in frontend code
- **Authentication**: Implement proper token validation
- **File Upload**: Validate file types and sizes
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement rate limiting for API calls

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Future Enhancements

- [ ] Multiple kiss styles and effects
- [ ] Batch processing
- [ ] Social sharing
- [ ] User galleries
- [ ] Advanced AI prompts
- [ ] Mobile app versions

---

**Note**: This is a demo version. For production use, implement proper backend services, security measures, and error handling. 