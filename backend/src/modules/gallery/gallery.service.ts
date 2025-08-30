import { Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from '../google-cloud/firestore.service';
import { StorageService } from '../google-cloud/storage.service';
import { Photo } from '../../interfaces/photo.interface';
import { User } from '../../interfaces/user.interface';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly storageService: StorageService,
  ) {}

  async getUserGallery(user: User): Promise<{ photos: Photo[]; count: number }> {
    try {
      this.logger.log(`User ${user.email} is accessing their gallery`);
      
      const photos = await this.firestoreService.getUserPhotos(user.id);
      
      this.logger.log(`Retrieved ${photos.length} photos for user ${user.email}`);
      
      return {
        photos,
        count: photos.length
      };
    } catch (error) {
      this.logger.error(`Error retrieving gallery for user ${user.email}:`, error);
      throw error;
    }
  }

  async deletePhoto(photoId: string, user: User): Promise<void> {
    try {
      this.logger.log(`User ${user.email} is deleting photo ${photoId}`);
      
      // Get photo document
      const photo = await this.firestoreService.getPhoto(photoId);
      
      if (!photo) {
        throw new Error('Photo not found');
      }
      
      // Verify ownership
      if (photo.userId !== user.id) {
        throw new Error('Access denied');
      }
      
      // Delete from Cloud Storage
      if (photo.originalUrl) {
        const originalFileName = `users/${user.id}/originals/${photoId}.jpg`;
        await this.storageService.deleteImage(originalFileName);
      }
      
      if (photo.generatedUrl) {
        const generatedFileName = `users/${user.id}/generated/${photo.generatedId}.jpg`;
        await this.storageService.deleteImage(generatedFileName);
      }
      
      // Delete from Firestore
      await this.firestoreService.deletePhoto(photoId);
      
      this.logger.log(`Successfully deleted photo ${photoId} for user ${user.email}`);
    } catch (error) {
      this.logger.error(`Error deleting photo for user ${user.email}:`, error);
      throw error;
    }
  }

  async deleteUserGallery(user: User): Promise<{ deletedCount: number }> {
    try {
      this.logger.log(`User ${user.email} is deleting their entire gallery`);
      
      // Get all user photos
      const photos = await this.firestoreService.getUserPhotos(user.id);
      let deletedCount = 0;
      
      // Delete from Cloud Storage and Firestore
      for (const photo of photos) {
        if (photo.originalUrl) {
          const originalFileName = `users/${user.id}/originals/${photo.id}.jpg`;
          await this.storageService.deleteImage(originalFileName);
        }
        
        if (photo.generatedUrl) {
          const generatedFileName = `users/${user.id}/generated/${photo.generatedId}.jpg`;
          await this.storageService.deleteImage(generatedFileName);
        }
        
        await this.firestoreService.deletePhoto(photo.id);
        deletedCount++;
      }
      
      this.logger.log(`Successfully deleted ${deletedCount} photos for user ${user.email}`);
      
      return { deletedCount };
    } catch (error) {
      this.logger.error(`Error deleting gallery for user ${user.email}:`, error);
      throw error;
    }
  }
}
