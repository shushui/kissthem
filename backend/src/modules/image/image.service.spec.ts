import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { SecretManagerService } from '../google-cloud/secret-manager.service';
import { StorageService } from '../google-cloud/storage.service';
import { FirestoreService } from '../google-cloud/firestore.service';
import { ProcessImageRequest } from '../../interfaces/photo.interface';
import { 
  mockUser, 
  mockProcessImageRequest, 
  mockPhoto,
  mockSecretManagerService,
  mockStorageService,
  mockFirestoreService
} from '../../test/test-utils';

// Mock Google GenAI
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}));

describe('ImageService', () => {
  let service: ImageService;
  let secretManagerService: SecretManagerService;
  let storageService: StorageService;
  let firestoreService: FirestoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: SecretManagerService,
          useValue: mockSecretManagerService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: FirestoreService,
          useValue: mockFirestoreService,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    secretManagerService = module.get<SecretManagerService>(SecretManagerService);
    storageService = module.get<StorageService>(StorageService);
    firestoreService = module.get<FirestoreService>(FirestoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePhotoName', () => {
    it('should generate photo name using Gemini API', async () => {
      const mockGeminiResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'Sunset Kiss' }]
          }
        }]
      };

      // Mock the GoogleGenAI instance
      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockResolvedValue(mockGeminiResponse)
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      const result = await service.generatePhotoName('base64-image', 'Add kisses', 'mock-api-key');

      expect(result).toBe('Sunset Kiss');
      expect(mockGenAI.models.generateContent).toHaveBeenCalled();
    });

    it('should return fallback name if Gemini fails', async () => {
      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      const result = await service.generatePhotoName('base64-image', 'Add kisses', 'mock-api-key');

      expect(result).toBe('My Kissed Photo');
    });
  });

  describe('processImage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should process image successfully with AI generation', async () => {
      const mockGeminiResponse = {
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                mimeType: 'image/jpeg',
                data: 'generated-image-data'
              }
            }]
          }
        }]
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockResolvedValue(mockGeminiResponse)
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://storage.example.com/image.jpg');
      jest.spyOn(firestoreService, 'savePhoto').mockResolvedValue(undefined);

      const result = await service.processImage(mockProcessImageRequest, mockUser);

      expect(result.success).toBe(true);
      expect(result.photoId).toBeDefined();
      expect(result.originalUrl).toBeDefined();
      expect(result.generatedUrl).toBeDefined();
      expect(result.message).toContain('Gemini');
      
      expect(storageService.uploadImage).toHaveBeenCalledTimes(2); // Original + Generated
      expect(firestoreService.savePhoto).toHaveBeenCalled();
    });

    it('should handle AI processing failure gracefully', async () => {
      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockRejectedValue(new Error('AI Service Unavailable'))
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://storage.example.com/image.jpg');
      jest.spyOn(firestoreService, 'savePhoto').mockResolvedValue(undefined);

      const result = await service.processImage(mockProcessImageRequest, mockUser);

      expect(result.success).toBe(true);
      expect(result.originalUrl).toBeDefined();
      expect(result.generatedUrl).toBeNull();
      expect(result.message).toContain('uploaded');
      
      expect(storageService.uploadImage).toHaveBeenCalledTimes(1); // Only original
      expect(firestoreService.savePhoto).toHaveBeenCalled();
    });

    it('should handle storage service failures', async () => {
      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockRejectedValue(new Error('Storage Unavailable'));

      await expect(service.processImage(mockProcessImageRequest, mockUser))
        .rejects.toThrow('Storage Unavailable');
    });

    it('should handle firestore service failures', async () => {
      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://storage.example.com/image.jpg');
      jest.spyOn(firestoreService, 'savePhoto').mockRejectedValue(new Error('Database Error'));

      await expect(service.processImage(mockProcessImageRequest, mockUser))
        .rejects.toThrow('Database Error');
    });

    it('should process image without custom prompt', async () => {
      const requestWithoutPrompt = { ...mockProcessImageRequest };
      delete requestWithoutPrompt.prompt;

      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            candidates: [{
              content: {
                parts: [{
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: 'generated-image-data'
                  }
                }]
              }
            }]
          })
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://storage.example.com/image.jpg');
      jest.spyOn(firestoreService, 'savePhoto').mockResolvedValue(undefined);

      const result = await service.processImage(requestWithoutPrompt, mockUser);

      expect(result.success).toBe(true);
      expect(result.aiResponse).toBeDefined();
      expect(result.message).toContain('Gemini');
    });

    it('should handle different image formats', async () => {
      const pngRequest = {
        ...mockProcessImageRequest,
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockGenAI = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            candidates: [{
              content: {
                parts: [{
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'generated-png-data'
                  }
                }]
              }
            }]
          })
        }
      };
      GoogleGenAI.mockImplementation(() => mockGenAI);

      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://storage.example.com/image.png');
      jest.spyOn(firestoreService, 'savePhoto').mockResolvedValue(undefined);

      const result = await service.processImage(pngRequest, mockUser);

      expect(result.success).toBe(true);
      expect(result.originalUrl).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Gemini API key', async () => {
      jest.spyOn(secretManagerService, 'getSecret').mockRejectedValue(new Error('Secret not found'));

      await expect(service.processImage(mockProcessImageRequest, mockUser))
        .rejects.toThrow('Secret not found');
    });

    it('should handle invalid image data', async () => {
      const invalidRequest = {
        ...mockProcessImageRequest,
        image: 'data:image/jpeg;base64,invalid-base64-data'
      };

      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue('mock-gemini-key');
      jest.spyOn(storageService, 'uploadImage').mockRejectedValue(new Error('Invalid image format'));

      // This should fail because the storage service will reject the invalid image
      await expect(service.processImage(invalidRequest, mockUser))
        .rejects.toThrow('Invalid image format');
    });
  });
}); 