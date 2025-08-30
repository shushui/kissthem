import axios from 'axios';
import { ProcessImageRequest, ProcessImageResponse, GalleryResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('googleToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async getOAuthClientId(): Promise<{ clientId: string }> {
    const response = await api.get('/api/oauth-client-id');
    return response.data;
  },
};

export const imageService = {
  async processImage(request: ProcessImageRequest): Promise<ProcessImageResponse> {
    const response = await api.post('/api/process-image', request);
    return response.data;
  },
};

export const galleryService = {
  async getUserGallery(): Promise<GalleryResponse> {
    const response = await api.get('/api/gallery');
    return response.data;
  },

  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/photos/${photoId}`);
    return response.data;
  },

  async deleteAllPhotos(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const response = await api.delete('/api/gallery');
    return response.data;
  },
};
