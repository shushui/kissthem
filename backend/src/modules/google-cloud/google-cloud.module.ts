import { Module } from '@nestjs/common';
import { SecretManagerService } from './secret-manager.service';
import { StorageService } from './storage.service';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [SecretManagerService, StorageService, FirestoreService],
  exports: [SecretManagerService, StorageService, FirestoreService],
})
export class GoogleCloudModule {}
