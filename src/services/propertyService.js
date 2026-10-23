import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_PROPERTIES } from '../utils/seedData';

const PROPERTIES_COLLECTION = 'properties';

/**
 * Mengambil semua properti hunian dengan opsi filter dan sorting
 * @param {object} options
 * @param {string} options.search - kata kunci pencarian nama atau kota
 * @param {string} options.type - filter tipe hunian ('semua' | 'kamar' | 'kos' | 'villa' | 'apartemen')
 * @param {string} options.city - filter kota
 * @param {number} options.minPrice
 * @param {number} options.maxPrice
 * @param {Array<string>} options.facilities - filter fasilitas
 * @param {string} options.sortBy - 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'
 */
export const getProperties = async (options = {}) => {
  const {
    search = '',
    type = 'semua',
    city = 'semua',
    minPrice = 0,
    maxPrice = Infinity,
    facilities = [],
    sortBy = 'newest',
    availableOnly = false,
  } = options;

  let rawList = [];
  try {
    const colRef = collection(db, PROPERTIES_COLLECTION);
    const snapshot = await getDocs(colRef);
    rawList = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.warn('Firestore getProperties fetch warning (fallback to INITIAL_PROPERTIES):', error.message);
  }

  // Jika Firestore masih kosong atau offline/belum diaktifkan, gunakan initial demo properties
  if (rawList.length === 0) {
    rawList = [...INITIAL_PROPERTIES];
  }

  let list = [...rawList];

  // Filter Ketersediaan
  if (availableOnly) {
    list = list.filter((item) => item.isAvailable !== false);
  }

  // Filter Tipe Hunian
  if (type && type !== 'semua') {
    list = list.filter(
      (item) => item.type?.toLowerCase() === type.toLowerCase()
    );
  }

  // Filter Kota
  if (city && city !== 'semua') {
    list = list.filter(
      (item) => item.city?.toLowerCase() === city.toLowerCase()
    );
  }

  // Filter Rentang Harga
  if (minPrice > 0) {
    list = list.filter((item) => Number(item.pricePerNight) >= minPrice);
  }
  if (maxPrice < Infinity && maxPrice > 0) {
    list = list.filter((item) => Number(item.pricePerNight) <= maxPrice);
  }

  // Filter Fasilitas (wajib memiliki semua fasilitas yang dipilih)
  if (facilities && facilities.length > 0) {
    list = list.filter((item) => {
      const itemFacs = item.facilities || [];
      return facilities.every((f) => itemFacs.includes(f));
    });
  }

  // Filter Kata Kunci Pencarian (Nama, Kota, Alamat)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q)
    );
  }

  // Pengurutan (Sorting)
  switch (sortBy) {
    case 'price_asc':
      list.sort((a, b) => Number(a.pricePerNight) - Number(b.pricePerNight));
      break;
    case 'price_desc':
      list.sort((a, b) => Number(b.pricePerNight) - Number(a.pricePerNight));
      break;
    case 'rating_desc':
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      break;
    case 'newest':
    default:
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
  }

  return list;
};

/**
 * Mengambil detail hunian berdasarkan ID dokumen
 * @param {string} id
 */
export const getPropertyById = async (id) => {
  if (!id) return null;
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.warn('Firestore getPropertyById warning (fallback to INITIAL_PROPERTIES):', error.message);
  }

  const fallback = INITIAL_PROPERTIES.find((p) => p.id === id);
  return fallback || null;
};

/**
 * Mengambil hunian rekomendasi untuk beranda (berdasarkan rating tinggi)
 */
export const getFeaturedProperties = async (limitCount = 5) => {
  try {
    const all = await getProperties({ availableOnly: true });
    // Urutkan berdasarkan rating tertinggi
    const sorted = all.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted.slice(0, limitCount);
  } catch (error) {
    console.error('Error in getFeaturedProperties:', error);
    return [];
  }
};

/**
 * Mengambil hunian populer untuk beranda
 */
export const getPopularProperties = async (limitCount = 6) => {
  try {
    const all = await getProperties({ availableOnly: true });
    // Mengambil properti yang tersedia
    return all.slice(0, limitCount);
  } catch (error) {
    console.error('Error in getPopularProperties:', error);
    return [];
  }
};

/**
 * Menambahkan properti hunian baru (Admin)
 */
export const createProperty = async (propertyData) => {
  const payload = {
    ...propertyData,
    pricePerNight: Number(propertyData.pricePerNight),
    rating: Number(propertyData.rating) || 4.8,
    isAvailable: propertyData.isAvailable !== false,
    facilities: propertyData.facilities || [],
    images: propertyData.images || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), payload);
  return { id: docRef.id, ...payload };
};

/**
 * Memperbarui data properti hunian (Admin)
 */
export const updateProperty = async (id, updates) => {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (payload.pricePerNight) {
    payload.pricePerNight = Number(payload.pricePerNight);
  }

  await updateDoc(docRef, payload);
  return await getPropertyById(id);
};

/**
 * Mengubah status ketersediaan properti (toggle)
 */
export const togglePropertyAvailability = async (id, currentStatus) => {
  return await updateProperty(id, { isAvailable: !currentStatus });
};

/**
 * Menghapus properti hunian (Admin)
 */
export const deleteProperty = async (id) => {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  await deleteDoc(docRef);
  return true;
};

export default {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  getPopularProperties,
  createProperty,
  updateProperty,
  togglePropertyAvailability,
  deleteProperty,
};
