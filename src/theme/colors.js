// Sistem Warna HuniHub
// Warna utama teal/biru tua, aksen oranye, netral abu hangat, dan warna status

export const colors = {
  // Brand Colors
  primary: '#0F4C5C', // Teal tua elegan
  primaryDark: '#0A2F39',
  primaryLight: '#E6F2F5',
  primaryMuted: '#1A6B80',

  accent: '#FB8B24', // Oranye aksen energetik
  accentDark: '#E07510',
  accentLight: '#FFF2E5',

  // Neutrals (Abu Hangat)
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  divider: '#E2E8F0',

  // Typography Colors
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  textLight: '#FFFFFF',
  textPlaceholder: '#CBD5E1',

  // Status Colors
  status: {
    pending: {
      text: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
      dot: '#F59E0B',
    },
    confirmed: {
      text: '#15803D',
      bg: '#DCFCE7',
      border: '#BBF7D0',
      dot: '#22C55E',
    },
    completed: {
      text: '#1D4ED8',
      bg: '#DBEAFE',
      border: '#BFDBFE',
      dot: '#3B82F6',
    },
    cancelled: {
      text: '#B91C1C',
      bg: '#FEE2E2',
      border: '#FECACA',
      dot: '#EF4444',
    },
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.45)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  shimmer: '#E2E8F0',
};

export default colors;
