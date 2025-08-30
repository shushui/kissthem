import { Controller, Get } from '@nestjs/common';
import { SecretManagerService } from '../google-cloud/secret-manager.service';

@Controller('api')
export class AuthController {
  constructor(private readonly secretManagerService: SecretManagerService) {}

  @Get('oauth-client-id')
  async getOAuthClientId() {
    try {
      const clientId = await this.secretManagerService.getSecret('oauth-client-id');
      return { clientId };
    } catch (error) {
      throw new Error('Failed to get OAuth client ID');
    }
  }
}
