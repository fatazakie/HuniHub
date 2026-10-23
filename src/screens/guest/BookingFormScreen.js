import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { formatRupiah } from '../../utils/formatRupiah';
import {
  getTodayString,
  calculateNights,
  buildMarkedDates,
  formatDateIndo,
} from '../../utils/dateHelper';
import bookingService from '../../services/bookingService';

export const BookingFormScreen = ({ route, navigation }) => {
  const property = route.params?.property;

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');

  const [bookedRanges, setBookedRanges] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [validationError, setValidationError] = useState('');

  // Ambil tanggal-tanggal yang sudah dibooking orang lain untuk properti ini
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!property?.id) return;
      try {
        const ranges = await bookingService.getBookedDateRanges(property.id);
        setBookedRanges(ranges);
      } catch (err) {
        console.error('Error loading booked dates:', err);
      } finally {
        setLoadingCalendar(false);
      }
    };
    fetchBookedDates();
  }, [property?.id]);

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * (Number(property?.pricePerNight) || 0);

  // Penanganan klik tanggal pada kalender
  const handleDayPress = (day) => {
    setValidationError('');
    const selectedDate = day.dateString;

    // Cek apakah tanggal yang diklik adalah tanggal yang sudah terisi
    const isBooked = bookedRanges.some((range) => {
      return selectedDate >= range.checkIn && selectedDate < range.checkOut;
    });

    if (isBooked) {
      const msg = 'Tanggal ini telah terisi atau dipesan oleh tamu lain.';
      setValidationError(msg);
      if (Platform.OS !== 'web') Alert.alert('Tanggal Penuh', msg);
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      // Mulai pilihan baru (Check-in)
      setCheckIn(selectedDate);
      setCheckOut('');
    } else if (checkIn && !checkOut) {
      // Pilih Check-out
      if (selectedDate <= checkIn) {
        // Jika memilih tanggal yang sama atau lebih awal, ganti check-in
        setCheckIn(selectedDate);
      } else {
        // Cek apakah ada tanggal bentrok di tengah rentang yang dipilih
        const hasConflictBetween = bookedRanges.some((range) => {
          return range.checkIn < selectedDate && range.checkOut > checkIn;
        });

        if (hasConflictBetween) {
          const msg = 'Terdapat tanggal yang sudah terisi di antara rentang yang Anda pilih.';
          setValidationError(msg);
          if (Platform.OS !== 'web') Alert.alert('Bentrok Tanggal', msg);
          return;
        }

        setCheckOut(selectedDate);
      }
    }
  };

  const handleContinue = async () => {
    if (!checkIn || !checkOut) {
      setValidationError('Silakan pilih tanggal check-in dan check-out di kalender.');
      return;
    }

    if (nights <= 0) {
      setValidationError('Durasi menginap minimal 1 malam.');
      return;
    }

    // Verifikasi bentrok tanggal sekali lagi
    try {
      const isConflict = await bookingService.checkDateConflict(
        property.id,
        checkIn,
        checkOut
      );
      if (isConflict) {
        setValidationError(
          'Rentang tanggal yang Anda pilih bentrok dengan pesanan lain. Silakan ubah tanggal.'
        );
        return;
      }

      navigation.navigate('BookingSummary', {
        property,
        bookingDraft: {
          propertyId: property.id,
          propertyName: property.name,
          propertyImage: property.images?.[0] || '',
          pricePerNight: property.pricePerNight,
          checkIn,
          checkOut,
          nights,
          guests,
          totalPrice,
          notes,
        },
      });
    } catch (err) {
      setValidationError('Gagal memverifikasi ketersediaan tanggal.');
    }
  };

  const markedDates = buildMarkedDates(checkIn, checkOut, bookedRanges);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Pilih Tanggal Menginap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ringkasan Singkat Hunian */}
        <View style={styles.propertySnippet}>
          <Ionicons name="business-outline" size={20} color={colors.primary} />
          <View style={styles.snippetInfo}>
            <Text style={styles.snippetName} numberOfLines={1}>{property?.name}</Text>
            <Text style={styles.snippetPrice}>
              {formatRupiah(property?.pricePerNight)} / malam
            </Text>
          </View>
        </View>

        {/* Legend Kalender */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Dipilih</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444', borderWidth: 1 }]} />
            <Text style={styles.legendText}>Terisi (Penuh)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} />
            <Text style={styles.legendText}>Tersedia</Text>
          </View>
        </View>

        {/* Kalender Interaktif */}
        <View style={styles.calendarCard}>
          <Calendar
            minDate={getTodayString()}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            theme={{
              todayTextColor: colors.accent,
              arrowColor: colors.primary,
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              monthTextColor: colors.textPrimary,
            }}
          />
        </View>

        {/* Kotak Info Tanggal Terpilih */}
        <View style={styles.selectedDatesBox}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>
              {checkIn ? formatDateIndo(checkIn, true) : 'Pilih Tanggal'}
            </Text>
          </View>

          <View style={styles.nightBadge}>
            <Ionicons name="moon" size={14} color={colors.primary} />
            <Text style={styles.nightText}>{nights} Malam</Text>
          </View>

          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>
              {checkOut ? formatDateIndo(checkOut, true) : 'Pilih Tanggal'}
            </Text>
          </View>
        </View>

        {/* Alert Error Bentrok / Belum Pilih */}
        {!!validationError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBoxText}>{validationError}</Text>
          </View>
        )}

        {/* Pengaturan Jumlah Tamu */}
        <View style={styles.guestCounterCard}>
          <View>
            <Text style={styles.cardTitle}>Jumlah Tamu</Text>
            <Text style={styles.cardSubtitle}>Kapasitas rekomendasi 1-6 orang</Text>
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              style={[styles.stepperBtn, guests <= 1 && styles.stepperBtnDisabled]}
            >
              <Ionicons name="remove" size={18} color={guests <= 1 ? colors.textMuted : colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>{guests}</Text>

            <TouchableOpacity
              onPress={() => setGuests(Math.min(10, guests + 1))}
              disabled={guests >= 10}
              style={[styles.stepperBtn, guests >= 10 && styles.stepperBtnDisabled]}
            >
              <Ionicons name="add" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Catatan Tambahan */}
        <View style={styles.notesCard}>
          <Input
            label="Catatan Khusus (Opsional)"
            placeholder="Contoh: perkiraan waktu tiba jam 15:00 WIB, kamar bebas asap rokok"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar dengan Total Harga Otomatis */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Perkiraan</Text>
          <Text style={styles.bottomTotalAmount}>{formatRupiah(totalPrice)}</Text>
          <Text style={styles.bottomNights}>
            {nights > 0 ? `${nights} malam × ${formatRupiah(property?.pricePerNight)}` : 'Pilih rentang tanggal'}
          </Text>
        </View>

        <Button
          title="Lanjutkan"
          variant="accent"
          size="md"
          fullWidth={false}
          rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.surface} />}
          onPress={handleContinue}
          style={styles.continueBtn}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  propertySnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  snippetInfo: {
    flex: 1,
  },
  snippetName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  snippetPrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  selectedDatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  nightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
    marginHorizontal: spacing.sm,
  },
  nightText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.cancelled.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorBoxText: {
    ...typography.captionBold,
    color: colors.danger,
    flex: 1,
  },
  guestCounterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperValue: {
    ...typography.bodyBold,
    paddingHorizontal: spacing.sm,
    minWidth: 28,
    textAlign: 'center',
  },
  notesCard: {
    marginTop: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    elevation: 8,
  },
  bottomTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomTotalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  bottomNights: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  continueBtn: {
    paddingHorizontal: spacing.lg,
  },
});

export default BookingFormScreen;
