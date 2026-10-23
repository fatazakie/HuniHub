import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { seedInitialPropertiesIfEmpty } from '../../utils/seedData';

const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: 'grid-outline' },
  { id: 'villa', label: 'Villa', icon: 'leaf-outline' },
  { id: 'apartemen', label: 'Apartemen', icon: 'business-outline' },
  { id: 'kamar', label: 'Kamar', icon: 'bed-outline' },
  { id: 'kos', label: 'Kos', icon: 'home-outline' },
];

export const HomeScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    properties,
    loading,
    refreshing,
    error,
    refresh,
    updateFilters,
  } = useProperties({ availableOnly: true });

  const { isFav, toggleFav } = useFavorites();

  // Jalankan auto-seed properti awal jika database masih kosong
  useEffect(() => {
    const initData = async () => {
      const seeded = await seedInitialPropertiesIfEmpty();
      if (seeded) {
        refresh();
      }
    };
    initData();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    updateFilters({ type: categoryId });
  };

  const handleSearchSubmit = () => {
    navigation.navigate('Eksplorasi', { search: searchQuery });
  };

  // Rekomendasi (rating >= 4.8) & Populer
  const recommendedProperties = properties.filter((p) => (p.rating || 0) >= 4.8);
  const displayProperties = properties;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header & Greeting */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>
              Halo, {userProfile?.name?.split(' ')[0] || 'Tamu'} 👋
            </Text>
            <Text style={styles.headerSubtitle}>
              Mau menginap di mana hari ini?
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profil')}
            style={styles.avatarBtn}
          >
            <Ionicons name="person-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Cari villa di Bali, hotel Jogja, dll..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Promo Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>Promo Spesial</Text>
            </View>
            <Text style={styles.bannerTitle}>Liburan Hemat Bersama HuniHub</Text>
            <Text style={styles.bannerDesc}>
              Dapatkan diskon hingga 25% untuk reservasi villa & apartemen pilihan.
            </Text>
          </View>
          <Ionicons
            name="airplane"
            size={70}
            color="rgba(255, 255, 255, 0.18)"
            style={styles.bannerIcon}
          />
        </View>

        {/* Kategori Horizontal Pills */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => handleCategorySelect(cat.id)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isSelected ? colors.surface : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.skeletonContainer}>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <ErrorState
            title="Gagal Memuat Hunian"
            message={error}
            onRetry={refresh}
          />
        )}

        {/* Data Loaded */}
        {!loading && !error && (
          <>
            {/* Rekomendasi Pilihan (Horizontal Slider) */}
            {recommendedProperties.length > 0 && selectedCategory === 'semua' && (
              <View style={styles.sectionWrapper}>
                <SectionHeader
                  title="Rekomendasi Terbaik"
                  subtitle="Hunian dengan ulasan & rating tertinggi"
                  actionTitle="Lihat Semua"
                  onAction={() => navigation.navigate('Eksplorasi')}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {recommendedProperties.map((prop) => (
                    <PropertyCard
                      key={`rec-${prop.id}`}
                      property={prop}
                      horizontal
                      isFavorite={isFav(prop.id)}
                      onToggleFavorite={() => toggleFav(prop.id)}
                      onPress={() =>
                        navigation.navigate('PropertyDetail', { property: prop })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Daftar Hunian Populer */}
            <View style={styles.sectionWrapper}>
              <SectionHeader
                title={
                  selectedCategory === 'semua'
                    ? 'Hunian Populer'
                    : `Pilihan ${CATEGORIES.find((c) => c.id === selectedCategory)?.label || ''}`
                }
                subtitle="Tempat menginap siap reservasi"
              />

              {displayProperties.length === 0 ? (
                <EmptyState
                  icon="business-outline"
                  title="Hunian Tidak Ditemukan"
                  message="Belum ada hunian untuk kategori yang Anda pilih."
                  actionTitle="Tampilkan Semua"
                  onAction={() => handleCategorySelect('semua')}
                />
              ) : (
                displayProperties.map((prop) => (
                  <PropertyCard
                    key={`pop-${prop.id}`}
                    property={prop}
                    isFavorite={isFav(prop.id)}
                    onToggleFavorite={() => toggleFav(prop.id)}
                    onPress={() =>
                      navigation.navigate('PropertyDetail', { property: prop })
                    }
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greetingText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarBtn: {
    padding: spacing.xs,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  banner: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerContent: {
    maxWidth: '80%',
  },
  bannerBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  bannerBadgeText: {
    ...typography.captionBold,
    color: colors.surface,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.textLight,
    marginBottom: 4,
  },
  bannerDesc: {
    ...typography.caption,
    color: colors.primaryLight,
    lineHeight: 16,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  categoryLabelActive: {
    color: colors.surface,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionWrapper: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
});

export default HomeScreen;
