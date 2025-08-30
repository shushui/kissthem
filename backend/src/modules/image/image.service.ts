import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { SecretManagerService } from '../google-cloud/secret-manager.service';
import { StorageService } from '../google-cloud/storage.service';
import { FirestoreService } from '../google-cloud/firestore.service';
import { ProcessImageRequest, ProcessImageResponse, Photo } from '../../interfaces/photo.interface';
import { User } from '../../interfaces/user.interface';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    private readonly secretManagerService: SecretManagerService,
    private readonly storageService: StorageService,
    private readonly firestoreService: FirestoreService,
  ) {}

  async generatePhotoName(imageData: string, prompt: string, geminiApiKey: string): Promise<string> {
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
      this.logger.error('Error generating photo name:', error);
      return "My Kissed Photo";
    }
  }

  async processImage(request: ProcessImageRequest, user: User): Promise<ProcessImageResponse> {
    try {
      this.logger.log(`User ${user.email} is processing an image with prompt: "${request.prompt}"`);

      const geminiApiKey = await this.secretManagerService.getSecret('gemini-api-key');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      // Generate cool name for the photo
      const photoName = await this.generatePhotoName(request.image, request.prompt, geminiApiKey);
      this.logger.log(`Generated photo name: "${photoName}"`);

      // Create unique IDs for the images
      const originalId = uuidv4();
      const generatedId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Upload original image to storage
      const originalFileName = `users/${user.id}/originals/${originalId}.jpg`;
      const originalUrl = await this.storageService.uploadImage(request.image, originalFileName);
      
      // Prepare image data for Gemini
      const imageData = {
        inlineData: {
          data: request.image.split(',')[1],
          mimeType: 'image/jpeg'
        }
      };

      const fullPrompt = request.prompt || "Take this photo and add a cute, romantic kiss to it. The person receiving the kiss should look surprised, happy, and delighted - like they just received an unexpected but wonderful surprise! Make the kiss look natural, adorable, and create a magical moment. The person's expression should show pure joy and surprise at receiving this sweet kiss.";

      try {
        this.logger.log(`Sending image to Gemini "Nano Banana" model for user ${user.email}...`);
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: [fullPrompt, imageData],
        });
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          const content = response.candidates[0].content;
          
          let generatedImage = null;
          let aiResponse = "";
          
          // Handle different response formats more robustly
          if (content.parts && Array.isArray(content.parts)) {
            for (const part of content.parts) {
              if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
                generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                this.logger.log(`Gemini "Nano Banana" generated a new image for user ${user.email}!`);
              } else if (part.text) {
                aiResponse += part.text;
              }
            }
          } else {
            // Handle other response formats
            this.logger.log(`Unexpected Gemini response format for user ${user.email}:`, content);
            aiResponse = "AI processed your image successfully!";
          }
          
          if (generatedImage) {
            // Upload generated image to storage
            const generatedFileName = `users/${user.id}/generated/${generatedId}.jpg`;
            const generatedUrl = await this.storageService.uploadImage(generatedImage, generatedFileName);
            
            // Save to Firestore
            const photoDoc: Photo = {
              id: originalId,
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
              originalId: originalId,
              generatedId: generatedId,
              originalUrl: originalUrl,
              generatedUrl: generatedUrl,
              photoName: photoName,
              prompt: request.prompt || fullPrompt,
              aiResponse: aiResponse,
              createdAt: timestamp,
              updatedAt: timestamp
            };
            
            await this.firestoreService.savePhoto(photoDoc);
            
            this.logger.log(`Successfully processed and saved image for user ${user.email}`);
            
            return {
              success: true,
              photoId: originalId,
              photoName: photoName,
              originalUrl: originalUrl,
              generatedUrl: generatedUrl,
              aiResponse: aiResponse || "Image generated successfully with Gemini 'Nano Banana'!",
              message: '🎉 Gemini "Nano Banana" generated a new kissed version of your photo! 💋✨',
              user: {
                email: user.email,
                name: user.name
              }
            };
          } else {
            // No image generated, save only original
            const photoDoc: Photo = {
              id: originalId,
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
              originalId: originalId,
              generatedId: null,
              originalUrl: originalUrl,
              generatedUrl: null,
              photoName: photoName,
              prompt: request.prompt || fullPrompt,
              aiResponse: aiResponse || "AI analyzed your image but couldn't generate a new version.",
              createdAt: timestamp,
              updatedAt: timestamp
            };
            
            await this.firestoreService.savePhoto(photoDoc);
            
            return {
              success: true,
              photoId: originalId,
              photoName: photoName,
              originalUrl: originalUrl,
              generatedUrl: null,
              aiResponse: aiResponse || "AI analyzed your image but couldn't generate a new version.",
              message: 'Image analyzed by AI (no generation available) 💋',
              user: {
                email: user.email,
                name: user.name
              }
            };
          }
        } else {
          // Fallback
          const photoDoc: Photo = {
            id: originalId,
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            originalId: originalId,
            generatedId: null,
            originalUrl: originalUrl,
            generatedUrl: null,
            photoName: photoName,
            prompt: request.prompt || fullPrompt,
            aiResponse: "AI processing completed but no image generation available.",
            createdAt: timestamp,
            updatedAt: timestamp
          };
          
          await this.firestoreService.savePhoto(photoDoc);
          
          return {
            success: true,
            photoId: originalId,
            photoName: photoName,
            originalUrl: originalUrl,
            generatedUrl: null,
            aiResponse: "AI processing completed but no image generation available.",
            message: 'Image processed (no generation available) 💋',
            user: {
              email: user.email,
              name: user.name
            }
          };
        }

      } catch (geminiError) {
        this.logger.error(`Gemini API error for user ${user.email}:`, geminiError);
        
        // Save only original image
        const photoDoc: Photo = {
          id: originalId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          originalId: originalId,
          generatedId: null,
          originalUrl: originalUrl,
          generatedUrl: null,
          photoName: photoName,
          prompt: request.prompt || fullPrompt,
          aiResponse: "AI processing failed, but image was uploaded successfully.",
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        await this.firestoreService.savePhoto(photoDoc);
        
        return {
          success: true,
          photoId: originalId,
          photoName: photoName,
          originalUrl: originalUrl,
          generatedUrl: null,
          aiResponse: "AI processing failed, but image was uploaded successfully.",
          message: 'Image uploaded (AI processing failed) 💋',
          user: {
            email: user.email,
            name: user.name
          }
        };
      }

    } catch (error) {
      this.logger.error(`Error processing image for user ${user.email}:`, error);
      throw error;
    }
  }
}
