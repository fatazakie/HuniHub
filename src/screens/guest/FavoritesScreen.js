import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { useFavorites } from '../../hooks/useFavorites';

export const FavoritesScreen = ({ navigation }) => {
  const {
    favoriteProperties,
    loading,
    refreshing,
    refresh,
    toggleFav,
  } = useFavorites();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorit Saya</Text>
        <Text style={styles.headerSubtitle}>
          Koleksi hunian idaman yang Anda simpan
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.listPadding}>
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={favoriteProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
              icon="heart-dislike-outline"
              title="Belum Ada Favorit"
              message="Anda belum menandai hunian mana pun sebagai favorit. Ketuk ikon hati pada hunian yang Anda sukai."
              actionTitle="Jelajahi Hunian Sekarang"
              onAction={() => navigation.navigate('Beranda')}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={true}
              onToggleFavorite={() => toggleFav(item.id)}
              onPress={() =>
                navigation.navigate('PropertyDetail', { property: item })
              }
            />
          )}
        />
      )}
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
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  listPadding: {
    padding: spacing.lg,
  },
});

export default FavoritesScreen;
