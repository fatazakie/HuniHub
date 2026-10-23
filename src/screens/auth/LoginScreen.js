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
import { validateLoginForm } from '../../utils/validators';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export const LoginScreen = ({ navigation }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleLogin = async () => {
    setServerError('');
    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (email.trim() === 'admin@hunihub.id' && password === 'admin123') {
        try {
          const authService = require('../../services/authService').default;
          await authService.ensureDemoAccount('admin');
        } catch (demoErr) {
          if (
            demoErr.code === 'auth/configuration-not-found' ||
            demoErr.code === 'auth/operation-not-allowed' ||
            demoErr.code === 'auth/network-request-failed'
          ) {
            console.warn('Firebase Auth belum diaktifkan di Console, beralih ke sesi demo lokal Admin');
            loginAsDemo('admin');
            return;
          }
          throw demoErr;
        }
      } else if (email.trim() === 'tamu@hunihub.id' && password === 'tamu123') {
        try {
          const authService = require('../../services/authService').default;
          await authService.ensureDemoAccount('guest');
        } catch (demoErr) {
          if (
            demoErr.code === 'auth/configuration-not-found' ||
            demoErr.code === 'auth/operation-not-allowed' ||
            demoErr.code === 'auth/network-request-failed'
          ) {
            console.warn('Firebase Auth belum diaktifkan di Console, beralih ke sesi demo lokal Tamu');
            loginAsDemo('guest');
            return;
          }
          throw demoErr;
        }
      } else {
        await login(email, password);
      }
      // Navigasi ditangani otomatis oleh RootNavigator berdasarkan state auth & role
    } catch (error) {
      console.error('Login error detail:', error);
      const friendlyMessage = getFirebaseErrorMessage(error);
      setServerError(friendlyMessage);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal Masuk', friendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk akun demo
  const fillDemoAccount = async (role) => {
    setServerError('');
    setErrors({});
    if (role === 'admin') {
      setEmail('admin@hunihub.id');
      setPassword('admin123');
    } else {
      setEmail('tamu@hunihub.id');
      setPassword('tamu123');
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
          {/* Logo & Slogan Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={40} color={colors.primary} />
            </View>
            <Text style={styles.appName}>HuniHub</Text>
            <Text style={styles.welcomeTitle}>Selamat Datang Kembali</Text>
            <Text style={styles.welcomeSubtitle}>
              Masuk untuk melanjutkan reservasi hunian impian Anda.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {!!serverError && (
              <View style={styles.errorBannerContainer}>
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.errorBannerText}>{serverError}</Text>
                </View>
                <TouchableOpacity
                  style={styles.offlineDemoBtn}
                  activeOpacity={0.8}
                  onPress={() => loginAsDemo(email.includes('admin') ? 'admin' : 'guest')}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.offlineDemoText}>
                    Masuk Mode Demo Langsung (Preview Instan)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
              label="Kata Sandi"
              placeholder="Masukkan kata sandi"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            />

            {/* Lupa Kata Sandi */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Lupa kata sandi?</Text>
            </TouchableOpacity>

            {/* Tombol Masuk */}
            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />

            {/* Opsi Cepat Akun Demo */}
            <View style={styles.demoBox}>
              <Text style={styles.demoLabel}>Uji Coba Cepat (Akun Demo):</Text>
              <View style={styles.demoRow}>
                <Button
                  title="Demo Guest"
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => fillDemoAccount('guest')}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Demo Admin"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  onPress={() => fillDemoAccount('admin')}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>

          {/* Footer Daftar Akun */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum memiliki akun HuniHub? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
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
  errorBannerContainer: {
    marginBottom: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  offlineDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  offlineDemoText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  submitBtn: {
    marginBottom: spacing.md,
  },
  demoBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  demoLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  registerLink: {
    ...typography.bodyBold,
    color: colors.accent,
  },
});

export default LoginScreen;
