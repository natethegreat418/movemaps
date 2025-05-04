import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, getIdToken } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create context
const AuthContext = createContext(null);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Get ID token when user is authenticated
        try {
          const token = await getIdToken();
          setToken(token);
        } catch (error) {
          console.error('Error getting ID token:', error);
        }
      } else {
        setToken(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // API request with auth token
  const authFetch = async (url, options = {}) => {
    // Get a fresh token
    const currentToken = user ? await getIdToken() : token;
    
    // Set up headers with auth token
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Make the request
    return fetch(url, {
      ...options,
      headers
    });
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    authFetch,
    isAuthenticated: !!user,
    isAdmin: !!user && user.email?.endsWith('@admin.com') // Simplified admin check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};