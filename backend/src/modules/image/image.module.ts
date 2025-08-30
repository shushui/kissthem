import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';

@Module({
  imports: [GoogleCloudModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
