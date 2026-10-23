import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatRupiah } from '../utils/formatRupiah';

const TYPE_LABELS = {
  kamar: 'Kamar',
  kos: 'Kos',
  villa: 'Villa',
  apartemen: 'Apartemen',
};

/**
 * Komponen PropertyCard HuniHub
 * Menampilkan foto besar, badge tipe hunian, tombol favorit, rating, lokasi, dan harga tebal
 */
export const PropertyCard = ({
  property,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  horizontal = false,
  style,
}) => {
  if (!property) return null;

  const {
    name,
    type,
    city,
    address,
    pricePerNight,
    rating = 4.5,
    images = [],
    isAvailable = true,
  } = property;

  const imageUrl = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const typeLabel = TYPE_LABELS[type?.toLowerCase()] || type || 'Hunian';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        horizontal ? styles.cardHorizontal : styles.cardVertical,
        style,
      ]}
    >
      {/* Container Gambar */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={horizontal ? styles.imageHorizontal : styles.imageVertical}
          resizeMode="cover"
        />

        {/* Badge Tipe Hunian */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{typeLabel}</Text>
        </View>

        {/* Status Tidak Tersedia (Jika False) */}
        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Penuh</Text>
          </View>
        )}

        {/* Tombol Favorit */}
        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleFavorite}
            style={styles.favoriteBtn}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Konten Info Hunian */}
      <View style={styles.content}>
        {/* Baris Rating & Kota */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {typeof rating === 'number' ? rating.toFixed(1) : '4.8'}
            </Text>
          </View>
          <View style={styles.locationBox}>
            <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {city || address || 'Indonesia'}
            </Text>
          </View>
        </View>

        {/* Nama Hunian */}
        <Text style={styles.name} numberOfLines={horizontal ? 1 : 2}>
          {name}
        </Text>

        {/* Harga per Malam */}
        <View style={styles.priceRow}>
          <Text style={styles.priceBold}>{formatRupiah(pricePerNight)}</Text>
          <Text style={styles.perNight}> / malam</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardVertical: {
    width: '100%',
    marginBottom: spacing.md,
  },
  cardHorizontal: {
    width: 260,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: colors.borderLight,
  },
  imageVertical: {
    width: '100%',
    height: 180,
  },
  imageHorizontal: {
    width: '100%',
    height: 150,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    ...typography.captionBold,
    color: colors.surface,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  unavailableBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: 80,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  unavailableText: {
    ...typography.captionBold,
    color: colors.surface,
    fontSize: 11,
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  ratingText: {
    ...typography.captionBold,
    color: '#92400E',
    marginLeft: 3,
    fontSize: 11,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 2,
    flex: 1,
  },
  name: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  priceBold: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  perNight: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default PropertyCard;
