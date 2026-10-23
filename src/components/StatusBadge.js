import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

const STATUS_LABELS = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

/**
 * Komponen StatusBadge HuniHub
 * Menampilkan status booking dengan warna konsisten
 */
export const StatusBadge = ({ status = 'pending', size = 'md', style }) => {
  const currentStatus = colors.status[status] || colors.status.pending;
  const label = STATUS_LABELS[status] || status;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentStatus.bg,
          borderColor: currentStatus.border,
        },
        isSmall && styles.badgeSm,
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: currentStatus.dot },
          isSmall && styles.dotSm,
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: currentStatus.text },
          isSmall && styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs + 2,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: spacing.xs,
  },
  text: {
    ...typography.captionBold,
  },
  textSm: {
    fontSize: 10,
    lineHeight: 13,
  },
});

export default StatusBadge;
