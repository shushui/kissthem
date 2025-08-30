import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../../interfaces/user.interface';

@Controller('api')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('gallery')
  @UseGuards(AuthGuard)
  async getUserGallery(@Request() req: { user: User }) {
    const result = await this.galleryService.getUserGallery(req.user);
    return {
      success: true,
      ...result,
      user: {
        email: req.user.email,
        name: req.user.name
      }
    };
  }

  @Delete('photos/:photoId')
  @UseGuards(AuthGuard)
  async deletePhoto(
    @Param('photoId') photoId: string,
    @Request() req: { user: User }
  ) {
    await this.galleryService.deletePhoto(photoId, req.user);
    return {
      success: true,
      message: 'Photo deleted successfully',
      photoId: photoId
    };
  }

  @Delete('gallery')
  @UseGuards(AuthGuard)
  async deleteUserGallery(@Request() req: { user: User }) {
    const result = await this.galleryService.deleteUserGallery(req.user);
    return {
      success: true,
      message: `Successfully deleted ${result.deletedCount} photos`,
      deletedCount: result.deletedCount
    };
  }
}
