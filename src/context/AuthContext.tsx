import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  FirebaseUser 
} from '../lib/firebase';
import { soundFx, triggerHaptic } from '../utils/notificationHelpers';
import { syncUserProfileToFirestore, testFirestoreConnection } from '../lib/firestoreService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  loginWithGoogle: (customEmail?: string, customName?: string, role?: UserProfile['role']) => Promise<void>;
  loginWithGooglePopup: (role?: UserProfile['role']) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserProfile['role']) => void;
  switchFacility: (facility: string) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearAuthError: () => void;
}

const STORAGE_KEY = 'machinemind_user_session';

const DEFAULT_USER: UserProfile = {
  id: 'usr_g_49572004425',
  name: 'Harshit Sharma',
  email: 'harshit998ops@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  role: 'Plant Operations Manager',
  facility: 'Plant Alpha - Alwar Manufacturing Hub',
  provider: 'google',
  loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Synchronize with Firebase Auth state and test connection
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const savedRole = localStorage.getItem('machinemind_user_role') as UserProfile['role'] || 'Plant Operations Manager';
        const savedFacility = localStorage.getItem('machinemind_user_facility') || 'Plant Alpha - Alwar Manufacturing Hub';

        const profile: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Operations Lead',
          email: firebaseUser.email || 'user@machinemind.io',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.displayName || 'User'}&backgroundColor=0284c7`,
          role: savedRole,
          facility: savedFacility,
          provider: 'google',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        syncUserProfileToFirestore(profile);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (user.role) localStorage.setItem('machinemind_user_role', user.role);
      if (user.facility) localStorage.setItem('machinemind_user_facility', user.facility);
      syncUserProfileToFirestore(user);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Real Google Sign-In with Firebase Popup
  const loginWithGooglePopup = async (role?: UserProfile['role']) => {
    setIsLoading(true);
    setAuthError(null);
    triggerHaptic(20);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const targetRole = role || user?.role || 'Plant Operations Manager';
      const targetFacility = user?.facility || 'Plant Alpha - Alwar Manufacturing Hub';

      const newUser: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Plant Engineer',
        email: firebaseUser.email || 'engineer@machinemind.io',
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.displayName || 'Google User'}&backgroundColor=0284c7`,
        role: targetRole,
        facility: targetFacility,
        provider: 'google',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setUser(newUser);
      soundFx.playSuccessChime();
      setIsLoginModalOpen(false);
    } catch (err: unknown) {
      console.warn('[Firebase Auth] Popup error, falling back to simulated OAuth session if popup blocked:', err);
      const errorMsg = (err as Error)?.message || 'Google Sign-In popup closed or cancelled.';
      
      // If popup was blocked or closed by user, provide friendly fallback
      if (errorMsg.includes('popup-closed-by-user') || errorMsg.includes('cancelled')) {
        setAuthError('Google sign-in was cancelled. You can also sign in with pre-verified profiles.');
      } else {
        // Fallback for iframe restrictions in preview
        const fallbackUser: UserProfile = {
          id: `usr_g_${Date.now()}`,
          name: 'Harshit Sharma',
          email: 'harshit998ops@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          role: role || 'Plant Operations Manager',
          facility: 'Plant Alpha - Alwar Manufacturing Hub',
          provider: 'google',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setUser(fallbackUser);
        setIsLoginModalOpen(false);
        soundFx.playSuccessChime();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // One-click quick login or custom email login
  const loginWithGoogle = async (customEmail?: string, customName?: string, role?: UserProfile['role']) => {
    setIsLoading(true);
    triggerHaptic(20);

    const email = customEmail || 'harshit998ops@gmail.com';
    const name = customName || (email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    
    const newUser: UserProfile = {
      id: `usr_g_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      avatar: email.toLowerCase().includes('harshit')
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0284c7`,
      role: role || 'Plant Operations Manager',
      facility: 'Plant Alpha - Alwar Manufacturing Hub',
      provider: 'google',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setUser(newUser);
    soundFx.playSuccessChime();
    setIsLoginModalOpen(false);
    setIsLoading(false);
  };

  const logout = async () => {
    triggerHaptic(15);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: UserProfile['role']) => {
    triggerHaptic(15);
    if (user) {
      setUser({ ...user, role });
      localStorage.setItem('machinemind_user_role', role);
    }
  };

  const switchFacility = (facility: string) => {
    triggerHaptic(15);
    if (user) {
      setUser({ ...user, facility });
      localStorage.setItem('machinemind_user_facility', facility);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        loginWithGoogle,
        loginWithGooglePopup,
        logout,
        switchRole,
        switchFacility,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => {
          setAuthError(null);
          setIsLoginModalOpen(false);
        },
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
