import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
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

export const MyBookingsScreen = ({ navigation }) => {
  const {
    bookings,
    loading,
    refreshing,
    statusFilter,
    setStatusFilter,
    refresh,
    cancelBooking,
  } = useBookings('guest', 'all');

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const handleOpenCancelDialog = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      await cancelBooking(selectedBookingToCancel.id);
      setCancelModalVisible(false);
      setSelectedBookingToCancel(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
        <Text style={styles.headerSubtitle}>
          Pantau status reservasi hunian Anda
        </Text>
      </View>

      {/* Horizontal Filter Tabs */}
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

      {/* Booking List */}
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
              icon="calendar-outline"
              title="Belum Ada Pesanan"
              message={
                statusFilter === 'all'
                  ? 'Anda belum pernah memesan hunian apa pun.'
                  : `Tidak ada pesanan dengan status "${STATUS_TABS.find((t) => t.id === statusFilter)?.label}".`
              }
              actionTitle="Cari Hunian Sekarang"
              onAction={() => navigation.navigate('Beranda')}
            />
          )
        }
        renderItem={({ item }) => {
          const isPending = item.status === 'pending';

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('BookingDetail', { booking: item })
              }
              style={styles.card}
            >
              {/* Top Row: Property Name & Status Badge */}
              <View style={styles.cardTopRow}>
                <View style={styles.titleCol}>
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {item.propertyName}
                  </Text>
                  <Text style={styles.bookingId}>ID: #{item.id?.substring(0, 8)}</Text>
                </View>
                <StatusBadge status={item.status} size="sm" />
              </View>

              {/* Mid Row: Image & Schedule Info */}
              <View style={styles.cardMidRow}>
                <Image
                  source={{
                    uri:
                      item.propertyImage ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
                  }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />

                <View style={styles.scheduleInfo}>
                  <View style={styles.scheduleRow}>
                    <Ionicons name="calendar-outline" size={15} color={colors.primary} />
                    <Text style={styles.scheduleText}>
                      {formatDateIndo(item.checkIn)} - {formatDateIndo(item.checkOut)}
                    </Text>
                  </View>

                  <View style={styles.scheduleRow}>
                    <Ionicons name="moon-outline" size={15} color={colors.textSecondary} />
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

              {/* Bottom Actions Row */}
              <View style={styles.cardBottomRow}>
                <Button
                  title="Detail Reservasi"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  onPress={() =>
                    navigation.navigate('BookingDetail', { booking: item })
                  }
                  style={styles.detailBtn}
                />

                {isPending && (
                  <Button
                    title="Batalkan"
                    variant="danger"
                    size="sm"
                    fullWidth={false}
                    onPress={() => handleOpenCancelDialog(item)}
                    style={styles.cancelBtn}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Dialog Konfirmasi Pembatalan */}
      <ConfirmDialog
        visible={cancelModalVisible}
        title="Batalkan Pesanan?"
        message={`Apakah Anda yakin ingin membatalkan pesanan untuk "${selectedBookingToCancel?.propertyName}"? Tindakan ini tidak dapat diurungkan.`}
        confirmTitle="Ya, Batalkan"
        cancelTitle="Kembali"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setSelectedBookingToCancel(null);
        }}
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
  propertyName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  bookingId: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  cardMidRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  cardImg: {
    width: 80,
    height: 80,
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
    ...typography.bodyBold,
    fontSize: 13,
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
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  detailBtn: {
    paddingHorizontal: spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
  },
});

export default MyBookingsScreen;
