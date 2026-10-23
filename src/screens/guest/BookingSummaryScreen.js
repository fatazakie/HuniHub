import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { formatRupiah } from '../../utils/formatRupiah';
import { formatDateIndo } from '../../utils/dateHelper';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

export const BookingSummaryScreen = ({ route, navigation }) => {
  const { property, bookingDraft } = route.params || {};
  const { user, userProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!bookingDraft || !property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Data pesanan tidak ditemukan.</Text>
          <Button title="Kembali" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const {
    propertyName,
    propertyImage,
    checkIn,
    checkOut,
    nights,
    guests,
    pricePerNight,
    totalPrice,
    notes,
  } = bookingDraft;

  const handleConfirmBooking = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const payload = {
        userId: user?.uid,
        userName: userProfile?.name || user?.displayName || 'Tamu HuniHub',
        userPhone: userProfile?.phone || '',
        userEmail: user?.email || '',
        propertyId: property.id,
        propertyName: property.name,
        propertyImage: propertyImage || property.images?.[0] || '',
        checkIn,
        checkOut,
        nights,
        guests,
        totalPrice,
        notes,
      };

      const newBooking = await bookingService.createBooking(payload);

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Pesanan Berhasil Dibuat!',
          'Pesanan Anda sedang menunggu konfirmasi admin. Anda dapat memantau statusnya di menu Pesanan.',
          [
            {
              text: 'Lihat Pesanan',
              onPress: () => {
                navigation.navigate('GuestTabs', { screen: 'Pesanan' });
              },
            },
          ]
        );
      } else {
        navigation.navigate('GuestTabs', { screen: 'Pesanan' });
      }
    } catch (err) {
      console.error('Error in handleConfirmBooking:', err);
      const friendlyErr =
        err.message || 'Terjadi kendala saat memproses pesanan Anda. Silakan coba lagi.';
      setErrorMessage(friendlyErr);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal Membuat Pesanan', friendlyErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Ringkasan Pemesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Error Alert */}
        {!!errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* Card Hunian */}
        <View style={styles.propertyCard}>
          <Image
            source={{
              uri:
                propertyImage ||
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600',
            }}
            style={styles.propertyImg}
            resizeMode="cover"
          />
          <View style={styles.propertyDetails}>
            <Text style={styles.propType}>{property.type?.toUpperCase()}</Text>
            <Text style={styles.propName} numberOfLines={2}>
              {propertyName}
            </Text>
            <Text style={styles.propCity}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />{' '}
              {property.city}
            </Text>
          </View>
        </View>

        {/* Card Waktu & Tamu */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Informasi Menginap</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Tanggal Check-in</Text>
              <Text style={styles.val}>{formatDateIndo(checkIn, true)}</Text>
              <Text style={styles.subVal}>Mulai jam 14:00 WIB</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Tanggal Check-out</Text>
              <Text style={styles.val}>{formatDateIndo(checkOut, true)}</Text>
              <Text style={styles.subVal}>Sebelum jam 12:00 WIB</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Durasi Menginap</Text>
            <Text style={styles.itemValue}>{nights} Malam</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Jumlah Tamu</Text>
            <Text style={styles.itemValue}>{guests} Orang</Text>
          </View>
        </View>

        {/* Data Pemesan */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Data Pemesan</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Nama Lengkap</Text>
            <Text style={styles.itemValue}>{userProfile?.name || 'Tamu'}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Alamat Email</Text>
            <Text style={styles.itemValue}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Nomor WhatsApp</Text>
            <Text style={styles.itemValue}>{userProfile?.phone || 'Belum diisi'}</Text>
          </View>
          {!!notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Catatan Tamu:</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {/* Rincian Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Rincian Pembayaran</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              {formatRupiah(pricePerNight)} × {nights} malam
            </Text>
            <Text style={styles.itemValue}>{formatRupiah(totalPrice)}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Biaya Layanan & Pajak</Text>
            <Text style={[styles.itemValue, { color: colors.success }]}>Gratis</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalAmount}>{formatRupiah(totalPrice)}</Text>
          </View>

          <View style={styles.statusInfoRow}>
            <Text style={styles.statusInfoLabel}>Status Awal:</Text>
            <StatusBadge status="pending" size="sm" />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar Konfirmasi */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Biaya</Text>
          <Text style={styles.bottomPrice}>{formatRupiah(totalPrice)}</Text>
        </View>

        <Button
          title="Konfirmasi Pesanan"
          variant="accent"
          size="md"
          loading={loading}
          fullWidth={false}
          onPress={handleConfirmBooking}
          style={styles.confirmBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  propertyImg: {
    width: 100,
    height: 100,
  },
  propertyDetails: {
    flex: 1,
    padding: spacing.sm + 2,
    justifyContent: 'center',
  },
  propType: {
    ...typography.captionBold,
    color: colors.accent,
    fontSize: 10,
  },
  propName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  propCity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardHeader: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  val: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  subVal: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  itemValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  notesBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  notesLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  notesText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusInfoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
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
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomPrice: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  confirmBtn: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
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

export default BookingSummaryScreen;
