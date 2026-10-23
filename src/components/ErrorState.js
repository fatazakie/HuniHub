import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

/**
 * Komponen ErrorState HuniHub
 * Ditampilkan saat terjadi kesalahan request / fetch data dengan tombol "Coba Lagi"
 */
export const ErrorState = ({
  icon = 'alert-circle-outline',
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat memuat data. Silakan periksa koneksi internet Anda.',
  onRetry,
  retryTitle = 'Coba Lagi',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={48} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="md"
          leftIcon={<Ionicons name="reload-outline" size={18} color={colors.primary} />}
          fullWidth={false}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.status.cancelled.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 290,
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
  },
});

export default ErrorState;
