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
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { formatRupiah } from '../../utils/formatRupiah';
import { formatDateIndo, formatDateFull } from '../../utils/dateHelper';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

export const BookingDetailScreen = ({ route, navigation }) => {
  const initialBooking = route.params?.booking;
  const { user } = useAuth();

  const [booking, setBooking] = useState(initialBooking);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Data pesanan tidak ditemukan.</Text>
          <Button title="Kembali" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const updated = await bookingService.cancelBooking(booking.id, user.uid);
      setBooking(updated);
      setShowCancelDialog(false);
      if (Platform.OS !== 'web') {
        Alert.alert('Berhasil', 'Pesanan Anda telah berhasil dibatalkan.');
      }
    } catch (err) {
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal Membatalkan', err.message || 'Terjadi kesalahan.');
      }
    } finally {
      setCancelling(false);
    }
  };

  const isPending = booking.status === 'pending';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Rincian Reservasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Status */}
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.bookingCodeLabel}>Kode Reservasi</Text>
            <Text style={styles.bookingCode}>#{booking.id?.toUpperCase()}</Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        {/* Properti Info */}
        <View style={styles.propertyCard}>
          <Image
            source={{
              uri:
                booking.propertyImage ||
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
            }}
            style={styles.propImg}
            resizeMode="cover"
          />
          <View style={styles.propInfo}>
            <Text style={styles.propName}>{booking.propertyName}</Text>
            <Text style={styles.bookedAt}>
              Dipesan pada {formatDateFull(booking.createdAt)}
            </Text>
          </View>
        </View>

        {/* Jadwal Check-in & Check-out */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jadwal Menginap</Text>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCol}>
              <Text style={styles.schedLabel}>Check-in</Text>
              <Text style={styles.schedDate}>{formatDateIndo(booking.checkIn, true)}</Text>
              <Text style={styles.schedTime}>Mulai 14:00 WIB</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
            <View style={styles.scheduleCol}>
              <Text style={styles.schedLabel}>Check-out</Text>
              <Text style={styles.schedDate}>{formatDateIndo(booking.checkOut, true)}</Text>
              <Text style={styles.schedTime}>Sebelum 12:00 WIB</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Durasi Menginap</Text>
            <Text style={styles.detailValue}>{booking.nights} Malam</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jumlah Tamu</Text>
            <Text style={styles.detailValue}>{booking.guests || 1} Tamu</Text>
          </View>
          {!!booking.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Catatan Tamu:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>

        {/* Data Pemesan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pemesan</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nama Tamu</Text>
            <Text style={styles.detailValue}>{booking.userName || '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nomor Telepon / WhatsApp</Text>
            <Text style={styles.detailValue}>{booking.userPhone || '-'}</Text>
          </View>
        </View>

        {/* Rincian Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Pembayaran</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total yang Dibayarkan</Text>
            <Text style={styles.totalAmount}>{formatRupiah(booking.totalPrice)}</Text>
          </View>
          <Text style={styles.taxNote}>* Termasuk seluruh pajak dan biaya layanan.</Text>
        </View>

        {/* Panduan & Bantuan */}
        <View style={styles.helpBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.helpText}>
            Perlihatkan kode reservasi ini saat Anda tiba di lokasi hunian untuk kemudahan proses check-in.
          </Text>
        </View>

        {/* Tombol Batalkan (Jika Status Pending) */}
        {isPending && (
          <Button
            title="Batalkan Pesanan Ini"
            variant="danger"
            size="md"
            onPress={() => setShowCancelDialog(true)}
            style={styles.cancelActionBtn}
          />
        )}
      </ScrollView>

      {/* Dialog Konfirmasi Batal */}
      <ConfirmDialog
        visible={showCancelDialog}
        title="Konfirmasi Pembatalan"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Tanggal yang sudah dipesan akan kembali tersedia untuk umum."
        confirmTitle="Ya, Batalkan"
        cancelTitle="Kembali"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
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
  topTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  bookingCodeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookingCode: {
    ...typography.h3,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  propImg: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
  },
  propInfo: {
    flex: 1,
  },
  propName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  bookedAt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleCol: {
    flex: 1,
  },
  schedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  schedDate: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  schedTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
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
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  taxNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  helpText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  cancelActionBtn: {
    marginBottom: spacing.lg,
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

export default BookingDetailScreen;
