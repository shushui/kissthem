import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ProcessImageRequest } from '../../interfaces/photo.interface';
import { mockUser, mockProcessImageRequest, mockProcessImageResponse } from '../../test/test-utils';

describe('ImageController', () => {
  let controller: ImageController;
  let imageService: ImageService;

  beforeEach(() => {
    // Create mock service
    imageService = {
      processImage: jest.fn(),
    } as any;

    // Create controller instance directly
    controller = new ImageController(imageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /api/process-image', () => {
    it('should process image successfully', async () => {
      const mockRequest = mockProcessImageRequest;
      const mockReq = { user: mockUser };
      
      jest.spyOn(imageService, 'processImage').mockResolvedValue(mockProcessImageResponse);

      const result = await controller.processImage(mockRequest, mockReq);

      expect(result).toEqual(mockProcessImageResponse);
      expect(imageService.processImage).toHaveBeenCalledWith(mockRequest, mockUser);
    });

    it('should handle image processing errors', async () => {
      const mockRequest = mockProcessImageRequest;
      const mockReq = { user: mockUser };
      const error = new Error('AI processing failed');
      
      jest.spyOn(imageService, 'processImage').mockRejectedValue(error);

      await expect(controller.processImage(mockRequest, mockReq)).rejects.toThrow('AI processing failed');
      expect(imageService.processImage).toHaveBeenCalledWith(mockRequest, mockUser);
    });

    it('should process image with custom prompt', async () => {
      const customRequest = {
        ...mockProcessImageRequest,
        prompt: 'Make it romantic with hearts'
      };
      const mockReq = { user: mockUser };
      
      jest.spyOn(imageService, 'processImage').mockResolvedValue(mockProcessImageResponse);

      const result = await controller.processImage(customRequest, mockReq);

      expect(result).toEqual(mockProcessImageResponse);
      expect(imageService.processImage).toHaveBeenCalledWith(customRequest, mockUser);
    });

    it('should handle large image files', async () => {
      const largeImageRequest = {
        ...mockProcessImageRequest,
        image: 'data:image/jpeg;base64,' + 'A'.repeat(1000000) // Large base64 string
      };
      const mockReq = { user: mockUser };
      
      jest.spyOn(imageService, 'processImage').mockResolvedValue(mockProcessImageResponse);

      const result = await controller.processImage(largeImageRequest, mockReq);

      expect(result).toEqual(mockProcessImageResponse);
      expect(imageService.processImage).toHaveBeenCalledWith(largeImageRequest, mockUser);
    });
  });
}); 