import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import Button from './Button';

/**
 * Komponen ConfirmDialog HuniHub
 * Modal dialog untuk konfirmasi aksi penting/destruktif (hapus, batal, tolak, logout)
 */
export const ConfirmDialog = ({
  visible = false,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan aksi ini?',
  confirmTitle = 'Ya, Lanjutkan',
  cancelTitle = 'Batal',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actionRow}>
                <Button
                  title={cancelTitle}
                  onPress={onCancel}
                  variant="outline"
                  size="md"
                  disabled={loading}
                  fullWidth={false}
                  style={styles.cancelButton}
                />
                <Button
                  title={confirmTitle}
                  onPress={onConfirm}
                  variant={confirmVariant}
                  size="md"
                  loading={loading}
                  fullWidth={false}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default ConfirmDialog;
