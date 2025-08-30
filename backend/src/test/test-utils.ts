import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';

// Mock data for testing
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

export const mockPhoto = {
  id: 'test-photo-123',
  userId: mockUser.id,
  userEmail: mockUser.email,
  userName: mockUser.name,
  originalId: 'original-123',
  generatedId: 'generated-123',
  originalUrl: 'https://storage.example.com/original.jpg',
  generatedUrl: 'https://storage.example.com/generated.jpg',
  photoName: 'Test Photo',
  prompt: 'Add cute kisses',
  aiResponse: 'AI processed successfully',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockProcessImageRequest = {
  image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  prompt: 'Add cute kisses to this photo'
};

export const mockProcessImageResponse = {
  success: true,
  photoId: mockPhoto.id,
  photoName: mockPhoto.photoName,
  originalUrl: mockPhoto.originalUrl,
  generatedUrl: mockPhoto.generatedUrl,
  aiResponse: mockPhoto.aiResponse,
  message: '🎉 Gemini generated a new kissed version of your photo! 💋✨',
  user: {
    email: mockUser.email,
    name: mockUser.name
  }
};

// Mock Google Cloud services
export const mockSecretManagerService = {
  getSecret: jest.fn().mockResolvedValue('mock-secret-value')
};

export const mockStorageService = {
  uploadImage: jest.fn().mockResolvedValue('https://storage.example.com/mock-image.jpg'),
  deleteImage: jest.fn().mockResolvedValue(undefined)
};

export const mockFirestoreService = {
  savePhoto: jest.fn().mockResolvedValue(undefined),
  getUserPhotos: jest.fn().mockResolvedValue([mockPhoto]),
  getPhoto: jest.fn().mockResolvedValue(mockPhoto),
  deletePhoto: jest.fn().mockResolvedValue(undefined)
};

export const mockGoogleGenAI = {
  models: {
    generateContent: jest.fn().mockResolvedValue({
      candidates: [{
        content: {
          parts: [{
            inlineData: {
              mimeType: 'image/jpeg',
              data: 'mock-generated-image-data'
            }
          }]
        }
      }]
    })
  }
};

// Create test app with mocked services
export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('SecretManagerService')
    .useValue(mockSecretManagerService)
    .overrideProvider('StorageService')
    .useValue(mockStorageService)
    .overrideProvider('FirestoreService')
    .useValue(mockFirestoreService)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  await app.init();
  return app;
}

// Helper function to create mock request with user
export function createMockRequest(user = mockUser) {
  return {
    user,
    headers: {
      authorization: 'Bearer mock-token'
    }
  };
}

// Helper function to create mock response
export function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
} 