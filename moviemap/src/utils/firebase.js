// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// Replace with your actual Firebase config from the Firebase console
// Project settings -> General -> Your apps -> Firebase SDK snippet -> Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with fallback for missing config
let app;
let auth;

try {
  // Check if required config is present
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase API key missing. Using fallback auth for development.');
    // Create fallback Firebase implementation
    app = {};
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        callback(null);
        return () => {}; // Return unsubscribe function
      }
    };
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback for error cases
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {}; // Return unsubscribe function
    }
  };
}

// Authentication functions
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get the ID token
    const token = await user.getIdToken();
    
    // Return user and token
    return {
      user,
      token
    };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get current auth state
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get ID token
export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user && typeof user.getIdToken === 'function') {
      return user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error in getIdToken:', error);
    return null;
  }
};

export { auth };