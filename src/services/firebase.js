import { Platform } from 'react-native';
import {
  initializeApp,
  getApps,
  getApp,
} from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  getAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Membaca konfigurasi dari variabel lingkungan EXPO_PUBLIC_*
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Cek apakah konfigurasi dasar tersedia
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('Placeholder') &&
  firebaseConfig.projectId
);

if (!isFirebaseConfigured) {
  console.warn(
    '[HuniHub Firebase] PERINGATAN: Kredensial Firebase belum dikonfigurasi di berkas .env.\n' +
    'Pastikan EXPO_PUBLIC_FIREBASE_* telah diisi dengan benar dari Firebase Console.'
  );
}

// Inisialisasi Firebase App (singleton)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Inisialisasi Auth dengan persistensi sesuai platform (Web: browser/indexedDB, Native: AsyncStorage)
let auth;
try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e) {
  auth = getAuth(app);
}

// Inisialisasi Firestore Database
const db = getFirestore(app);

// Inisialisasi Firebase Cloud Storage
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
