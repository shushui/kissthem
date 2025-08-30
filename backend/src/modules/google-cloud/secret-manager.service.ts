import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretManagerService implements OnModuleInit {
  private readonly logger = new Logger(SecretManagerService.name);
  private secretManager: SecretManagerServiceClient;
  private readonly secretsCache: Record<string, string> = {};

  onModuleInit() {
    // Configure Secret Manager with project ID for local development
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (projectId) {
      this.secretManager = new SecretManagerServiceClient({
        projectId: projectId,
      });
      this.logger.log(`Secret Manager initialized with project ID: ${projectId}`);
      this.logger.log(`Using project: ${projectId}`);
    } else {
      this.secretManager = new SecretManagerServiceClient();
      this.logger.warn('No GOOGLE_CLOUD_PROJECT_ID found, using default Secret Manager configuration');
    }
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    if (this.secretsCache[secretName]) {
      return this.secretsCache[secretName];
    }

    // For local development, check environment variables first
    const envVarName = secretName.toUpperCase().replace(/-/g, '_');
    const envValue = process.env[envVarName];
    
    if (envValue) {
      this.logger.log(`Using environment variable for ${secretName}`);
      this.secretsCache[secretName] = envValue;
      return envValue;
    }

    // Fallback to Google Cloud Secret Manager
    try {
      const name = `projects/kissthem/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });
      const secret = version.payload.data.toString();
      this.secretsCache[secretName] = secret;
      return secret;
    } catch (error) {
      this.logger.error(`Error accessing secret ${secretName}:`, error);
      
      // For local development, provide fallback values
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(`Using fallback value for ${secretName} in development mode`);
        
        switch (secretName) {
          case 'oauth-client-id':
            return '123679151422-eeij1ta83fh2gh4cjfgn6m0p93bia6d3.apps.googleusercontent.com';
          case 'gemini-api-key':
            this.logger.error('GEMINI_API_KEY environment variable is required for local development');
            throw new Error('GEMINI_API_KEY environment variable is required for local development');
          default:
            throw new Error(`Secret ${secretName} not found and no fallback available`);
        }
      }
      
      throw error;
    }
  }
}
