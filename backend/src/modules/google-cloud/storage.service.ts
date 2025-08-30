import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storage = new Storage();
  private readonly bucketName = 'kissthem-images';

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
