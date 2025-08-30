import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, initializeGoogleAuth, renderGoogleSignInButton, signOut } from './utils/googleAuth';
import { authService, imageService, galleryService } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const clientIdResponse = await authService.getOAuthClientId();
        console.log('Got OAuth client ID:', clientIdResponse.clientId);
        
        await initializeGoogleAuth(clientIdResponse.clientId);
        console.log('Google Auth initialized successfully');
        
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Load gallery if user is logged in
        if (currentUser) {
          loadUserGallery();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(`Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      const signInElement = document.getElementById('google-sign-in');
      if (signInElement) {
        renderGoogleSignInButton(signInElement);
      }
    }
  }, [isLoading, user]);

  const loadUserGallery = async () => {
    if (!user) return;
    
    try {
      setIsLoadingGallery(true);
      const response = await galleryService.getUserGallery();
      console.log('Gallery response:', response);
      
      if (response.success && response.photos) {
        setGalleryImages(response.photos);
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
      setGalleryImages([]);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage || !user) return;
    
    setIsProcessing(true);
    
    try {
      // Convert image to base64
      const base64Image = await convertFileToBase64(selectedImage);
      
      // Call backend API
      const response = await imageService.processImage({
        image: base64Image,
        prompt: "Add a cute, romantic kiss to this photo. Make the person look surprised, happy, and delighted - like they just received an unexpected but wonderful surprise!"
      });
      
      console.log('Image processing response:', response);
      
      if (response.success) {
        // Reload gallery to show new image
        await loadUserGallery();
        setSelectedImage(null);
        
        // Show success message
        alert(response.message || 'Image processed successfully!');
      } else {
        alert('Failed to process image. Please try again.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Error processing image. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setGalleryImages([]);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeletingPhoto(photoId);
      await galleryService.deletePhoto(photoId);
      
      // Remove the photo from the local state
      setGalleryImages(prev => prev.filter(photo => photo.id !== photoId));
      
      alert('Photo deleted successfully!');
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeletingPhoto(null);
    }
  };

  const handleDeleteAllPhotos = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your photos? This action cannot be undone and will permanently remove all your images.')) {
      return;
    }
    
    try {
      setIsDeletingAll(true);
      const response = await galleryService.deleteAllPhotos();
      
      // Clear the gallery
      setGalleryImages([]);
      
      alert(`Successfully deleted ${response.deletedCount} photos!`);
    } catch (err) {
      console.error('Error deleting all photos:', err);
      alert('Failed to delete all photos. Please try again.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="loading-spinner"></div>
          <h2>Loading Kiss them! 💋</h2>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              🔄 Retry
            </button>
            <button className="btn btn-outline" onClick={() => setError(null)}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <div className="welcome">
          <div className="welcome-content">
            <h1>💋 Kiss them!</h1>
            <p>Upload a photo and let AI add cute kisses to it!</p>
            <div id="google-sign-in"></div>
            
            {/* Fallback for development/testing */}
            <div className="dev-signin">
              <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
                Having trouble with Google Sign-In?
              </p>
              <button 
                className="btn btn-outline btn-small"
                onClick={() => {
                  // Create a mock user for testing
                  const mockUser = {
                    id: 'dev-user-123',
                    email: 'dev@example.com',
                    name: 'Developer User',
                    picture: undefined
                  };
                  setUser(mockUser);
                }}
              >
                🧪 Dev Mode Sign-In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1>💋 Kiss them!</h1>
          <div className="user-info">
            <div className="user-profile">
              {user.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
              <span className="user-name">Hi, {user.name}!</span>
            </div>
            <button className="btn btn-outline" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </header>
      
      <main className="main">
        <div className="upload-section">
          <h2>📸 Upload Your Photo</h2>
          <p>Choose a photo and let our AI add cute kisses to it!</p>
          
          <div className="upload-area">
            {!selectedImage ? (
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="upload-input"
                />
                <div className="upload-content">
                  <span className="upload-icon">📁</span>
                  <span>Click to select an image</span>
                  <span className="upload-hint">or drag and drop</span>
                </div>
              </label>
            ) : (
              <div className="selected-image">
                <img src={URL.createObjectURL(selectedImage)} alt="Selected" />
                <div className="image-actions">
                  <button className="btn btn-primary" onClick={handleProcessImage} disabled={isProcessing}>
                    {isProcessing ? 'Processing... 💋' : 'Add Kisses! 💋'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setSelectedImage(null)}>
                    Choose Different Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="gallery-section">
          <div className="gallery-header">
            <h2>🖼️ Your Gallery</h2>
            <div className="gallery-actions">
              <button 
                className="btn btn-outline btn-small" 
                onClick={loadUserGallery}
                disabled={isLoadingGallery}
              >
                {isLoadingGallery ? 'Loading...' : '🔄 Refresh'}
              </button>
              {galleryImages.length > 0 && (
                <button 
                  className="btn btn-danger btn-small" 
                  onClick={handleDeleteAllPhotos}
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? 'Deleting...' : '🗑️ Delete All'}
                </button>
              )}
            </div>
          </div>
          <p>View all your kissed photos here!</p>
          
          {isLoadingGallery ? (
            <div className="loading-gallery">
              <div className="loading-spinner"></div>
              <p>Loading your gallery...</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="empty-gallery">
              <span className="empty-icon">🖼️</span>
              <p>No photos yet. Upload your first image to get started!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {galleryImages.map((photo, index) => (
                <div key={photo.id || index} className="gallery-item">
                  <img 
                    src={photo.generatedUrl || photo.originalUrl} 
                    alt={photo.photoName || `Photo ${index + 1}`} 
                  />
                  <div className="gallery-item-overlay">
                    <div className="photo-info">
                      <h4>{photo.photoName || `Photo ${index + 1}`}</h4>
                      <p>{photo.aiResponse || 'Processed with AI'}</p>
                    </div>
                    <div className="photo-actions">
                      <button className="btn btn-small">Download</button>
                      <button className="btn btn-small btn-outline">Share</button>
                      <button 
                        className="btn btn-small btn-danger" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        disabled={isDeletingPhoto === photo.id}
                      >
                        {isDeletingPhoto === photo.id ? 'Deleting...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
