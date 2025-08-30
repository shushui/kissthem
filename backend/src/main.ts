import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for local development
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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
}
bootstrap();
