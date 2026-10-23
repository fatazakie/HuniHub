import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

/**
 * Komponen Button Reusable HuniHub
 * Varian: primary, secondary, outline, ghost, danger
 * Ukuran: sm, md, lg
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'accent':
        return styles.accentContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'danger':
        return styles.dangerText;
      case 'accent':
        return styles.accentText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smContainer;
      case 'lg':
        return styles.lgContainer;
      case 'md':
      default:
        return styles.mdContainer;
    }
  };

  const getIndicatorColor = () => {
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    if (variant === 'secondary') return colors.textPrimary;
    return colors.surface;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getSizeStyle(),
        getVariantContainerStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getIndicatorColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={[styles.baseText, getVariantTextStyle(), textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
  // Sizes
  smContainer: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  mdContainer: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  lgContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  // Variants
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.surface,
  },
  accentContainer: {
    backgroundColor: colors.accent,
  },
  accentText: {
    color: colors.surface,
  },
  secondaryContainer: {
    backgroundColor: colors.primaryLight,
  },
  secondaryText: {
    color: colors.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
  },
  dangerContainer: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.surface,
  },
  // Base Text
  baseText: {
    ...typography.bodyBold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
});

export default Button;
