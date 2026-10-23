import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, radius, spacing } from '../theme';

/**
 * Komponen Skeleton Shimmer / Pulse Reusable
 * Digunakan sebagai placeholder loading di seluruh layar
 */
export const Skeleton = ({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Placeholder Skeleton untuk Kartu Properti
 */
export const PropertyCardSkeleton = () => {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton width="100%" height={180} borderRadius={radius.md} />
      <View style={styles.cardContent}>
        <Skeleton width="40%" height={14} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="80%" height={18} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: spacing.sm }} />
        <View style={styles.cardBottomRow}>
          <Skeleton width="50%" height={20} />
          <Skeleton width="25%" height={16} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.shimmer,
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});

export default Skeleton;
