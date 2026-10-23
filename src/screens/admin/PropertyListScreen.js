import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { useProperties } from '../../hooks/useProperties';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import { formatRupiah } from '../../utils/formatRupiah';
import propertyService from '../../services/propertyService';

export const PropertyListScreen = ({ navigation }) => {
  const {
    properties,
    loading,
    refreshing,
    refresh,
    updateFilters,
  } = useProperties();

  const [search, setSearch] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedPropertyToDelete, setSelectedPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (text) => {
    setSearch(text);
    updateFilters({ search: text });
  };

  const handleToggleAvailable = async (property) => {
    try {
      await propertyService.togglePropertyAvailability(
        property.id,
        property.isAvailable !== false
      );
      await refresh();
    } catch (err) {
      console.error('Error toggling availability:', err);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal', 'Tidak dapat mengubah status ketersediaan.');
      }
    }
  };

  const handleOpenDeleteDialog = (property) => {
    setSelectedPropertyToDelete(property);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPropertyToDelete) return;
    setDeleting(true);
    try {
      await propertyService.deleteProperty(selectedPropertyToDelete.id);
      setDeleteDialogVisible(false);
      setSelectedPropertyToDelete(null);
      await refresh();
      if (Platform.OS !== 'web') {
        Alert.alert('Sukses', 'Hunian berhasil dihapus.');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal', 'Tidak dapat menghapus data hunian.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kelola Hunian</Text>
          <Text style={styles.headerSubtitle}>
            Total {properties.length} hunian terdaftar
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PropertyForm')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          placeholder="Cari hunian berdasarkan nama atau kota..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
        {search ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.paddingList}>
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={properties}
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
            <EmptyState
              icon="business-outline"
              title="Belum Ada Hunian"
              message="Mulai tambahkan hunian baru untuk disewakan kepada tamu."
              actionTitle="+ Tambah Hunian Baru"
              onAction={() => navigation.navigate('PropertyForm')}
            />
          }
          renderItem={({ item }) => {
            const isAvail = item.isAvailable !== false;

            return (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Image
                    source={{
                      uri:
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
                    }}
                    style={styles.propImg}
                    resizeMode="cover"
                  />

                  <View style={styles.propDetails}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {item.type?.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.propName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.propCity}>
                      <Ionicons name="location-outline" size={12} color={colors.textSecondary} />{' '}
                      {item.city}
                    </Text>
                    <Text style={styles.propPrice}>
                      {formatRupiah(item.pricePerNight)} / malam
                    </Text>
                  </View>
                </View>

                {/* Bottom Controls Row */}
                <View style={styles.cardControlsRow}>
                  {/* Availability Toggle */}
                  <View style={styles.availCol}>
                    <Text style={styles.availLabel}>
                      {isAvail ? 'Tersedia' : 'Penuh/Tutup'}
                    </Text>
                    <Switch
                      value={isAvail}
                      onValueChange={() => handleToggleAvailable(item)}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={isAvail ? colors.primary : '#CBD5E1'}
                    />
                  </View>

                  {/* Action Buttons (Edit & Delete) */}
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('PropertyForm', { property: item })
                      }
                      style={styles.actionBtnOutline}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenDeleteDialog(item)}
                      style={[styles.actionBtnOutline, styles.deleteBtnOutline]}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                        Hapus
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Hapus Hunian?"
        message={`Apakah Anda yakin ingin menghapus hunian "${selectedPropertyToDelete?.name}"? Tindakan ini akan menghapus data secara permanen.`}
        confirmTitle="Ya, Hapus"
        cancelTitle="Batal"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogVisible(false);
          setSelectedPropertyToDelete(null);
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
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  paddingList: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
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
    gap: spacing.md,
  },
  propImg: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
  },
  propDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typeBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 9,
  },
  propName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  propCity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  propPrice: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 4,
  },
  cardControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  availCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  availLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 4,
  },
  deleteBtnOutline: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default PropertyListScreen;
