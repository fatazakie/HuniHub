import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { ImageCarousel } from '../../components/ImageCarousel';
import { Button } from '../../components/Button';
import { formatRupiah } from '../../utils/formatRupiah';
import { useFavorites } from '../../hooks/useFavorites';

const FACILITY_ICONS = {
  wifi: { label: 'WiFi Cepat', icon: 'wifi-outline' },
  ac: { label: 'Pendingin AC', icon: 'snow-outline' },
  kolam_renang: { label: 'Kolam Renang', icon: 'water-outline' },
  parkir: { label: 'Parkir Gratis', icon: 'car-outline' },
  dapur: { label: 'Dapur Lengkap', icon: 'restaurant-outline' },
  sarapan: { label: 'Sarapan Gratis', icon: 'cafe-outline' },
  gym: { label: 'Fitness Center', icon: 'barbell-outline' },
  tv: { label: 'Smart TV', icon: 'tv-outline' },
  lift: { label: 'Akses Lift', icon: 'arrow-up-circle-outline' },
  mesin_cuci: { label: 'Mesin Cuci', icon: 'shirt-outline' },
  bbq: { label: 'Area Barbekyu', icon: 'flame-outline' },
};

export const PropertyDetailScreen = ({ route, navigation }) => {
  const property = route.params?.property;
  const { isFav, toggleFav } = useFavorites();

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Data hunian tidak ditemukan.</Text>
          <Button
            title="Kembali"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const {
    id,
    name,
    type,
    city,
    address,
    pricePerNight,
    rating = 4.8,
    description,
    facilities = [],
    images = [],
    isAvailable = true,
  } = property;

  const isFavorite = isFav(id);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Galeri Gambar Swipe */}
        <View style={styles.carouselContainer}>
          <ImageCarousel images={images} height={320} />

          {/* Floating Header Buttons (Back & Favorite) */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.floatingBtn}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleFav(id)}
              style={styles.floatingBtn}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.accent : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Badge Tipe & Rating */}
          <View style={styles.topMeta}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {type?.toUpperCase() || 'HUNIAN'}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {typeof rating === 'number' ? rating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.ratingCount}>(Ulasan Terverifikasi)</Text>
            </View>
          </View>

          {/* Nama Hunian */}
          <Text style={styles.title}>{name}</Text>

          {/* Lokasi */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={colors.accent} />
            <Text style={styles.locationText}>{address}, {city}</Text>
          </View>

          {/* Status Ketersediaan */}
          {!isAvailable && (
            <View style={styles.unavailableAlert}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.unavailableAlertText}>
                Hunian ini sedang tidak menerima pemesanan baru.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Deskripsi */}
          <Text style={styles.sectionTitle}>Deskripsi Hunian</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.divider} />

          {/* Fasilitas Berikon */}
          <Text style={styles.sectionTitle}>Fasilitas Populer</Text>
          <View style={styles.facilitiesGrid}>
            {facilities.map((facKey) => {
              const facInfo = FACILITY_ICONS[facKey] || {
                label: facKey,
                icon: 'checkmark-circle-outline',
              };
              return (
                <View key={facKey} style={styles.facilityItem}>
                  <View style={styles.facilityIconCircle}>
                    <Ionicons
                      name={facInfo.icon}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.facilityLabel}>{facInfo.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Kebijakan Menginap */}
          <Text style={styles.sectionTitle}>Ketentuan & Kebijakan</Text>
          <View style={styles.policyBox}>
            <View style={styles.policyRow}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.policyText}>Check-in: 14:00 WIB | Check-out: 12:00 WIB</Text>
            </View>
            <View style={styles.policyRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
              <Text style={styles.policyText}>Pembatalan fleksibel saat status reservasi masih Menunggu (Pending).</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Harga Mulai Dari</Text>
          <View style={styles.priceRow}>
            <Text style={styles.bottomPrice}>{formatRupiah(pricePerNight)}</Text>
            <Text style={styles.perNight}> / malam</Text>
          </View>
        </View>

        <Button
          title={isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
          variant={isAvailable ? 'accent' : 'secondary'}
          size="md"
          disabled={!isAvailable}
          fullWidth={false}
          onPress={() => navigation.navigate('BookingForm', { property })}
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselContainer: {
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  body: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -20,
    padding: spacing.lg,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  typeBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  ratingCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  unavailableAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  unavailableAlertText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '46%',
    gap: spacing.sm,
  },
  facilityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    flex: 1,
  },
  policyBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  policyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  perNight: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookBtn: {
    paddingHorizontal: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});

export default PropertyDetailScreen;
