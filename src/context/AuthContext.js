import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';
import authService from '../services/authService';

const ONBOARDING_STORAGE_KEY = '@hunihub_seen_onboarding';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  role: 'guest',
  loading: true,
  hasSeenOnboarding: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
  completeOnboarding: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // 1. Cek status Onboarding dari AsyncStorage
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (value === 'true') {
          setHasSeenOnboarding(true);
        }
      } catch (error) {
        console.warn('Gagal membaca status onboarding:', error);
      }
    };
    checkOnboardingStatus();
  }, []);

  // 2. Tandai Onboarding telah selesai dan simpan ke AsyncStorage
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.warn('Gagal menyimpan status onboarding:', error);
    }
  };

  // 3. Listener sesi autentikasi Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Ambil dokumen user di Firestore untuk role dan detail profil
          try {
            const profile = await authService.getUserProfile(firebaseUser.uid);
            if (profile) {
              setUserProfile(profile);
              setRole(profile.role || 'guest');
            } else {
              // Jika dokumen belum ada, gunakan role default 'guest'
              setUserProfile({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Tamu',
                email: firebaseUser.email,
                role: 'guest',
              });
              setRole('guest');
            }
          } catch (profileError) {
            console.warn('Gagal mengambil profil Firestore:', profileError);
            setRole('guest');
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setRole('guest');
        }
      } catch (err) {
        console.error('Error onAuthStateChanged:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 4. Fungsi-fungsi aksi Auth
  const handleLogin = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    if (res.profile) {
      setUserProfile(res.profile);
      setRole(res.profile.role || 'guest');
    }
    return res;
  };

  const handleRegister = async (data) => {
    const res = await authService.register(data);
    setUser(res.user);
    setUserProfile(res.profile);
    setRole('guest');
    return res;
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
    setRole('guest');
  };

  const handleResetPassword = async (email) => {
    await authService.resetPassword(email);
  };

  const handleUpdateProfile = async (updates) => {
    if (!user) return null;
    const updatedProfile = await authService.updateUserProfile(user.uid, updates);
    setUserProfile(updatedProfile);
    return updatedProfile;
  };

  const refreshProfile = async () => {
    if (!user) return null;
    const profile = await authService.getUserProfile(user.uid);
    if (profile) {
      setUserProfile(profile);
      setRole(profile.role || 'guest');
    }
    return profile;
  };

  // Login demo instan (berguna untuk preview/testing jika Firebase Auth belum diaktifkan di console)
  const loginAsDemo = (demoRole = 'guest') => {
    const isAdm = demoRole === 'admin';
    const mockUser = {
      uid: isAdm ? 'demo-admin-uid' : 'demo-guest-uid',
      email: isAdm ? 'admin@hunihub.id' : 'tamu@hunihub.id',
      displayName: isAdm ? 'Administrator HuniHub' : 'Tamu Demo HuniHub',
    };
    const mockProfile = {
      uid: mockUser.uid,
      name: mockUser.displayName,
      email: mockUser.email,
      phone: isAdm ? '081122334455' : '081234567890',
      role: isAdm ? 'admin' : 'guest',
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    setUserProfile(mockProfile);
    setRole(isAdm ? 'admin' : 'guest');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        loading,
        hasSeenOnboarding,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        resetPassword: handleResetPassword,
        updateProfile: handleUpdateProfile,
        refreshProfile,
        completeOnboarding,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
