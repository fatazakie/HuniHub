import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { useProperties } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

const CITIES = [
  'semua', 'Bali', 'Jakarta', 'Yogyakarta', 'Bandung', 'Bogor', 'Surabaya', 'Malang', 'Lombok',
];

const TYPES = [
  { id: 'semua', label: 'Semua Tipe' },
  { id: 'villa', label: 'Villa' },
  { id: 'apartemen', label: 'Apartemen' },
  { id: 'kamar', label: 'Kamar Hotel' },
  { id: 'kos', label: 'Kos' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Terbaru' },
  { id: 'rating_desc', label: 'Rating Tertinggi' },
  { id: 'price_asc', label: 'Harga Terendah' },
  { id: 'price_desc', label: 'Harga Tertinggi' },
];

const FACILITIES_LIST = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'ac', label: 'AC' },
  { id: 'kolam_renang', label: 'Kolam Renang' },
  { id: 'parkir', label: 'Parkir Gratis' },
  { id: 'dapur', label: 'Dapur' },
  { id: 'sarapan', label: 'Sarapan' },
  { id: 'gym', label: 'Pusat Kebugaran' },
  { id: 'tv', label: 'TV Kabel' },
];

export const ExploreScreen = ({ route, navigation }) => {
  const initialSearch = route.params?.search || '';

  const [search, setSearch] = useState(initialSearch);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter States
  const [selectedCity, setSelectedCity] = useState('semua');
  const [selectedType, setSelectedType] = useState('semua');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const {
    properties,
    loading,
    refreshing,
    refresh,
    updateFilters,
  } = useProperties({
    search: initialSearch,
    availableOnly: true,
  });

  const { isFav, toggleFav } = useFavorites();

  // Terapkan filter ke hook
  useEffect(() => {
    updateFilters({
      search,
      city: selectedCity,
      type: selectedType,
      sortBy: selectedSort,
      facilities: selectedFacilities,
    });
  }, [search, selectedCity, selectedType, selectedSort, selectedFacilities]);

  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const resetFilters = () => {
    setSelectedCity('semua');
    setSelectedType('semua');
    setSelectedSort('newest');
    setSelectedFacilities([]);
    setFilterModalVisible(false);
  };

  const hasActiveFilters =
    selectedCity !== 'semua' ||
    selectedType !== 'semua' ||
    selectedSort !== 'newest' ||
    selectedFacilities.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Search & Filter Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Cari hunian, kota, atau alamat..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setFilterModalVisible(true)}
          style={[
            styles.filterBtn,
            hasActiveFilters && styles.filterBtnActive,
          ]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={hasActiveFilters ? colors.surface : colors.primary}
          />
          {hasActiveFilters && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      {/* Quick City Horizontal Pills */}
      <View style={styles.cityRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {CITIES.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <TouchableOpacity
                key={city}
                activeOpacity={0.7}
                onPress={() => setSelectedCity(city)}
                style={[styles.cityChip, isSelected && styles.cityChipActive]}
              >
                <Text style={[styles.cityText, isSelected && styles.cityTextActive]}>
                  {city === 'semua' ? 'Semua Kota' : city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Ditemukan {properties.length} hunian
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetFilterText}>Reset Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Property List */}
      {loading ? (
        <View style={styles.listPadding}>
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Hunian Tidak Ditemukan"
              message="Coba ubah kata kunci pencarian atau sesuaikan opsi filter Anda."
              actionTitle="Reset Semua Filter"
              onAction={resetFilters}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={isFav(item.id)}
              onToggleFavorite={() => toggleFav(item.id)}
              onPress={() =>
                navigation.navigate('PropertyDetail', { property: item })
              }
            />
          )}
        />
      )}

      {/* Modal Filter & Sorting */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Urutkan</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Urutkan Berdasarkan */}
              <Text style={styles.filterGroupTitle}>Urutkan Berdasarkan</Text>
              <View style={styles.chipsWrapper}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSelectedSort(opt.id)}
                    style={[
                      styles.filterChip,
                      selectedSort === opt.id && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedSort === opt.id && styles.filterChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tipe Hunian */}
              <Text style={styles.filterGroupTitle}>Tipe Hunian</Text>
              <View style={styles.chipsWrapper}>
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedType(t.id)}
                    style={[
                      styles.filterChip,
                      selectedType === t.id && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedType === t.id && styles.filterChipTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fasilitas */}
              <Text style={styles.filterGroupTitle}>Fasilitas Hunian</Text>
              <View style={styles.chipsWrapper}>
                {FACILITIES_LIST.map((fac) => {
                  const isChecked = selectedFacilities.includes(fac.id);
                  return (
                    <TouchableOpacity
                      key={fac.id}
                      onPress={() => toggleFacility(fac.id)}
                      style={[
                        styles.filterChip,
                        isChecked && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name={isChecked ? 'checkmark-circle' : 'add-outline'}
                        size={14}
                        color={isChecked ? colors.surface : colors.textPrimary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          isChecked && styles.filterChipTextActive,
                        ]}
                      >
                        {fac.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Bottom Buttons */}
            <View style={styles.modalBottomBar}>
              <Button
                title="Reset"
                variant="outline"
                size="md"
                onPress={resetFilters}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                title="Terapkan Filter"
                variant="primary"
                size="md"
                onPress={() => setFilterModalVisible(false)}
                fullWidth={false}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  cityRow: {
    paddingVertical: spacing.sm,
  },
  cityScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cityText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  cityTextActive: {
    color: colors.primary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultsCount: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  resetFilterText: {
    ...typography.captionBold,
    color: colors.accent,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  listPadding: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  filterGroupTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  modalBottomBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

export default ExploreScreen;
