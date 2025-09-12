// Direct Google OAuth authentication functions

// Sign in with Google
export async function signInWithGoogle() {
  // Always use Google OAuth for production
  window.location.href = '/api/auth/google';
}

// Sign out function
export async function signOut() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    // Redirect to home page after logout
    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}