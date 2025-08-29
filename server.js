const express = require('express');
const cors = require('cors');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenAI } = require('@google/genai');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Initialize Secret Manager client
const secretManager = new SecretManagerServiceClient();

// Cache for secrets
let secretsCache = {};

// Function to get secrets from Google Secret Manager
async function getSecret(secretName) {
    if (secretsCache[secretName]) {
        return secretsCache[secretName];
    }

    try {
        const name = `projects/kissthem/secrets/${secretName}/versions/latest`;
        const [version] = await secretManager.accessSecretVersion({ name });
        const secret = version.payload.data.toString();
        secretsCache[secretName] = secret;
        return secret;
    } catch (error) {
        console.error(`Error accessing secret ${secretName}:`, error);
        throw error;
    }
}

// Google OAuth token validation middleware
async function validateGoogleToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please sign in with Google to use this feature'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Get OAuth client ID from Secret Manager
        const clientId = await getSecret('oauth-client-id');
        
        // Create OAuth2 client for token verification
        const client = new OAuth2Client(clientId);
        
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        });
        
        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'Authentication token is invalid'
            });
        }

        // Add user info to request for logging/auditing
        req.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
        
        console.log(`🔐 Authenticated user: ${req.user.email} (${req.user.name})`);
        next();
        
    } catch (error) {
        console.error('Token validation error:', error);
        
        if (error.message.includes('Token used too late')) {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Your session has expired. Please sign in again.'
            });
        }
        
        return res.status(401).json({ 
            error: 'Authentication failed',
            message: 'Please sign in with Google to continue'
        });
    }
}

// Health check endpoint (public)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Process image with Gemini API - PROTECTED ENDPOINT
app.post('/api/process-image', validateGoogleToken, async (req, res) => {
    try {
        const { image, prompt } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Log the authenticated user's request
        console.log(`🎨 User ${req.user.email} is processing an image with prompt: "${prompt}"`);

        // Get Gemini API key from Secret Manager
        const geminiApiKey = await getSecret('gemini-api-key');
        
        // Initialize Gemini AI with the working "Nano Banana" model for image generation
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        // Prepare the image data
        const imageData = {
            inlineData: {
                data: image.split(',')[1], // Remove data:image/...;base64, prefix
                mimeType: 'image/jpeg'
            }
        };

        // Create the prompt for image generation
        const fullPrompt = prompt || "Take this photo and add a cute kiss to it. Generate a new version with the kiss added. Make it look natural and adorable.";

        try {
            console.log(`🚀 Sending image to Gemini "Nano Banana" model for user ${req.user.email}...`);
            
            // Generate content with image using the correct API structure
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image-preview",
                contents: [fullPrompt, imageData],
            });
            
            // Check if the response contains generated images
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const content = response.candidates[0].content;
                
                // Look for generated images in the response
                let generatedImage = null;
                let aiResponse = "";
                
                // Process the response parts
                for (const part of content.parts) {
                    if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
                        // Found a generated image!
                        generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        console.log(`🎉 Gemini "Nano Banana" generated a new image for user ${req.user.email}!`);
                    } else if (part.text) {
                        aiResponse += part.text;
                    }
                }
                
                if (generatedImage) {
                    // Success! Return the AI-generated image
                    console.log(`✅ Successfully processed image for user ${req.user.email}`);
                    res.json({
                        success: true,
                        originalImage: image,
                        processedImage: generatedImage,
                        aiResponse: aiResponse || "Image generated successfully with Gemini 'Nano Banana'!",
                        message: '🎉 Gemini "Nano Banana" generated a new kissed version of your photo! 💋✨',
                        user: {
                            email: req.user.email,
                            name: req.user.name
                        }
                    });
                } else {
                    // No image generated, fallback to original image
                    console.log(`⚠️ No image generated by Gemini for user ${req.user.email}, returning original image`);
                    
                    res.json({
                        success: true,
                        originalImage: image,
                        processedImage: image, // Return original if no generation
                        aiResponse: aiResponse || "AI analyzed your image but couldn't generate a new version.",
                        message: 'Image analyzed by AI (no generation available) 💋',
                        user: {
                            email: req.user.email,
                            name: req.user.name
                        }
                    });
                }
            } else {
                // Fallback if response structure is unexpected
                console.log(`⚠️ Unexpected response structure from Gemini for user ${req.user.email}, returning original image`);
                
                res.json({
                    success: true,
                    originalImage: image,
                    processedImage: image, // Return original if no generation
                    aiResponse: "AI processing completed but no image generation available.",
                    message: 'Image processed (no generation available) 💋',
                    user: {
                        email: req.user.email,
                        name: req.user.name
                    }
                });
            }

        } catch (geminiError) {
            console.error(`❌ Gemini API error for user ${req.user.email}:`, geminiError);
            
            // Fallback: return original image with error message
            res.json({
                success: true,
                originalImage: image,
                processedImage: image, // Return original if no generation
                aiResponse: "AI processing failed, but image was uploaded successfully.",
                message: 'Image uploaded (AI processing failed) 💋',
                user: {
                    email: req.user.email,
                    name: req.user.name
                }
            });
        }

    } catch (error) {
        console.error(`❌ Error processing image for user ${req.user?.email || 'unknown'}:`, error);
        res.status(500).json({
            error: 'Failed to process image',
            details: error.message
        });
    }
});

// Get OAuth client ID (public info)
app.get('/api/oauth-client-id', async (req, res) => {
    try {
        const clientId = await getSecret('oauth-client-id');
        res.json({ clientId });
    } catch (error) {
        console.error('Error getting OAuth client ID:', error);
        res.status(500).json({ error: 'Failed to get OAuth client ID' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Kiss them! backend server running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`🔐 Backend API available at: http://localhost:${PORT}/api`);
    console.log(`🛡️ API endpoints are now SECURED with Google OAuth authentication`);
});

module.exports = app; 