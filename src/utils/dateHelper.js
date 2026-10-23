// Utilitas tanggal dan kalender berbahasa Indonesia untuk HuniHub

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const NAMA_BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

/**
 * Format string tanggal YYYY-MM-DD atau Date object ke format Indonesia
 * Contoh: "2026-10-20" -> "20 Okt 2026"
 */
export const formatDateIndo = (dateInput, withDay = false) => {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length <= 10 ? 'T00:00:00' : '')) : new Date(dateInput);
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate();
  const month = NAMA_BULAN_PENDEK[d.getMonth()];
  const year = d.getFullYear();

  if (withDay) {
    const dayName = NAMA_HARI[d.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  }
  return `${day} ${month} ${year}`;
};

/**
 * Format string tanggal lengkap: "20 Oktober 2026"
 */
export const formatDateFull = (dateInput) => {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length <= 10 ? 'T00:00:00' : '')) : new Date(dateInput);
  if (isNaN(d.getTime())) return '-';

  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Mengubah objek Date menjadi format string YYYY-MM-DD
 */
export const toDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 */
export const getTodayString = () => {
  return toDateString(new Date());
};

/**
 * Mendapatkan tanggal besok dalam format YYYY-MM-DD
 */
export const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateString(tomorrow);
};

/**
 * Menghitung selisih malam antara check-in dan check-out
 * @param {string} checkInStr - YYYY-MM-DD
 * @param {string} checkOutStr - YYYY-MM-DD
 * @returns {number}
 */
export const calculateNights = (checkInStr, checkOutStr) => {
  if (!checkInStr || !checkOutStr) return 0;
  const d1 = new Date(checkInStr + 'T00:00:00');
  const d2 = new Date(checkOutStr + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Cek apakah dua rentang tanggal saling tumpang tindih (bentrok)
 * Overlap terjadi jika: !(reqCheckOut <= existingCheckIn || reqCheckIn >= existingCheckOut)
 */
export const doDateRangesOverlap = (checkIn1, checkOut1, checkIn2, checkOut2) => {
  const startA = new Date(checkIn1 + 'T00:00:00').getTime();
  const endA = new Date(checkOut1 + 'T00:00:00').getTime();
  const startB = new Date(checkIn2 + 'T00:00:00').getTime();
  const endB = new Date(checkOut2 + 'T00:00:00').getTime();

  return !(endA <= startB || startA >= endB);
};

/**
 * Menghasilkan markedDates untuk react-native-calendars
 * Menggabungkan tanggal yang sudah dipesan (disabled/merah) dan rentang yang sedang dipilih (teal)
 * @param {string} selectedCheckIn
 * @param {string} selectedCheckOut
 * @param {Array<{checkIn: string, checkOut: string}>} bookedRanges
 * @returns {object}
 */
export const buildMarkedDates = (selectedCheckIn, selectedCheckOut, bookedRanges = []) => {
  const marked = {};

  // 1. Tandai tanggal yang sudah dipesan orang lain (hanya pending & confirmed)
  bookedRanges.forEach((range) => {
    if (!range.checkIn || !range.checkOut) return;
    const cur = new Date(range.checkIn + 'T00:00:00');
    const end = new Date(range.checkOut + 'T00:00:00');

    while (cur < end) {
      const dateStr = toDateString(cur);
      marked[dateStr] = {
        disabled: true,
        disableTouchEvent: true,
        textColor: '#A0AEC0',
        color: '#FEE2E2',
        dotColor: '#EF4444',
        marked: true,
      };
      cur.setDate(cur.getDate() + 1);
    }
  });

  // 2. Tandai rentang tanggal yang sedang dipilih pengguna
  if (selectedCheckIn && !selectedCheckOut) {
    marked[selectedCheckIn] = {
      startingDay: true,
      endingDay: true,
      color: '#0F4C5C',
      textColor: '#FFFFFF',
      selected: true,
    };
  } else if (selectedCheckIn && selectedCheckOut) {
    const cur = new Date(selectedCheckIn + 'T00:00:00');
    const end = new Date(selectedCheckOut + 'T00:00:00');

    while (cur <= end) {
      const dateStr = toDateString(cur);
      const isStart = dateStr === selectedCheckIn;
      const isEnd = dateStr === selectedCheckOut;

      marked[dateStr] = {
        startingDay: isStart,
        endingDay: isEnd,
        color: isStart || isEnd ? '#0F4C5C' : '#E6F2F5',
        textColor: isStart || isEnd ? '#FFFFFF' : '#0F4C5C',
        selected: true,
      };
      cur.setDate(cur.getDate() + 1);
    }
  }

  return marked;
};

export default {
  formatDateIndo,
  formatDateFull,
  toDateString,
  getTodayString,
  getTomorrowString,
  calculateNights,
  doDateRangesOverlap,
  buildMarkedDates,
};
