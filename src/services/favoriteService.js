// Layanan Manajemen Hunian Favorit Pengguna HuniHub
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getPropertyById } from './propertyService';

const FAVORITES_COLLECTION = 'favorites';

const getFavoriteDocId = (userId, propertyId) => `${userId}_${propertyId}`;

/**
 * Mengambil daftar ID properti favorit untuk user tertentu
 * @param {string} userId
 * @returns {Promise<Array<string>>}
 */
export const getFavoritePropertyIds = async (userId) => {
  if (!userId) return [];
  try {
    const colRef = collection(db, FAVORITES_COLLECTION);
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().propertyId);
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    return [];
  }
};

/**
 * Mengambil daftar lengkap objek properti favorit
 * @param {string} userId
 */
export const getFavoriteProperties = async (userId) => {
  if (!userId) return [];
  try {
    const ids = await getFavoritePropertyIds(userId);
    if (ids.length === 0) return [];

    const propertyPromises = ids.map((id) => getPropertyById(id));
    const properties = await Promise.all(propertyPromises);

    // Filter jika ada properti yang mungkin sudah dihapus
    return properties.filter((p) => p !== null);
  } catch (error) {
    console.warn('Firestore favorite properties fetch warning (returning empty array):', error.message);
    return [];
  }
};

/**
 * Memeriksa apakah suatu properti ditandai sebagai favorit oleh pengguna
 * @param {string} userId
 * @param {string} propertyId
 */
export const isFavorite = async (userId, propertyId) => {
  if (!userId || !propertyId) return false;
  try {
    const docId = getFavoriteDocId(userId, propertyId);
    const docRef = doc(db, FAVORITES_COLLECTION, docId);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (error) {
    console.error('Error checking isFavorite:', error);
    return false;
  }
};

/**
 * Menambah / menghapus properti dari daftar favorit (toggle)
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<boolean>} status baru (true = favorit, false = bukan favorit)
 */
export const toggleFavorite = async (userId, propertyId) => {
  if (!userId || !propertyId) throw new Error('User ID dan Property ID diperlukan');

  const docId = getFavoriteDocId(userId, propertyId);
  const docRef = doc(db, FAVORITES_COLLECTION, docId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    await deleteDoc(docRef);
    return false; // Dihapus dari favorit
  } else {
    await setDoc(docRef, {
      userId,
      propertyId,
      createdAt: new Date().toISOString(),
    });
    return true; // Ditambahkan ke favorit
  }
};

export default {
  getFavoritePropertyIds,
  getFavoriteProperties,
  isFavorite,
  toggleFavorite,
};
