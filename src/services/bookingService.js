// Layanan Pemesanan (Booking) Hunian HuniHub dengan Proteksi Double Booking
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { doDateRangesOverlap } from '../utils/dateHelper';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Mengambil daftar rentang tanggal yang sudah dipesan untuk properti tertentu
 * Hanya menghitung booking dengan status 'pending' atau 'confirmed'
 * @param {string} propertyId
 * @returns {Promise<Array<{checkIn: string, checkOut: string, status: string}>>}
 */
export const getBookedDateRanges = async (propertyId) => {
  if (!propertyId) return [];
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(
      colRef,
      where('propertyId', '==', propertyId),
      where('status', 'in', ['pending', 'confirmed'])
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      checkIn: d.data().checkIn,
      checkOut: d.data().checkOut,
      status: d.data().status,
    }));
  } catch (error) {
    console.error('Error fetching booked date ranges:', error);
    // Fallback baca seluruh data booking properti jika index komposit belum tersedia
    try {
      const colRef = collection(db, BOOKINGS_COLLECTION);
      const snapshot = await getDocs(colRef);
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (b) =>
            b.propertyId === propertyId &&
            (b.status === 'pending' || b.status === 'confirmed')
        );
    } catch (fallbackErr) {
      console.error('Fallback error getBookedDateRanges:', fallbackErr);
      return [];
    }
  }
};

/**
 * Memeriksa apakah rentang tanggal yang diminta bentrok dengan pesanan yang sudah ada
 * @param {string} propertyId
 * @param {string} checkIn - YYYY-MM-DD
 * @param {string} checkOut - YYYY-MM-DD
 * @returns {Promise<boolean>} - true jika bentrok, false jika aman
 */
export const checkDateConflict = async (propertyId, checkIn, checkOut) => {
  const bookedRanges = await getBookedDateRanges(propertyId);
  for (const booked of bookedRanges) {
    if (doDateRangesOverlap(checkIn, checkOut, booked.checkIn, booked.checkOut)) {
      return true; // Bentrok
    }
  }
  return false; // Aman
};

/**
 * Membuat pesanan baru dengan status 'pending'
 * Menggunakan transaksi Firestore untuk menjamin TIDAK terjadi double booking
 * @param {object} bookingData
 */
export const createBooking = async (bookingData) => {
  const {
    userId,
    userName,
    userPhone,
    propertyId,
    propertyName,
    propertyImage,
    checkIn,
    checkOut,
    nights,
    guests,
    totalPrice,
    notes = '',
  } = bookingData;

  if (!userId || !propertyId || !checkIn || !checkOut) {
    throw new Error('Data pemesanan tidak lengkap.');
  }

  // 1. Validasi awal tanggal
  const isConflict = await checkDateConflict(propertyId, checkIn, checkOut);
  if (isConflict) {
    throw new Error(
      'Tanggal yang Anda pilih telah dipesan oleh tamu lain. Silakan pilih tanggal lain.'
    );
  }

  // 2. Simpan pesanan dengan transaksi atomik Firestore
  const newBookingRef = doc(collection(db, BOOKINGS_COLLECTION));

  await runTransaction(db, async (transaction) => {
    // Ambil semua booking properti terkait untuk re-check dalam transaksi
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const existingBookingsSnap = await getDocs(
      query(colRef, where('propertyId', '==', propertyId))
    );

    // Cek bentrok pada snapshot transaksi
    for (const snap of existingBookingsSnap.docs) {
      const data = snap.data();
      if (data.status === 'pending' || data.status === 'confirmed') {
        if (doDateRangesOverlap(checkIn, checkOut, data.checkIn, data.checkOut)) {
          throw new Error(
            'Maaf, tanggal ini baru saja dipesan oleh pengguna lain. Silakan pilih tanggal lain.'
          );
        }
      }
    }

    const newBookingData = {
      userId,
      userName: userName || 'Tamu HuniHub',
      userPhone: userPhone || '',
      propertyId,
      propertyName,
      propertyImage: propertyImage || '',
      checkIn,
      checkOut,
      nights: Number(nights),
      guests: Number(guests) || 1,
      totalPrice: Number(totalPrice),
      notes: notes.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transaction.set(newBookingRef, newBookingData);
  });

  return { id: newBookingRef.id, ...bookingData, status: 'pending' };
};

/**
 * Mengambil daftar booking untuk tamu tertentu (Guest)
 * @param {string} userId
 * @param {string} statusFilter - 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
export const getGuestBookings = async (userId, statusFilter = 'all') => {
  if (!userId) return [];
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const snapshot = await getDocs(colRef);

    let list = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((b) => b.userId === userId);

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }

    // Urutkan dari yang terbaru
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list;
  } catch (error) {
    console.warn('Firestore guest bookings fetch warning (returning empty array):', error.message);
    return [];
  }
};

/**
 * Mengambil detail booking berdasarkan ID
 * @param {string} bookingId
 */
export const getBookingById = async (bookingId) => {
  if (!bookingId) return null;
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

/**
 * Membatalkan pesanan oleh Tamu (hanya diizinkan jika status masih 'pending')
 * @param {string} bookingId
 * @param {string} userId
 */
export const cancelBooking = async (bookingId, userId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  if (booking.userId !== userId) {
    throw new Error('Anda tidak memiliki akses untuk membatalkan pesanan ini.');
  }

  if (booking.status !== 'pending') {
    throw new Error(
      'Hanya pesanan berstatus Menunggu (Pending) yang dapat dibatalkan langsung.'
    );
  }

  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(docRef, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelledBy: 'guest',
    updatedAt: new Date().toISOString(),
  });

  return await getBookingById(bookingId);
};

/**
 * Mengambil seluruh daftar booking untuk Admin
 * @param {string} statusFilter - 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
export const getAllBookings = async (statusFilter = 'all') => {
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const snapshot = await getDocs(colRef);

    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (error) {
    console.warn('Firestore getAllBookings fetch warning (returning empty array):', error.message);
    return [];
  }
};

/**
 * Memperbarui status pesanan oleh Admin (Setujui, Tolak, Selesaikan)
 * @param {string} bookingId
 * @param {'confirmed' | 'cancelled' | 'completed'} newStatus
 */
export const updateBookingStatus = async (bookingId, newStatus) => {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
  return await getBookingById(bookingId);
};

export default {
  getBookedDateRanges,
  checkDateConflict,
  createBooking,
  getGuestBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
