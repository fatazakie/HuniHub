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
import bookingService from '../../services/bookingService';

export const AdminBookingDetailScreen = ({ route, navigation }) => {
  const initialBooking = route.params?.booking;
  const [booking, setBooking] = useState(initialBooking);

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    newStatus: null,
    variant: 'primary',
  });
  const [updating, setUpdating] = useState(false);

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

  const openActionDialog = (newStatus, title, variant = 'primary') => {
    let msg = `Apakah Anda yakin ingin mengubah status pesanan ini menjadi "${newStatus}"?`;
    if (newStatus === 'cancelled') {
      msg = 'Tolak pesanan ini? Tanggal yang sebelumnya dipesan akan dibuka kembali untuk tamu lain.';
    } else if (newStatus === 'confirmed') {
      msg = 'Konfirmasi pesanan ini? Tamu akan melihat bahwa jadwal mereka telah disetujui.';
    } else if (newStatus === 'completed') {
      msg = 'Tandai bahwa masa menginap tamu telah selesai?';
    }

    setConfirmDialog({
      visible: true,
      title,
      message: msg,
      newStatus,
      variant,
    });
  };

  const handleExecuteStatusUpdate = async () => {
    if (!confirmDialog.newStatus) return;
    setUpdating(true);
    try {
      const updated = await bookingService.updateBookingStatus(
        booking.id,
        confirmDialog.newStatus
      );
      setBooking(updated);
      setConfirmDialog((prev) => ({ ...prev, visible: false }));
      if (Platform.OS !== 'web') {
        Alert.alert('Sukses', 'Status pesanan berhasil diperbarui.');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui status.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

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
        <Text style={styles.topTitle}>Detail Reservasi Tamu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.codeLabel}>Kode Booking</Text>
            <Text style={styles.codeText}>#{booking.id?.toUpperCase()}</Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        {/* Info Tamu Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Identitas Tamu</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Nama Lengkap</Text>
            <Text style={styles.itemValue}>{booking.userName || 'Tamu'}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Alamat Email</Text>
            <Text style={styles.itemValue}>{booking.userEmail || '-'}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>WhatsApp / HP</Text>
            <Text style={styles.itemValue}>{booking.userPhone || '-'}</Text>
          </View>
          {!!booking.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Catatan Khusus dari Tamu:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>

        {/* Hunian & Waktu Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Hunian & Jadwal</Text>
          <View style={styles.propRow}>
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
              <Text style={styles.bookedDate}>
                Dibuat: {formatDateFull(booking.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Tanggal Check-in</Text>
            <Text style={styles.itemValue}>{formatDateIndo(booking.checkIn, true)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Tanggal Check-out</Text>
            <Text style={styles.itemValue}>{formatDateIndo(booking.checkOut, true)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Durasi Menginap</Text>
            <Text style={styles.itemValue}>{booking.nights} Malam</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Jumlah Tamu</Text>
            <Text style={styles.itemValue}>{booking.guests || 1} Tamu</Text>
          </View>
        </View>

        {/* Rincian Finansial Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Keuangan & Pembayaran</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Total Tagihan Tamu</Text>
            <Text style={styles.totalValue}>{formatRupiah(booking.totalPrice)}</Text>
          </View>
        </View>

        {/* Tombol Aksi Operasional Admin */}
        <View style={styles.actionSection}>
          <Text style={styles.actionSectionTitle}>Aksi Administrator</Text>

          {isPending && (
            <View style={styles.actionBtnRow}>
              <Button
                title="Tolak Pesanan"
                variant="danger"
                size="md"
                onPress={() => openActionDialog('cancelled', 'Tolak Pesanan', 'danger')}
                style={{ flex: 1 }}
              />
              <Button
                title="Setujui Pesanan"
                variant="accent"
                size="md"
                onPress={() => openActionDialog('confirmed', 'Setujui Pesanan', 'primary')}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {isConfirmed && (
            <Button
              title="Tandai Selesai Menginap"
              variant="primary"
              size="md"
              leftIcon={<Ionicons name="checkmark-done" size={18} color={colors.surface} />}
              onPress={() => openActionDialog('completed', 'Selesaikan Pesanan', 'primary')}
            />
          )}

          {!isPending && !isConfirmed && (
            <View style={styles.closedNotice}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.closedNoticeText}>
                Pesanan ini telah berstatus final ({booking.status}). Tidak ada aksi operasional lebih lanjut.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dialog Konfirmasi Aksi */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmTitle="Ya, Lanjutkan"
        cancelTitle="Batal"
        confirmVariant={confirmDialog.variant}
        loading={updating}
        onConfirm={handleExecuteStatusUpdate}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, visible: false }))
        }
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
  statusCard: {
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
  codeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  codeText: {
    ...typography.h3,
    color: colors.primary,
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
  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
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
  propRow: {
    flexDirection: 'row',
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
  bookedDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  actionSection: {
    marginTop: spacing.md,
  },
  actionSectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  closedNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
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

export default AdminBookingDetailScreen;
