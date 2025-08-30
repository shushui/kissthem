import { User } from '../types';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

// Wait for Google API to load
const waitForGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Waiting for Google API to load...');
    console.log('Current window.google state:', window.google);
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('Google API loading timeout after 10 seconds');
      reject(new Error('Google API loading timeout'));
    }, 10000);
    
    if (window.google?.accounts?.id) {
      console.log('Google API already loaded!');
      clearTimeout(timeout);
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="accounts.google.com"]');
    if (existingScript) {
      console.log('Google script already exists, waiting for it to load...');
      // Script is loading, wait for it
      const checkGoogle = () => {
        console.log('Checking Google API availability...', window.google);
        if (window.google?.accounts?.id) {
          console.log('Google API became available!');
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
      return;
    }

    console.log('Loading Google API script...');
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google script loaded, waiting for API initialization...');
      // Wait a bit more for the API to be fully initialized
      setTimeout(() => {
        console.log('Checking Google API after timeout...', window.google);
        if (window.google?.accounts?.id) {
          console.log('Google API initialized successfully!');
          clearTimeout(timeout);
          resolve();
        } else {
          console.log('Google API not ready, starting polling...');
          // Fallback: check every 100ms
          const checkGoogle = () => {
            console.log('Polling for Google API...', window.google);
            if (window.google?.accounts?.id) {
              console.log('Google API available during polling!');
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkGoogle, 100);
            }
          };
          checkGoogle();
        }
      }, 500);
    };
    script.onerror = (error) => {
      console.error('Failed to load Google API script:', error);
      clearTimeout(timeout);
      reject(new Error('Failed to load Google API script'));
    };
    document.head.appendChild(script);
  });
};

export const initializeGoogleAuth = (clientId: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Wait for Google API to be available
      await waitForGoogleAPI();
      
      if (!window.google?.accounts?.id) {
        reject(new Error('Google API failed to load after timeout'));
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            localStorage.setItem('googleToken', response.credential);
            window.location.reload();
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const renderGoogleSignInButton = (element: HTMLElement): void => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
    });
  } else {
    // Fallback button if Google API isn't loaded
    element.innerHTML = `
      <button style="
        background: #4285f4;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        font-family: 'Google Sans', Arial, sans-serif;
      " onclick="window.location.reload()">
        🔄 Retry Google Sign-In
      </button>
    `;
  }
};

export const signOut = (): void => {
  localStorage.removeItem('googleToken');
  // Clear any Google session
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
    } catch (e) {
      console.log('Google sign out completed');
    }
  }
  window.location.reload();
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('googleToken');
  if (!token) return null;

  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
