import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { mockUser, mockPhoto } from '../../test/test-utils';

describe('GalleryController', () => {
  let controller: GalleryController;
  let galleryService: GalleryService;

  beforeEach(() => {
    // Create mock service
    galleryService = {
      getUserGallery: jest.fn(),
      deletePhoto: jest.fn(),
      deleteUserGallery: jest.fn(),
    } as any;

    // Create controller instance directly
    controller = new GalleryController(galleryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/gallery', () => {
    it('should return user gallery successfully', async () => {
      const mockReq = { user: mockUser };
      const mockGalleryData = {
        photos: [mockPhoto],
        count: 1
      };
      
      jest.spyOn(galleryService, 'getUserGallery').mockResolvedValue(mockGalleryData);

      const result = await controller.getUserGallery(mockReq);

      expect(result).toEqual({
        success: true,
        photos: [mockPhoto],
        count: 1,
        user: {
          email: mockUser.email,
          name: mockUser.name
        }
      });
      expect(galleryService.getUserGallery).toHaveBeenCalledWith(mockUser);
    });

    it('should handle empty gallery', async () => {
      const mockReq = { user: mockUser };
      const emptyGallery = {
        photos: [],
        count: 0
      };
      
      jest.spyOn(galleryService, 'getUserGallery').mockResolvedValue(emptyGallery);

      const result = await controller.getUserGallery(mockReq);

      expect(result).toEqual({
        success: true,
        photos: [],
        count: 0,
        user: {
          email: mockUser.email,
          name: mockUser.name
        }
      });
    });

    it('should handle gallery service errors', async () => {
      const mockReq = { user: mockUser };
      const error = new Error('Database connection failed');
      
      jest.spyOn(galleryService, 'getUserGallery').mockRejectedValue(error);

      await expect(controller.getUserGallery(mockReq)).rejects.toThrow('Database connection failed');
    });
  });

  describe('DELETE /api/photos/:photoId', () => {
    it('should delete photo successfully', async () => {
      const photoId = 'test-photo-123';
      const mockReq = { user: mockUser };
      
      jest.spyOn(galleryService, 'deletePhoto').mockResolvedValue(undefined);

      const result = await controller.deletePhoto(photoId, mockReq);

      expect(result).toEqual({
        success: true,
        message: 'Photo deleted successfully',
        photoId: photoId
      });
      expect(galleryService.deletePhoto).toHaveBeenCalledWith(photoId, mockUser);
    });

    it('should handle photo deletion errors', async () => {
      const photoId = 'test-photo-123';
      const mockReq = { user: mockUser };
      const error = new Error('Photo not found');
      
      jest.spyOn(galleryService, 'deletePhoto').mockRejectedValue(error);

      await expect(controller.deletePhoto(photoId, mockReq)).rejects.toThrow('Photo not found');
    });

    it('should handle invalid photo ID', async () => {
      const invalidPhotoId = '';
      const mockReq = { user: mockUser };
      
      jest.spyOn(galleryService, 'deletePhoto').mockResolvedValue(undefined);

      const result = await controller.deletePhoto(invalidPhotoId, mockReq);

      expect(result.success).toBe(true);
      expect(result.photoId).toBe(invalidPhotoId);
    });
  });

  describe('DELETE /api/gallery', () => {
    it('should delete entire user gallery successfully', async () => {
      const mockReq = { user: mockUser };
      const mockDeleteResult = { deletedCount: 5 };
      
      jest.spyOn(galleryService, 'deleteUserGallery').mockResolvedValue(mockDeleteResult);

      const result = await controller.deleteUserGallery(mockReq);

      expect(result).toEqual({
        success: true,
        message: 'Successfully deleted 5 photos',
        deletedCount: 5
      });
      expect(galleryService.deleteUserGallery).toHaveBeenCalledWith(mockUser);
    });

    it('should handle empty gallery deletion', async () => {
      const mockReq = { user: mockUser };
      const mockDeleteResult = { deletedCount: 0 };
      
      jest.spyOn(galleryService, 'deleteUserGallery').mockResolvedValue(mockDeleteResult);

      const result = await controller.deleteUserGallery(mockReq);

      expect(result).toEqual({
        success: true,
        message: 'Successfully deleted 0 photos',
        deletedCount: 0
      });
    });

    it('should handle gallery deletion errors', async () => {
      const mockReq = { user: mockUser };
      const error = new Error('Permission denied');
      
      jest.spyOn(galleryService, 'deleteUserGallery').mockRejectedValue(error);

      await expect(controller.deleteUserGallery(mockReq)).rejects.toThrow('Permission denied');
    });
  });
}); 