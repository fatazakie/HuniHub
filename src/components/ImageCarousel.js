import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Komponen ImageCarousel HuniHub
 * Menampilkan galeri foto hunian yang dapat digeser (swipe) dengan pagination dots dan counter
 */
export const ImageCarousel = ({ images = [], height = 280, style }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  ];

  const handleScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex && slide >= 0 && slide < displayImages.length) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={[styles.container, { height }, style]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {displayImages.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={[styles.image, { width: SCREEN_WIDTH, height }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Counter Pojok Kanan Bawah */}
      {displayImages.length > 1 && (
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{displayImages.length}
          </Text>
        </View>
      )}

      {/* Pagination Dots */}
      {displayImages.length > 1 && (
        <View style={styles.paginationRow}>
          {displayImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.borderLight,
  },
  image: {
    backgroundColor: colors.borderLight,
  },
  counterBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: radius.full,
  },
  counterText: {
    ...typography.captionBold,
    color: colors.surface,
    fontSize: 11,
  },
  paginationRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.accent,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default ImageCarousel;
