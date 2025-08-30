import { Module } from '@nestjs/common';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [GoogleCloudModule],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
