import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { formatRupiah, formatRupiahCompact } from '../../utils/formatRupiah';
import { formatDateIndo } from '../../utils/dateHelper';
import propertyService from '../../services/propertyService';
import bookingService from '../../services/bookingService';

export const DashboardScreen = ({ navigation }) => {
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalProperties: 0,
    activeBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [propertiesData, bookingsData] = await Promise.all([
        propertyService.getProperties(),
        bookingService.getAllBookings('all'),
      ]);

      // Hitung Pendapatan (dari booking confirmed dan completed)
      const revenue = bookingsData
        .filter((b) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

      // Hitung Pesanan Aktif (pending + confirmed)
      const active = bookingsData.filter(
        (b) => b.status === 'pending' || b.status === 'confirmed'
      ).length;

      setStats({
        totalRevenue: revenue,
        totalBookings: bookingsData.length,
        totalProperties: propertiesData.length,
        activeBookings: active,
      });

      // 5 Booking Terbaru
      setRecentBookings(bookingsData.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel Administrator</Text>
          <Text style={styles.headerSubtitle}>
            Selamat datang, {userProfile?.name || 'Admin'} 👋
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profil')}
          style={styles.avatarBtn}
        >
          <Ionicons name="shield-checkmark" size={32} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Tombol Aksi Cepat */}
        <View style={styles.quickActions}>
          <Button
            title="+ Tambah Hunian"
            variant="accent"
            size="md"
            onPress={() => navigation.navigate('PropertyForm')}
            style={{ flex: 1 }}
          />
          <Button
            title="Kelola Pesanan"
            variant="primary"
            size="md"
            onPress={() => navigation.navigate('Reservasi')}
            style={{ flex: 1 }}
          />
        </View>

        {/* Metrik Statistik Utama (Grid 2x2) */}
        <Text style={styles.sectionHeading}>Ringkasan Performa</Text>

        {loading ? (
          <View style={styles.statsGrid}>
            <Skeleton width="48%" height={100} borderRadius={radius.md} />
            <Skeleton width="48%" height={100} borderRadius={radius.md} />
            <Skeleton width="48%" height={100} borderRadius={radius.md} />
            <Skeleton width="48%" height={100} borderRadius={radius.md} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {/* Kartu Pendapatan */}
            <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
              <View style={styles.statIconCircle}>
                <Ionicons name="wallet-outline" size={20} color={colors.success} />
              </View>
              <Text style={styles.statLabel}>Total Pendapatan</Text>
              <Text style={styles.statValue}>
                {formatRupiahCompact(stats.totalRevenue)}
              </Text>
              <Text style={styles.statSub}>Dari pesanan sukses</Text>
            </View>

            {/* Kartu Total Booking */}
            <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
              <View style={styles.statIconCircle}>
                <Ionicons name="receipt-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statLabel}>Total Reservasi</Text>
              <Text style={styles.statValue}>{stats.totalBookings}</Text>
              <Text style={styles.statSub}>Semua riwayat</Text>
            </View>

            {/* Kartu Total Hunian */}
            <View style={[styles.statCard, { borderLeftColor: colors.accent }]}>
              <View style={styles.statIconCircle}>
                <Ionicons name="business-outline" size={20} color={colors.accent} />
              </View>
              <Text style={styles.statLabel}>Total Hunian</Text>
              <Text style={styles.statValue}>{stats.totalProperties}</Text>
              <Text style={styles.statSub}>Kamar, villa, kos, apt</Text>
            </View>

            {/* Kartu Okupansi Aktif */}
            <View style={[styles.statCard, { borderLeftColor: colors.status.pending.text }]}>
              <View style={styles.statIconCircle}>
                <Ionicons name="time-outline" size={20} color={colors.status.pending.text} />
              </View>
              <Text style={styles.statLabel}>Pesanan Berjalan</Text>
              <Text style={styles.statValue}>{stats.activeBookings}</Text>
              <Text style={styles.statSub}>Pending & Confirmed</Text>
            </View>
          </View>
        )}

        {/* Section: Reservasi Terbaru */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Reservasi Terbaru</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reservasi')}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ gap: spacing.sm }}>
            <Skeleton width="100%" height={70} borderRadius={radius.md} />
            <Skeleton width="100%" height={70} borderRadius={radius.md} />
          </View>
        ) : recentBookings.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Ionicons name="calendar-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyRecentText}>Belum ada pemesanan dari tamu.</Text>
          </View>
        ) : (
          recentBookings.map((b) => (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('AdminBookingDetail', { booking: b })
              }
              style={styles.recentBookingCard}
            >
              <Image
                source={{
                  uri:
                    b.propertyImage ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
                }}
                style={styles.recentImg}
                resizeMode="cover"
              />

              <View style={styles.recentDetails}>
                <Text style={styles.recentPropName} numberOfLines={1}>
                  {b.propertyName}
                </Text>
                <Text style={styles.recentGuestName}>
                  Tamu: {b.userName || 'Tamu'} • {formatDateIndo(b.checkIn)}
                </Text>
                <Text style={styles.recentPrice}>
                  {formatRupiah(b.totalPrice)}
                </Text>
              </View>

              <View style={styles.recentStatusCol}>
                <StatusBadge status={b.status} size="sm" />
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textMuted}
                  style={{ marginTop: 4, alignSelf: 'flex-end' }}
                />
              </View>
            </TouchableOpacity>
          ))
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.accent,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  statSub: {
    ...typography.small,
    color: colors.textMuted,
  },
  emptyRecent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  emptyRecentText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recentBookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  recentImg: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
  },
  recentDetails: {
    flex: 1,
  },
  recentPropName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  recentGuestName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentPrice: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  recentStatusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default DashboardScreen;
