import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('OK');
          expect(res.body.service).toBe('Kiss them! NestJS Backend');
          expect(res.body.version).toBe('1.0.0');
        });
    });
  });

  describe('Authentication', () => {
    it('/api/oauth-client-id (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/oauth-client-id')
        .expect(200)
        .expect((res) => {
          expect(res.body.clientId).toBeDefined();
          expect(typeof res.body.clientId).toBe('string');
        });
    });
  });

  describe('Protected Endpoints - Authentication Required', () => {
    it('/api/process-image (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/process-image')
        .send({
          image: 'data:image/jpeg;base64,test',
          prompt: 'Add kisses'
        })
        .expect(401); // Unauthorized - authentication required
    });

    it('/api/gallery (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/gallery')
        .expect(401); // Unauthorized - authentication required
    });

    it('/api/photos/:id (DELETE) - should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/photos/test-photo-123')
        .expect(401); // Unauthorized - authentication required
    });

    it('/api/gallery (DELETE) - should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/gallery')
        .expect(401); // Unauthorized - authentication required
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/unknown-route')
        .expect(404);
    });

    it('should handle malformed JSON', () => {
      return request(app.getHttpServer())
        .post('/api/process-image')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });

  describe('API Security', () => {
    it('should protect all API endpoints with authentication', async () => {
      // Test each protected endpoint individually to avoid connection issues
      await request(app.getHttpServer())
        .get('/api/gallery')
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/process-image')
        .send({})
        .expect(401);

      await request(app.getHttpServer())
        .delete('/api/photos/test-123')
        .expect(401);

      await request(app.getHttpServer())
        .delete('/api/gallery')
        .expect(401);
    });
  });
}); 