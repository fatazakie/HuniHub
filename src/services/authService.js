// Layanan Autentikasi dan Profil Pengguna HuniHub
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Mendaftarkan pengguna baru dengan peran default 'guest'
 * Menyimpan data pengguna ke koleksi users/{uid}
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.password
 */
export const register = async ({ name, email, phone, password }) => {
  // 1. Buat akun di Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  const firebaseUser = userCredential.user;

  // 2. Perbarui nama profil di Firebase Auth
  await updateAuthProfile(firebaseUser, {
    displayName: name.trim(),
  });

  // 3. Simpan dokumen pengguna di Firestore (default role: 'guest')
  const userData = {
    uid: firebaseUser.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  return { user: firebaseUser, profile: userData };
};

/**
 * Masuk dengan email dan kata sandi
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  const firebaseUser = userCredential.user;

  // Ambil data profil dari Firestore
  const profile = await getUserProfile(firebaseUser.uid);

  return { user: firebaseUser, profile };
};

/**
 * Keluar dari sesi akun saat ini
 */
export const logout = async () => {
  await signOut(auth);
};

/**
 * Mengirim email tautan setel ulang kata sandi
 * @param {string} email
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Mengambil data profil pengguna berdasarkan UID
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Memperbarui profil pengguna (nama dan nomor HP)
 * @param {string} uid
 * @param {object} updates
 * @param {string} updates.name
 * @param {string} updates.phone
 */
export const updateUserProfile = async (uid, { name, phone }) => {
  if (!uid) throw new Error('UID pengguna diperlukan');

  const updates = {
    updatedAt: new Date().toISOString(),
  };

  if (name && name.trim()) {
    updates.name = name.trim();
    if (auth.currentUser) {
      await updateAuthProfile(auth.currentUser, {
        displayName: name.trim(),
      });
    }
  }

  if (phone && phone.trim()) {
    updates.phone = phone.trim();
  }

  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, updates);

  return await getUserProfile(uid);
};

/**
 * Memastikan akun demo (admin/guest) tersedia di Firebase Auth & Firestore
 * Jika belum ada, otomatis didaftarkan dan diatur role-nya.
 * @param {'guest' | 'admin'} role
 */
export const ensureDemoAccount = async (role = 'guest') => {
  const isAdm = role === 'admin';
  const email = isAdm ? 'admin@hunihub.id' : 'tamu@hunihub.id';
  const password = isAdm ? 'admin123' : 'tamu123';
  const name = isAdm ? 'Administrator HuniHub' : 'Tamu Demo HuniHub';
  const phone = isAdm ? '081122334455' : '081234567890';

  try {
    return await login(email, password);
  } catch (err) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateAuthProfile(userCred.user, { displayName: name });
      const userData = {
        uid: userCred.user.uid,
        name,
        email,
        phone,
        role: isAdm ? 'admin' : 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userCred.user.uid), userData);
      return { user: userCred.user, profile: userData };
    }
    throw err;
  }
};

export default {
  register,
  login,
  logout,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  ensureDemoAccount,
};
