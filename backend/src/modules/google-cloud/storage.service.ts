import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private storage: Storage;
  private readonly bucketName = 'kissthem-images';

  onModuleInit() {
    // Configure Storage with project ID for local development
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (projectId) {
      this.storage = new Storage({
        projectId: projectId,
      });
      this.logger.log(`Storage initialized with project ID: ${projectId}`);
    } else {
      this.storage = new Storage();
      this.logger.warn('No GOOGLE_CLOUD_PROJECT_ID found, using default Storage configuration');
    }
  }

  async uploadImage(imageData: string, fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      await file.save(buffer, {
        metadata: {
          contentType: 'image/jpeg'
        }
      });
      
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      this.logger.log(`Image uploaded successfully: ${fileName}`);
      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading to storage:', error);
      throw error;
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
      this.logger.log(`Image deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error('Error deleting from storage:', error);
      throw error;
    }
  }
}
