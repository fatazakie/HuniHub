import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Temukan Hunian Nyaman',
    desc: 'Jelajahi ribuan pilihan kamar, kos, villa, dan apartemen terbaik di berbagai destinasi Indonesia.',
    icon: 'home-outline',
    badge: 'Pilihan Lengkap',
  },
  {
    id: '2',
    title: 'Pemesanan Cepat & Akurat',
    desc: 'Pilih tanggal menginap dengan kalender interaktif. Sistem otomatis mencegah bentrok tanggal.',
    icon: 'calendar-outline',
    badge: 'Bebas Bentrok',
  },
  {
    id: '3',
    title: 'Liburan Tanpa Khawatir',
    desc: 'Konfirmasi reservasi yang transparan, status pesanan real-time, dan manajemen pemesanan yang mudah.',
    icon: 'shield-checkmark-outline',
    badge: 'Terpercaya',
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { completeOnboarding } = useAuth();

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header: Lewati */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <Ionicons name="business" size={24} color={colors.primary} />
          <Text style={styles.brandTitle}>HuniHub</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleFinish}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={72} color={colors.primary} />
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Bottom Area: Dots & Action */}
      <View style={styles.bottomArea}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          variant={currentIndex === SLIDES.length - 1 ? 'accent' : 'primary'}
          size="lg"
          rightIcon={
            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.surface}
            />
          }
          onPress={handleNext}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.accentDark,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  bottomArea: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.border,
  },
});

export default OnboardingScreen;
