// Penerjemah kode error Firebase ke bahasa Indonesia yang ramah pengguna

export const getFirebaseErrorMessage = (error) => {
  if (!error) return 'Terjadi kesalahan. Silakan coba lagi.';

  const code = error.code || (typeof error === 'string' ? error : '');

  switch (code) {
    // Auth Errors
    case 'auth/configuration-not-found':
      return 'Layanan Firebase Authentication belum diaktifkan di proyek Firebase Anda. Buka Firebase Console > menu Authentication > klik tombol "Get started" (Mulai), lalu aktifkan penyedia "Email/Password".';
    case 'auth/operation-not-allowed':
      return 'Metode login Email/Password belum diaktifkan di Firebase Console. Buka menu Authentication > Sign-in method di Firebase Console dan aktifkan Email/Password.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan oleh administrator.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini belum terdaftar. Silakan klik "Daftar Sekarang" di bawah untuk membuat akun baru.';
    case 'auth/wrong-password':
      return 'Kata sandi yang Anda masukkan salah.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Email atau kata sandi salah, atau akun belum dibuat di Firebase. Silakan daftar akun baru terlebih dahulu via link di bawah.';
    case 'auth/email-already-in-use':
      return 'Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lagi.';
    case 'auth/popup-closed-by-user':
      return 'Proses autentikasi dibatalkan oleh pengguna.';
    case 'auth/requires-recent-login':
      return 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali.';

    // Firestore Errors
    case 'permission-denied':
      return 'Izin ditolak oleh Firebase (Firestore Rules). Pastikan rules telah di-publish di Firebase Console.';
    case 'not-found':
      return 'Data yang diminta tidak ditemukan.';
    case 'already-exists':
      return 'Data sudah ada dalam sistem.';
    case 'resource-exhausted':
      return 'Kuota layanan tercapai. Coba beberapa saat lagi.';
    case 'cancelled':
      return 'Operasi dibatalkan.';
    case 'unavailable':
      return 'Layanan saat ini tidak dapat diakses. Coba lagi nanti.';

    // Storage Errors
    case 'storage/unauthorized':
      return 'Anda tidak memiliki akses untuk mengunggah atau melihat berkas.';
    case 'storage/canceled':
      return 'Pengunggahan berkas dibatalkan.';
    case 'storage/quota-exceeded':
      return 'Kapasitas penyimpanan telah penuh.';
    case 'storage/invalid-checksum':
      return 'Berkas rusak saat pengunggahan. Silakan coba lagi.';

    default:
      if (code) {
        return `Gagal masuk (${code}): ${error.message || 'Periksa konfigurasi akun Anda.'}`;
      }
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('network') || error.message.includes('offline')) {
          return 'Koneksi internet terputus. Pastikan perangkat Anda terhubung ke internet.';
        }
        return error.message;
      }
      return 'Terjadi kesalahan sistem. Silakan coba lagi nanti.';
  }
};

export default getFirebaseErrorMessage;
