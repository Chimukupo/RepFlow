import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// User profile type extending Firebase User
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  weight?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication context type
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData?: Record<string, unknown>) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email } = user;
      const createdAt = new Date();

      const userProfile: UserProfile = {
        uid: user.uid,
        email: email!,
        displayName: displayName || undefined,
        createdAt,
        updatedAt: createdAt,
        ...additionalData,
      };

      try {
        await setDoc(userRef, userProfile);
        setUserProfile(userProfile);
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    } else {
      // User exists, load their profile
      const profile = userSnap.data() as UserProfile;
      setUserProfile(profile);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, displayName?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    await createUserProfile(user, { displayName });
    return user;
  };

  // Login function
  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  };

  // Logout function
  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    const userRef = doc(db, 'users', currentUser.uid);
    const updatedProfile = {
      ...updates,
      updatedAt: new Date(),
    };

    await setDoc(userRef, updatedProfile, { merge: true });
    
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updatedProfile });
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await createUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 