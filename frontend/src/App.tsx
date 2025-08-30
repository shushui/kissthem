import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, initializeGoogleAuth, renderGoogleSignInButton } from './utils/googleAuth';
import { authService } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const clientIdResponse = await authService.getOAuthClientId();
        await initializeGoogleAuth(clientIdResponse.clientId);
        
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError('Failed to initialize authentication');
        console.error('Auth initialization error:', err);
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

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading">
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
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <div className="welcome">
          <h1>💋 Kiss them!</h1>
          <p>Upload a photo and let AI add cute kisses to it!</p>
          <div id="google-sign-in"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>💋 Kiss them!</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={() => window.location.reload()}>Sign Out</button>
        </div>
      </header>
      
      <main className="main">
        <div className="upload-section">
          <h2>Upload Your Photo</h2>
          <p>Choose a photo and let our AI add cute kisses to it!</p>
          {/* TODO: Add image upload component */}
        </div>
        
        <div className="gallery-section">
          <h2>Your Gallery</h2>
          <p>View all your kissed photos here!</p>
          {/* TODO: Add gallery component */}
        </div>
      </main>
    </div>
  );
}

export default App;
