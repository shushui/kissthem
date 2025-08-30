import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SecretManagerService } from '../google-cloud/secret-manager.service';
import { mockSecretManagerService } from '../../test/test-utils';

describe('AuthController', () => {
  let controller: AuthController;
  let secretManagerService: SecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SecretManagerService,
          useValue: mockSecretManagerService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    secretManagerService = module.get<SecretManagerService>(SecretManagerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/oauth-client-id', () => {
    it('should return OAuth client ID', async () => {
      const mockClientId = 'test-client-id-123';
      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue(mockClientId);

      const result = await controller.getOAuthClientId();

      expect(result).toEqual({
        clientId: mockClientId
      });
      expect(secretManagerService.getSecret).toHaveBeenCalledWith('oauth-client-id');
    });

    it('should handle secret manager errors gracefully', async () => {
      const error = new Error('Secret not found');
      jest.spyOn(secretManagerService, 'getSecret').mockRejectedValue(error);

      await expect(controller.getOAuthClientId()).rejects.toThrow('Failed to get OAuth client ID');
      expect(secretManagerService.getSecret).toHaveBeenCalledWith('oauth-client-id');
    });

    it('should return valid client ID format', async () => {
      const mockClientId = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
      jest.spyOn(secretManagerService, 'getSecret').mockResolvedValue(mockClientId);

      const result = await controller.getOAuthClientId();

      expect(result.clientId).toMatch(/^\d+-\w+\.apps\.googleusercontent\.com$/);
    });
  });
}); 