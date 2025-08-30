const express = require('express');
const cors = require('cors');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenAI } = require('@google/genai');
const { OAuth2Client } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Initialize Google Cloud services
const secretManager = new SecretManagerServiceClient();
const storage = new Storage();
const firestore = new Firestore();

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

        const token = authHeader.substring(7);
        const clientId = await getSecret('oauth-client-id');
        const client = new OAuth2Client(clientId);
        
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

// Generate cool name for photo using Gemini
async function generatePhotoName(imageData, prompt, geminiApiKey) {
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                {
                    text: `Generate a cool, creative, and memorable name for this photo. The user requested: "${prompt}". 
                    The name should be 2-4 words, catchy, and related to the photo content. 
                    Examples: "Midnight Kiss", "Sunset Romance", "Urban Love Story", "Beachside Affection".
                    Return only the name, nothing else.`
                },
                {
                    inlineData: {
                        data: imageData.split(',')[1],
                        mimeType: 'image/jpeg'
                    }
                }
            ]
        });
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const name = response.candidates[0].content.parts[0].text.trim();
            return name || "My Kissed Photo";
        }
        
        return "My Kissed Photo";
    } catch (error) {
        console.error('Error generating photo name:', error);
        return "My Kissed Photo";
    }
}

// Upload image to Google Cloud Storage
async function uploadToStorage(imageData, fileName, bucketName) {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        
        const base64Data = imageData.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpeg'
            }
        });
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        return publicUrl;
    } catch (error) {
        console.error('Error uploading to storage:', error);
        throw error;
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

        console.log(`🎨 User ${req.user.email} is processing an image with prompt: "${prompt}"`);

        const geminiApiKey = await getSecret('gemini-api-key');
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        // Generate cool name for the photo
        const photoName = await generatePhotoName(image, prompt, geminiApiKey);
        console.log(`📝 Generated photo name: "${photoName}"`);

        // Create unique IDs for the images
        const originalId = uuidv4();
        const generatedId = uuidv4();
        const timestamp = new Date().toISOString();
        
        // Upload original image to storage
        const originalFileName = `users/${req.user.id}/originals/${originalId}.jpg`;
        const originalUrl = await uploadToStorage(image, originalFileName, 'kissthem-images');
        
        // Prepare image data for Gemini
        const imageData = {
            inlineData: {
                data: image.split(',')[1],
                mimeType: 'image/jpeg'
            }
        };

        const fullPrompt = prompt || "Take this photo and add a cute kiss to it. Generate a new version with the kiss added. Make it look natural and adorable.";

        try {
            console.log(`🚀 Sending image to Gemini "Nano Banana" model for user ${req.user.email}...`);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image-preview",
                contents: [fullPrompt, imageData],
            });
            
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const content = response.candidates[0].content;
                
                let generatedImage = null;
                let aiResponse = "";
                
                for (const part of content.parts) {
                    if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
                        generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        console.log(`🎉 Gemini "Nano Banana" generated a new image for user ${req.user.email}!`);
                    } else if (part.text) {
                        aiResponse += part.text;
                    }
                }
                
                if (generatedImage) {
                    // Upload generated image to storage
                    const generatedFileName = `users/${req.user.id}/generated/${generatedId}.jpg`;
                    const generatedUrl = await uploadToStorage(generatedImage, generatedFileName, 'kissthem-images');
                    
                    // Save to Firestore
                    const photoDoc = {
                        userId: req.user.id,
                        userEmail: req.user.email,
                        userName: req.user.name,
                        originalId: originalId,
                        generatedId: generatedId,
                        originalUrl: originalUrl,
                        generatedUrl: generatedUrl,
                        photoName: photoName,
                        prompt: prompt || fullPrompt,
                        aiResponse: aiResponse,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    };
                    
                    await firestore.collection('photos').doc(originalId).set(photoDoc);
                    
                    console.log(`✅ Successfully processed and saved image for user ${req.user.email}`);
                    
                    res.json({
                        success: true,
                        photoId: originalId,
                        photoName: photoName,
                        originalUrl: originalUrl,
                        generatedUrl: generatedUrl,
                        aiResponse: aiResponse || "Image generated successfully with Gemini 'Nano Banana'!",
                        message: '🎉 Gemini "Nano Banana" generated a new kissed version of your photo! 💋✨',
                        user: {
                            email: req.user.email,
                            name: req.user.name
                        }
                    });
                } else {
                    // No image generated, save only original
                    const photoDoc = {
                        userId: req.user.id,
                        userEmail: req.user.email,
                        userName: req.user.name,
                        originalId: originalId,
                        generatedId: null,
                        originalUrl: originalUrl,
                        generatedUrl: null,
                        photoName: photoName,
                        prompt: prompt || fullPrompt,
                        aiResponse: aiResponse || "AI analyzed your image but couldn't generate a new version.",
                        createdAt: timestamp,
                        updatedAt: timestamp
                    };
                    
                    await firestore.collection('photos').doc(originalId).set(photoDoc);
                    
                    res.json({
                        success: true,
                        photoId: originalId,
                        photoName: photoName,
                        originalUrl: originalUrl,
                        generatedUrl: null,
                        aiResponse: aiResponse || "AI analyzed your image but couldn't generate a new version.",
                        message: 'Image analyzed by AI (no generation available) 💋',
                        user: {
                            email: req.user.email,
                            name: req.user.name
                        }
                    });
                }
            } else {
                // Fallback
                const photoDoc = {
                    userId: req.user.id,
                    userEmail: req.user.email,
                    userName: req.user.name,
                    originalId: originalId,
                    generatedId: null,
                    originalUrl: originalUrl,
                    generatedUrl: null,
                    photoName: photoName,
                    prompt: prompt || fullPrompt,
                    aiResponse: "AI processing completed but no image generation available.",
                    createdAt: timestamp,
                    updatedAt: timestamp
                };
                
                await firestore.collection('photos').doc(originalId).set(photoDoc);
                
                res.json({
                    success: true,
                    photoId: originalId,
                    photoName: photoName,
                    originalUrl: originalUrl,
                    generatedUrl: null,
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
            
            // Save only original image
            const photoDoc = {
                userId: req.user.id,
                userEmail: req.user.email,
                userName: req.user.name,
                originalId: originalId,
                generatedId: null,
                originalUrl: originalUrl,
                generatedUrl: null,
                photoName: photoName,
                        prompt: prompt || fullPrompt,
                        aiResponse: "AI processing failed, but image was uploaded successfully.",
                        createdAt: timestamp,
                        updatedAt: timestamp
            };
            
            await firestore.collection('photos').doc(originalId).set(photoDoc);
            
            res.json({
                success: true,
                photoId: originalId,
                photoName: photoName,
                originalUrl: originalUrl,
                generatedUrl: null,
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

// Get user's photo gallery - PROTECTED ENDPOINT
app.get('/api/gallery', validateGoogleToken, async (req, res) => {
    try {
        console.log(`🖼️ User ${req.user.email} is accessing their gallery`);
        
        const photosSnapshot = await firestore
            .collection('photos')
            .where('userId', '==', req.user.id)
            .orderBy('createdAt', 'desc')
            .get();
        
        const photos = [];
        photosSnapshot.forEach(doc => {
            photos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Retrieved ${photos.length} photos for user ${req.user.email}`);
        
        res.json({
            success: true,
            photos: photos,
            count: photos.length,
            user: {
                email: req.user.email,
                name: req.user.name
            }
        });
        
    } catch (error) {
        console.error(`❌ Error retrieving gallery for user ${req.user.email}:`, error);
        res.status(500).json({
            error: 'Failed to retrieve gallery',
            details: error.message
        });
    }
});

// Delete specific photo - PROTECTED ENDPOINT
app.delete('/api/photos/:photoId', validateGoogleToken, async (req, res) => {
    try {
        const { photoId } = req.params;
        
        console.log(`🗑️ User ${req.user.email} is deleting photo ${photoId}`);
        
        // Get photo document
        const photoDoc = await firestore.collection('photos').doc(photoId).get();
        
        if (!photoDoc.exists) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        
        const photoData = photoDoc.data();
        
        // Verify ownership
        if (photoData.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Delete from Cloud Storage
        const bucket = storage.bucket('kissthem-images');
        
        if (photoData.originalUrl) {
            const originalFileName = `users/${req.user.id}/originals/${photoId}.jpg`;
            await bucket.file(originalFileName).delete();
        }
        
        if (photoData.generatedUrl) {
            const generatedFileName = `users/${req.user.id}/generated/${photoData.generatedId}.jpg`;
            await bucket.file(generatedFileName).delete();
        }
        
        // Delete from Firestore
        await firestore.collection('photos').doc(photoId).delete();
        
        console.log(`✅ Successfully deleted photo ${photoId} for user ${req.user.email}`);
        
        res.json({
            success: true,
            message: 'Photo deleted successfully',
            photoId: photoId
        });
        
    } catch (error) {
        console.error(`❌ Error deleting photo for user ${req.user.email}:`, error);
        res.status(500).json({
            error: 'Failed to delete photo',
            details: error.message
        });
    }
});

// Delete all user photos - PROTECTED ENDPOINT
app.delete('/api/gallery', validateGoogleToken, async (req, res) => {
    try {
        console.log(`🗑️ User ${req.user.email} is deleting their entire gallery`);
        
        // Get all user photos
        const photosSnapshot = await firestore
            .collection('photos')
            .where('userId', '==', req.user.id)
            .get();
        
        const bucket = storage.bucket('kissthem-images');
        let deletedCount = 0;
        
        // Delete from Cloud Storage and Firestore
        for (const doc of photosSnapshot.docs) {
            const photoData = doc.data();
            
            if (photoData.originalUrl) {
                const originalFileName = `users/${req.user.id}/originals/${doc.id}.jpg`;
                await bucket.file(originalFileName).delete();
            }
            
            if (photoData.generatedUrl) {
                const generatedFileName = `users/${req.user.id}/generated/${photoData.generatedId}.jpg`;
                await bucket.file(generatedFileName).delete();
            }
            
            await doc.ref.delete();
            deletedCount++;
        }
        
        console.log(`✅ Successfully deleted ${deletedCount} photos for user ${req.user.email}`);
        
        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} photos`,
            message: `Successfully deleted ${deletedCount} photos`,
            deletedCount: deletedCount
        });
        
    } catch (error) {
        console.error(`❌ Error deleting gallery for user ${req.user.email}:`, error);
        res.status(500).json({
            error: 'Failed to delete gallery',
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
    console.log(`💾 Image storage system enabled with Cloud Storage + Firestore`);
});

module.exports = app;
