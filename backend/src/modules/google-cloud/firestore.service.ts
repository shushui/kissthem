import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Photo } from '../../interfaces/photo.interface';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private readonly logger = new Logger(FirestoreService.name);
  private firestore: Firestore;

  onModuleInit() {
    // Configure Firestore with project ID for local development
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (projectId) {
      this.firestore = new Firestore({
        projectId: projectId,
      });
      this.logger.log(`Firestore initialized with project ID: ${projectId}`);
    } else {
      this.firestore = new Firestore();
      this.logger.warn('No GOOGLE_CLOUD_PROJECT_ID found, using default Firestore configuration');
    }
  }

  async savePhoto(photo: Photo): Promise<void> {
    try {
      await this.firestore.collection('photos').doc(photo.id).set(photo);
      this.logger.log(`Photo saved successfully: ${photo.id}`);
    } catch (error) {
      this.logger.error('Error saving photo to Firestore:', error);
      throw error;
    }
  }

  async getUserPhotos(userId: string): Promise<Photo[]> {
    try {
      const photosSnapshot = await this.firestore
        .collection('photos')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const photos: Photo[] = [];
      photosSnapshot.forEach(doc => {
        photos.push({
          id: doc.id,
          ...doc.data()
        } as Photo);
      });
      
      this.logger.log(`Retrieved ${photos.length} photos for user ${userId}`);
      return photos;
    } catch (error) {
      this.logger.error('Error retrieving photos from Firestore:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    try {
      await this.firestore.collection('photos').doc(photoId).delete();
      this.logger.log(`Photo deleted successfully: ${photoId}`);
    } catch (error) {
      this.logger.error('Error deleting photo from Firestore:', error);
      throw error;
    }
  }

  async getPhoto(photoId: string): Promise<Photo | null> {
    try {
      const photoDoc = await this.firestore.collection('photos').doc(photoId).get();
      
      if (!photoDoc.exists) {
        return null;
      }
      
      return {
        id: photoDoc.id,
        ...photoDoc.data()
      } as Photo;
    } catch (error) {
      this.logger.error('Error retrieving photo from Firestore:', error);
      throw error;
    }
  }
}
