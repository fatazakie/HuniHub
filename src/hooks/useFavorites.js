import { useState, useEffect, useCallback } from 'react';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom Hook untuk mengelola hunian favorit pengguna
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteProperties([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [ids, properties] = await Promise.all([
        favoriteService.getFavoritePropertyIds(user.uid),
        favoriteService.getFavoriteProperties(user.uid),
      ]);
      setFavoriteIds(new Set(ids));
      setFavoriteProperties(properties);
    } catch (err) {
      console.error('useFavorites error:', err);
      setError(err.message || 'Gagal memuat favorit.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
  };

  const isFav = (propertyId) => {
    return favoriteIds.has(propertyId);
  };

  const toggleFav = async (propertyId) => {
    if (!user) return false;

    // Optimistic UI update
    const isCurrentlyFav = favoriteIds.has(propertyId);
    const newIds = new Set(favoriteIds);
    if (isCurrentlyFav) {
      newIds.delete(propertyId);
      setFavoriteProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } else {
      newIds.add(propertyId);
    }
    setFavoriteIds(newIds);

    try {
      const result = await favoriteService.toggleFavorite(user.uid, propertyId);
      // Re-fetch to ensure sync with server
      await fetchFavorites();
      return result;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Rollback
      await fetchFavorites();
      return isCurrentlyFav;
    }
  };

  return {
    favoriteProperties,
    favoriteIds,
    loading,
    refreshing,
    error,
    isFav,
    toggleFav,
    refresh,
  };
};

export default useFavorites;
