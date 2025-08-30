import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private readonly secretManager = new SecretManagerServiceClient();
  private readonly secretsCache: Record<string, string> = {};

  async getSecret(secretName: string): Promise<string> {
    if (this.secretsCache[secretName]) {
      return this.secretsCache[secretName];
    }

    try {
      const name = `projects/kissthem/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });
      const secret = version.payload.data.toString();
      this.secretsCache[secretName] = secret;
      return secret;
    } catch (error) {
      this.logger.error(`Error accessing secret ${secretName}:`, error);
      throw error;
    }
  }
}
