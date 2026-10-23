import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { isValidPhone } from '../../utils/validators';

export const ProfileScreen = ({ navigation }) => {
  const { user, userProfile, updateProfile, logout } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleOpenEdit = () => {
    setName(userProfile?.name || '');
    setPhone(userProfile?.phone || '');
    setErrorMsg('');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name || name.trim().length < 3) {
      setErrorMsg('Nama minimal 3 karakter.');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      setErrorMsg('Format nomor HP tidak valid (contoh: 08123456789).');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setEditModalVisible(false);
      if (Platform.OS !== 'web') {
        Alert.alert('Sukses', 'Profil berhasil diperbarui.');
      }
    } catch (err) {
      setErrorMsg('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        <Text style={styles.headerSubtitle}>Kelola akun dan pengaturan HuniHub</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{userProfile?.name || 'Tamu HuniHub'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Tamu (Guest)</Text>
          </View>

          <Button
            title="Edit Profil"
            variant="outline"
            size="sm"
            fullWidth={false}
            leftIcon={<Ionicons name="create-outline" size={16} color={colors.primary} />}
            onPress={handleOpenEdit}
            style={styles.editBtn}
          />
        </View>

        {/* Info Kontak Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Kontak</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Nomor WhatsApp / HP</Text>
              <Text style={styles.infoValue}>
                {userProfile?.phone || 'Belum ditambahkan'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Alamat Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Menu & Bantuan Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pusat Bantuan & Ketentuan</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Pusat Bantuan & FAQ</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Syarat & Ketentuan Pemesanan</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Kebijakan Privasi</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.appVersion}>HuniHub v1.0.0 (Expo SDK 57)</Text>

        {/* Tombol Logout */}
        <Button
          title="Keluar dari Akun"
          variant="danger"
          size="md"
          leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.surface} />}
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Modal Edit Profil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perbarui Profil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </View>
            )}

            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Nomor WhatsApp"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="outline"
                size="md"
                onPress={() => setEditModalVisible(false)}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                title="Simpan"
                variant="primary"
                size="md"
                loading={saving}
                onPress={handleSaveProfile}
                fullWidth={false}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dialog Konfirmasi Logout */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun HuniHub Anda?"
        confirmTitle="Ya, Keluar"
        cancelTitle="Batal"
        confirmVariant="danger"
        loading={loggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  roleBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  editBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  menuItemText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  logoutBtn: {
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  errorAlertText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

export default ProfileScreen;
