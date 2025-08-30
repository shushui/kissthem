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

export const initializeGoogleAuth = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google API not loaded'));
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            localStorage.setItem('googleToken', response.credential);
            window.location.reload();
          }
        },
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
    });
  }
};

export const signOut = (): void => {
  localStorage.removeItem('googleToken');
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
