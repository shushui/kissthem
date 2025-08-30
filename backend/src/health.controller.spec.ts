import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      
      expect(result).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Kiss them! NestJS Backend',
        version: '1.0.0'
      });
      
      // Check timestamp is recent
      const timestamp = new Date(result.timestamp);
      const now = new Date();
      const diffInMinutes = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60);
      expect(diffInMinutes).toBeLessThan(1); // Should be within 1 minute
    });

    it('should have correct service name', () => {
      const result = controller.getHealth();
      expect(result.service).toBe('Kiss them! NestJS Backend');
    });

    it('should have correct version', () => {
      const result = controller.getHealth();
      expect(result.version).toBe('1.0.0');
    });
  });
}); 