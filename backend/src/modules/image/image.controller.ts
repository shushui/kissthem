import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ImageService } from './image.service';
import { ProcessImageRequest, ProcessImageResponse } from '../../interfaces/photo.interface';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../../interfaces/user.interface';

@Controller('api')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('process-image')
  @UseGuards(AuthGuard)
  async processImage(
    @Body() request: ProcessImageRequest,
    @Request() req: { user: User }
  ): Promise<ProcessImageResponse> {
    return this.imageService.processImage(request, req.user);
  }
}
