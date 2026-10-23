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
import { isValidEmail } from '../../utils/validators';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError('');
    if (!email || !email.trim()) {
      setError('Alamat email wajib diisi');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Format alamat email tidak valid');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Tautan Terkirim',
          'Instruksi penyetelan ulang kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
        );
      }
    } catch (err) {
      const friendlyMessage = getFirebaseErrorMessage(err);
      setError(friendlyMessage);
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
        >
          {/* Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={44} color={colors.primary} />
            </View>
            <Text style={styles.title}>Lupa Kata Sandi?</Text>
            <Text style={styles.subtitle}>
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk menyetel ulang kata sandi Anda.
            </Text>
          </View>

          {/* Card Form */}
          <View style={styles.formCard}>
            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={44} color={colors.success} />
                <Text style={styles.successTitle}>Email Terkirim!</Text>
                <Text style={styles.successDesc}>
                  Silakan periksa email Anda ({email}) untuk menyelesaikan pemulihan kata sandi.
                </Text>
                <Button
                  title="Kembali ke Halaman Masuk"
                  variant="primary"
                  size="md"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backToLoginBtn}
                />
              </View>
            ) : (
              <>
                <Input
                  label="Alamat Email Terdaftar"
                  placeholder="nama@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  error={error}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                />

                <Button
                  title="Kirim Tautan Reset"
                  onPress={handleReset}
                  loading={loading}
                  size="lg"
                  style={styles.submitBtn}
                />
              </>
            )}
          </View>

          {/* Footer Back */}
          {!success && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Ingat kata sandi? Masuk</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 300,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  successDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  backToLoginBtn: {
    width: '100%',
  },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
