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
