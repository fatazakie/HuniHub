import { useState, useEffect, useCallback } from 'react';
import propertyService from '../services/propertyService';

/**
 * Custom Hook untuk mengambil dan mengelola daftar hunian
 */
export const useProperties = (initialFilters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProperties = useCallback(async (customFilters) => {
    try {
      setError(null);
      const activeFilters = customFilters !== undefined ? customFilters : filters;
      const data = await propertyService.getProperties(activeFilters);
      setProperties(data);
    } catch (err) {
      console.error('useProperties fetch error:', err);
      setError(err.message || 'Gagal memuat daftar hunian.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchProperties();
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    properties,
    loading,
    refreshing,
    error,
    filters,
    updateFilters,
    refresh,
    reload: fetchProperties,
  };
};

export default useProperties;
