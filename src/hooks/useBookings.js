import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom Hook untuk mengelola pesanan (guest atau admin)
 * @param {'guest' | 'admin'} mode
 * @param {string} initialStatus - 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
export const useBookings = (mode = 'guest', initialStatus = 'all') => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const fetchBookings = useCallback(async (currentStatus) => {
    try {
      setError(null);
      const activeStatus = currentStatus !== undefined ? currentStatus : statusFilter;
      let data = [];

      if (mode === 'admin') {
        data = await bookingService.getAllBookings(activeStatus);
      } else if (user) {
        data = await bookingService.getGuestBookings(user.uid, activeStatus);
      }

      setBookings(data);
    } catch (err) {
      console.error('useBookings error:', err);
      setError(err.message || 'Gagal memuat daftar pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, user, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    if (!user) return;
    await bookingService.cancelBooking(bookingId, user.uid);
    await refresh();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    await bookingService.updateBookingStatus(bookingId, newStatus);
    await refresh();
  };

  return {
    bookings,
    loading,
    refreshing,
    error,
    statusFilter,
    setStatusFilter,
    refresh,
    cancelBooking: handleCancelBooking,
    updateBookingStatus: handleUpdateStatus,
  };
};

export default useBookings;
