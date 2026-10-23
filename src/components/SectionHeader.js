import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

/**
 * Komponen SectionHeader HuniHub
 * Menampilkan judul section dengan aksi "Lihat Semua" opsional
 */
export const SectionHeader = ({
  title,
  subtitle,
  actionTitle = 'Lihat Semua',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onAction && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{actionTitle}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.accent,
    marginRight: 2,
  },
});

export default SectionHeader;
