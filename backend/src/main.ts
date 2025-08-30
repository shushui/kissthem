import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Log environment configuration for debugging
console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not Set'}`);

async function bootstrap() {
  // Set environment for local development
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for local development and production
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://kissthem-frontend.storage.googleapis.com',
      'https://storage.googleapis.com',
      'https://kissthem-frontend.web.app',
      'https://kissthem-frontend.firebaseapp.com'
    ],
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 Kiss them! NestJS backend running on port ${port}`);
  console.log(`📱 Frontend should connect to: http://localhost:${port}`);
  console.log(`🔐 Backend API available at: http://localhost:${port}/api`);
  console.log(`🛡️ API endpoints are SECURED with Google OAuth authentication`);
  console.log(`💾 Image storage system enabled with Cloud Storage + Firestore`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}
bootstrap();
