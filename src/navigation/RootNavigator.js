import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';
import AuthStack from './AuthStack';
import GuestNavigator from './GuestTabs';
import AdminNavigator from './AdminTabs';

export const RootNavigator = () => {
  const { user, role, loading } = useAuth();

  // Layar Pemuatan Awal (Splash/Loading State)
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="business" size={48} color={colors.primary} />
        </View>
        <Text style={styles.appName}>HuniHub</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>Menyiapkan aplikasi...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === 'admin' ? (
        <AdminNavigator />
      ) : (
        <GuestNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: spacing.xl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default RootNavigator;
