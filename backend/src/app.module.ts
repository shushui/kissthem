import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ImageModule } from './modules/image/image.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { GoogleCloudModule } from './modules/google-cloud/google-cloud.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GoogleCloudModule,
    AuthModule,
    ImageModule,
    GalleryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
