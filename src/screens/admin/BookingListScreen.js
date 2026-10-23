import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { formatRupiah } from '../../utils/formatRupiah';
import { formatDateIndo } from '../../utils/dateHelper';
import { useBookings } from '../../hooks/useBookings';

const STATUS_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Menunggu' },
  { id: 'confirmed', label: 'Dikonfirmasi' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export const BookingListScreen = ({ navigation }) => {
  const {
    bookings,
    loading,
    refreshing,
    statusFilter,
    setStatusFilter,
    refresh,
    updateBookingStatus,
  } = useBookings('admin', 'all');

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    actionType: null,
    bookingId: null,
    variant: 'primary',
  });
  const [processing, setProcessing] = useState(false);

  const openActionDialog = (booking, newStatus, actionTitle, variant = 'primary') => {
    let msg = `Ubah status reservasi "${booking.propertyName}" milik ${booking.userName} menjadi ${newStatus}?`;
    if (newStatus === 'cancelled') {
      msg = `Tolak pesanan untuk "${booking.propertyName}" milik ${booking.userName}? Tanggal akan dibuka kembali untuk tamu lain.`;
    }

    setConfirmDialog({
      visible: true,
      title: `${actionTitle} Pesanan`,
      message: msg,
      actionType: newStatus,
      bookingId: booking.id,
      variant,
    });
  };

  const handleExecuteAction = async () => {
    if (!confirmDialog.bookingId || !confirmDialog.actionType) return;
    setProcessing(true);
    try {
      await updateBookingStatus(confirmDialog.bookingId, confirmDialog.actionType);
      setConfirmDialog((prev) => ({ ...prev, visible: false }));
      if (Platform.OS !== 'web') {
        Alert.alert('Sukses', 'Status pesanan berhasil diperbarui.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui status.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kelola Reservasi</Text>
        <Text style={styles.headerSubtitle}>
          Pantau dan tanggapi pesanan seluruh tamu
        </Text>
      </View>

      {/* Tabs Filter Status */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setStatusFilter(tab.id)}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
          !loading && (
            <EmptyState
              icon="receipt-outline"
              title="Tidak Ada Reservasi"
              message={
                statusFilter === 'all'
                  ? 'Belum ada tamu yang membuat reservasi hunian.'
                  : `Tidak ada reservasi berstatus "${STATUS_TABS.find((t) => t.id === statusFilter)?.label}".`
              }
            />
          )
        }
        renderItem={({ item }) => {
          const isPending = item.status === 'pending';
          const isConfirmed = item.status === 'confirmed';

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('AdminBookingDetail', { booking: item })
              }
              style={styles.card}
            >
              {/* Top Row: Property Name & Status */}
              <View style={styles.cardTopRow}>
                <View style={styles.titleCol}>
                  <Text style={styles.propName} numberOfLines={1}>
                    {item.propertyName}
                  </Text>
                  <Text style={styles.guestInfo}>
                    Tamu: <Text style={styles.guestBold}>{item.userName || 'Tamu'}</Text>{' '}
                    • {item.userPhone || 'Tanpa No HP'}
                  </Text>
                </View>
                <StatusBadge status={item.status} size="sm" />
              </View>

              {/* Mid Row: Image & Schedule */}
              <View style={styles.cardMidRow}>
                <Image
                  source={{
                    uri:
                      item.propertyImage ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
                  }}
                  style={styles.propImg}
                  resizeMode="cover"
                />

                <View style={styles.scheduleInfo}>
                  <View style={styles.scheduleRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                    <Text style={styles.scheduleText}>
                      {formatDateIndo(item.checkIn)} - {formatDateIndo(item.checkOut)}
                    </Text>
                  </View>

                  <View style={styles.scheduleRow}>
                    <Ionicons name="moon-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.scheduleSubText}>
                      {item.nights} Malam • {item.guests || 1} Tamu
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total:</Text>
                    <Text style={styles.priceAmount}>
                      {formatRupiah(item.totalPrice)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <Button
                  title="Detail"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  onPress={() =>
                    navigation.navigate('AdminBookingDetail', { booking: item })
                  }
                  style={styles.actionBtnSmall}
                />

                {/* Aksi Khusus Status Pending: Setujui & Tolak */}
                {isPending && (
                  <>
                    <Button
                      title="Tolak"
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      onPress={() => openActionDialog(item, 'cancelled', 'Tolak', 'danger')}
                      style={styles.actionBtnSmall}
                    />
                    <Button
                      title="Setujui"
                      variant="accent"
                      size="sm"
                      fullWidth={false}
                      onPress={() => openActionDialog(item, 'confirmed', 'Setujui', 'primary')}
                      style={styles.actionBtnSmall}
                    />
                  </>
                )}

                {/* Aksi Khusus Status Confirmed: Selesaikan */}
                {isConfirmed && (
                  <Button
                    title="Selesaikan"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => openActionDialog(item, 'completed', 'Selesaikan', 'primary')}
                    style={styles.actionBtnSmall}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Dialog Konfirmasi Aksi Admin */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmTitle="Ya, Jalankan"
        cancelTitle="Batal"
        confirmVariant={confirmDialog.variant}
        loading={processing}
        onConfirm={handleExecuteAction}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.surface,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  propName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  guestInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guestBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMidRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  propImg: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
  },
  scheduleInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  scheduleSubText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceAmount: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 15,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtnSmall: {
    paddingHorizontal: spacing.sm + 4,
    minHeight: 34,
  },
});

export default BookingListScreen;
