export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Photo {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  originalId: string;
  generatedId?: string;
  originalUrl: string;
  generatedUrl?: string;
  photoName: string;
  prompt: string;
  aiResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessImageRequest {
  image: string;
  prompt?: string;
}

export interface ProcessImageResponse {
  success: boolean;
  photoId: string;
  photoName: string;
  originalUrl: string;
  generatedUrl?: string;
  aiResponse?: string;
  message: string;
  user: {
    email: string;
    name: string;
  };
}

export interface GalleryResponse {
  success: boolean;
  photos: Photo[];
  count: number;
  user: {
    email: string;
    name: string;
  };
}
