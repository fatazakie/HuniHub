import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export const AdminProfileScreen = () => {
  const { user, userProfile, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={44} color={colors.accent} />
          </View>
          <Text style={styles.userName}>{userProfile?.name || 'Administrator HuniHub'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Administrator</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Hak Akses Admin</Text>
          <Text style={styles.desc}>
            • Kelola seluruh data hunian (tambah, edit, hapus, upload foto)
          </Text>
          <Text style={styles.desc}>
            • Konfirmasi, tolak, dan selesaikan pesanan tamu
          </Text>
          <Text style={styles.desc}>
            • Pantau statistik omzet dan performa hunian
          </Text>
        </View>

        <Button
          title="Keluar dari Akun Admin"
          variant="danger"
          size="md"
          leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.surface} />}
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutBtn}
        />

        <ConfirmDialog
          visible={showLogoutDialog}
          title="Konfirmasi Keluar Admin"
          message="Apakah Anda yakin ingin keluar dari sesi Administrator?"
          confirmTitle="Ya, Keluar"
          cancelTitle="Batal"
          confirmVariant="danger"
          loading={loggingOut}
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutDialog(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.captionBold,
    color: colors.surface,
  },
  infoSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});

export default AdminProfileScreen;
