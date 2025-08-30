import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';

@Module({
  imports: [GoogleCloudModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
