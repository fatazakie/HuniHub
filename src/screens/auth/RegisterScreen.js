import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { validateRegisterForm } from '../../utils/validators';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleRegister = async () => {
    setServerError('');
    const validation = validateRegisterForm({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        password,
      });
      // Sukses: user otomatis dibuat dengan role 'guest' dan diarahkan oleh RootNavigator
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      setServerError(friendlyMessage);
      if (Platform.OS !== 'web') {
        Alert.alert('Pendaftaran Gagal', friendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Kembali & Judul */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>
              Bergabunglah dengan HuniHub untuk kemudahan reservasi hunian di seluruh Indonesia.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {!!serverError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorBannerText}>{serverError}</Text>
              </View>
            )}

            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Pratama"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Alamat Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Nomor HP (WhatsApp)"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              error={errors.phone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Kata Sandi"
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Konfirmasi Kata Sandi"
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              error={errors.confirmPassword}
              secureTextEntry
              leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} />}
            />

            <Button
              title="Daftar Akun"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Masuk */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Sudah memiliki akun? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLink}>Masuk di Sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default RegisterScreen;
