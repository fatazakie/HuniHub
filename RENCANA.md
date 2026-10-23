# RENCANA PENGEMBANGAN APLIKASI HUNIHUB

Dokumen ini merupakan peta jalan (blueprint) arsitektur, spesifikasi teknis, daftar berkas, dan tahapan pengerjaan (milestone) untuk pembangunan aplikasi **HuniHub** dari nol.

---

## 1. Ringkasan Produk & Arsitektur Solusi

- **Nama Aplikasi**: HuniHub
- **Fungsi Utama**: Platform pemesanan (booking) hunian ala hotel (kamar, kos, villa, apartemen).
- **Target Pengguna**:
  - **Guest (Tamu)**: Menjelajahi hunian, filter & sortir, reservasi tanggal tanpa double-booking, manajemen favorit, melihat riwayat booking & pembatalan booking pending.
  - **Admin**: Dashboard statistik (pendapatan, jumlah hunian, okupansi), manajemen properti (CRUD hunian, multi-image upload, toggle ketersediaan), manajemen status booking (Setujui, Tolak, Selesaikan).
- **Bahasa & Mata Uang**: Bahasa Indonesia & Rupiah (IDR).
- **Platform Sasaran**: Android via Expo Go.
- **Bahasa Pemrograman**: JavaScript murni (bukan TypeScript).
- **Prinsip Arsitektur**:
  - **Modular Service Layer**: Komponen UI/Screen **dilarang keras** memanggil Firestore/Auth secara langsung. Semua interaksi database wajib melalui modul di `src/services/`.
  - **Clean State Management**: Menggunakan React Context (`AuthContext`) untuk status autentikasi & sesi pengguna, serta custom hooks (`useProperties`, `useBookings`, `useFavorites`) untuk fetching dan reaktifitas data.
  - **Zero Native Build Requirement**: Seluruh pustaka 100% kompatibel dengan Expo Go standar.

---

## 2. Keputusan Teknis & Spesifikasi

| Aspek | Keputusan / Library | Alasan & Spesifikasi |
|---|---|---|
| **Framework** | Expo SDK (Blank JavaScript template) | Kompatibel penuh dengan Expo Go, setup cepat dan terstandar. |
| **Navigasi** | `@react-navigation/native-stack` & `@react-navigation/bottom-tabs` | Navigasi natif standar industri; native stack untuk performa layar, bottom-tabs untuk antarmuka utama guest & admin. |
| **Backend & DB** | Firebase JS SDK v9+ (Modular) | `firebase/auth`, `firebase/firestore`, `firebase/storage`. Menggunakan sintaks modular (`doc`, `getDoc`, `runTransaction`, dll). |
| **Auth Persistence** | `@react-native-async-storage/async-storage` via `initializeAuth` + `getReactNativePersistence` | Menjaga sesi login tetap tersimpan saat aplikasi ditutup dan dibuka kembali. |
| **Ikon** | `@expo/vector-icons` (Ionicons / MaterialCommunityIcons) | Tersedia out-of-the-box di Expo Go tanpa library native tambahan. |
| **Kalender** | `react-native-calendars` | Kalender interaktif untuk memilih rentang check-in & check-out serta menandai (marking) tanggal yang sudah dibooking. |
| **Pemilihan Gambar** | `expo-image-picker` | Upload foto properti oleh admin via galeri perangkat. |
| **Konfigurasi Env** | Variabel `EXPO_PUBLIC_*` via `.env` | Aman, tidak melakukan hardcode kunci API, disediakan `.env.example`. |
| **Validasi Double Booking** | Query overlap tanggal + `runTransaction` Firestore | Kondisi overlap: `!(reqCheckOut <= existingCheckIn || reqCheckIn >= existingCheckOut)` untuk status `pending` dan `confirmed`. |

---

## 3. Desain Sistem & Panduan UI/UX (`src/theme`)

- **Palet Warna**:
  - `primary`: `#0F4C5C` (Teal Tua / Deep Teal - elegan, terpercaya)
  - `primaryDark`: `#0A2F39`
  - `primaryLight`: `#E6F2F5`
  - `accent`: `#FB8B24` (Oranye cerah untuk CTA, rating, dan badge sorotan)
  - `background`: `#F8F9FA` (Abu terang hangat untuk kontras nyaman)
  - `surface`: `#FFFFFF` (Putih murni untuk kartu & modal)
  - `textPrimary`: `#1A202C`
  - `textSecondary`: `#718096`
  - `border`: `#E2E8F0`
  - `status`:
    - `pending`: `#D97706` (Amber/Kuning tua) & background `#FEF3C7`
    - `confirmed`: `#15803D` (Hijau) & background `#DCFCE7`
    - `completed`: `#1D4ED8` (Biru) & background `#DBEAFE`
    - `cancelled`: `#B91C1C` (Merah) & background `#FEE2E2`
- **Tipografi**:
  - `h1`: 24px (Bold)
  - `h2`: 20px (Bold)
  - `h3`: 18px (SemiBold)
  - `body`: 14px (Regular)
  - `bodyBold`: 14px (SemiBold)
  - `caption`: 12px (Regular/Medium)
- **Metrik Spacing & Radius**:
  - Kelipatan 8: `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 40`.
  - Radius: `sm: 8`, `md: 12`, `lg: 16`, `full: 9999`.
- **Elemen UI Wajib di Setiap Layar**:
  - State Loading: Menggunakan komponen `Skeleton.js` animasi pulsa lembut.
  - State Kosong: Menggunakan `EmptyState.js` dengan ilustrasi ikon, judul, pesan, dan tombol aksi opsional.
  - State Error: Menggunakan `ErrorState.js` dengan tombol "Coba Lagi".
  - SafeAreaView, KeyboardAvoidingView untuk form, dan `RefreshControl` (pull-to-refresh) pada daftar.

---

## 4. Struktur Folder & Daftar Berkas

```text
HuniHub/
├── .env.example
├── .gitignore
├── app.json
├── babel.config.js
├── firestore.rules
├── storage.rules
├── package.json
├── README.md
├── RENCANA.md
├── scripts/
│   └── seedData.js
└── src/
    ├── components/
    │   ├── Button.js              # Tombol primer, sekunder, outline, danger + loading state
    │   ├── Input.js               # Text input dengan label, helper, error, dan ikon
    │   ├── PropertyCard.js        # Kartu hunian: gambar, harga bold, lokasi, rating, badge tipe, tombol favorit
    │   ├── StatusBadge.js         # Badge status booking berwarna dinamis (pending, confirmed, dll)
    │   ├── EmptyState.js          # Tampilan saat data kosong
    │   ├── Skeleton.js            # Loading placeholder shimmer/pulsa
    │   ├── ErrorState.js          # Tampilan error + tombol retry
    │   ├── SectionHeader.js       # Header bagian dengan judul & tombol "Lihat Semua"
    │   ├── ConfirmDialog.js       # Modal konfirmasi aksi destruktif/penting
    │   └── ImageCarousel.js       # Galeri geser gambar properti
    ├── context/
    │   └── AuthContext.js         # State user, role ('guest'|'admin'), loading, login, register, logout
    ├── hooks/
    │   ├── useProperties.js       # Fetch & filter properti real-time / refreshable
    │   ├── useBookings.js         # Fetch riwayat booking (guest atau admin)
    │   └── useFavorites.js        # Ambil list favorit & toggle favorit
    ├── navigation/
    │   ├── RootNavigator.js       # Pengarah rute utama (AuthStack vs GuestTabs vs AdminTabs)
    │   ├── AuthStack.js           # Stack Onboarding, Login, Register, ForgotPassword
    │   ├── GuestTabs.js           # Bottom tabs: Beranda, Eksplorasi, Favorit, Pesanan Saya, Profil
    │   └── AdminTabs.js           # Bottom tabs: Dashboard, Kelola Hunian, Kelola Booking, Profil
    ├── screens/
    │   ├── auth/
    │   │   ├── OnboardingScreen.js       # 3 slide intro pengenalan aplikasi (disimpan di AsyncStorage)
    │   │   ├── LoginScreen.js            # Form email & password + opsi lupa password
    │   │   ├── RegisterScreen.js         # Form nama, email, no HP, password (role default 'guest')
    │   │   └── ForgotPasswordScreen.js   # Reset password via email Firebase
    │   ├── guest/
    │   │   ├── HomeScreen.js             # Sapaan nama, search bar, kategori tipe, rekomendasi, populer
    │   │   ├── ExploreScreen.js          # Pencarian kata kunci, modal filter (tipe, harga, fasilitas, kota), sorting
    │   │   ├── PropertyDetailScreen.js   # Galeri swipe, deskripsi, fasilitas berikon, lokasi, sticky bar harga & pesan
    │   │   ├── BookingFormScreen.js      # Kalender range checkin/checkout, tamu, catatan, cek bentrok tanggal
    │   │   ├── BookingSummaryScreen.js   # Rincian biaya, durasi, data pemesan, konfirmasi simpan (status pending)
    │   │   ├── MyBookingsScreen.js       # Tab status (Menunggu, Dikonfirmasi, Selesai, Dibatalkan), batalkan pending
    │   │   ├── BookingDetailScreen.js    # Detail lengkap reservasi & instruksi check-in
    │   │   ├── FavoritesScreen.js        # Daftar hunian favorit pengguna
    │   │   └── ProfileScreen.js          # Edit profil (nama, no HP), info akun, tombol logout
    │   └── admin/
    │       ├── DashboardScreen.js        # Total booking, pendapatan, total properti, daftar booking terbaru
    │       ├── PropertyListScreen.js     # Daftar hunian kelolaan + toggle status ketersediaan
    │       ├── PropertyFormScreen.js     # Form tambah/edit hunian, upload multi-gambar, fasilitas checklist
    │       ├── BookingListScreen.js      # Daftar semua booking dengan filter status & tab
    │       ├── AdminBookingDetailScreen.js # Aksi Setujui (Confirmed), Tolak (Cancelled), Selesaikan (Completed)
    │       └── AdminProfileScreen.js     # Informasi admin & tombol logout
    ├── services/
    │   ├── firebase.js            # Inisialisasi Firebase App, Auth (AsyncStorage persistence), Firestore, Storage
    │   ├── authService.js         # login, register, logout, sendPasswordReset, getUserProfile, updateUserProfile
    │   ├── propertyService.js     # getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, toggleAvailability
    │   ├── bookingService.js      # createBooking (dengan proteksi bentrok tanggal), getGuestBookings, getAllBookings, updateBookingStatus, cancelBooking, getBookedDateRanges
    │   ├── favoriteService.js     # getFavoritesByUser, toggleFavorite, isPropertyFavorite
    │   └── storageService.js      # uploadImageAsync, uploadMultipleImagesAsync
    ├── theme/
    │   ├── colors.js
    │   ├── spacing.js
    │   ├── typography.js
    │   └── index.js
    └── utils/
        ├── formatRupiah.js        # Format angka ke "Rp 750.000"
        ├── dateHelper.js          # Format tanggal Indonesia, hitung selisih malam, validasi range
        ├── validators.js          # Validasi email, password, no HP, form properti & booking
        └── firebaseErrors.js      # Penerjemah kode error Firebase Auth/Firestore ke pesan ramah bahasa Indonesia
```

---

## 5. Model Data Firestore

1. **`users/{uid}`**
   ```json
   {
     "name": "Budi Santoso",
     "email": "budi@example.com",
     "phone": "081234567890",
     "role": "guest", // atau "admin"
     "createdAt": "2026-10-15T00:00:00.000Z"
   }
   ```
2. **`properties/{id}`**
   ```json
   {
     "name": "Villa Puncak Asri",
     "type": "villa", // 'kamar' | 'kos' | 'villa' | 'apartemen'
     "description": "Villa nyaman dengan pemandangan pegunungan hijau...",
     "pricePerNight": 850000,
     "address": "Jl. Raya Puncak KM 85",
     "city": "Bogor",
     "facilities": ["wifi", "ac", "kolam_renang", "parkir", "dapur"],
     "images": ["https://images.unsplash.com/..."],
     "rating": 4.8,
     "isAvailable": true,
     "createdAt": "2026-10-15T00:00:00.000Z"
   }
   ```
3. **`bookings/{id}`**
   ```json
   {
     "userId": "uid_tamu",
     "userName": "Budi Santoso",
     "userPhone": "081234567890",
     "propertyId": "prop_123",
     "propertyName": "Villa Puncak Asri",
     "propertyImage": "https://images.unsplash.com/...",
     "checkIn": "2026-10-20",
     "checkOut": "2026-10-23",
     "nights": 3,
     "guests": 4,
     "totalPrice": 2550000,
     "notes": "Tiba sore sekitar jam 16:00",
     "status": "pending", // 'pending' | 'confirmed' | 'completed' | 'cancelled'
     "createdAt": "2026-10-15T00:00:00.000Z"
   }
   ```
4. **`favorites/{uid_propertyId}`**
   ```json
   {
     "userId": "uid_tamu",
     "propertyId": "prop_123",
     "createdAt": "2026-10-15T00:00:00.000Z"
   }
   ```

---

## 6. Rincian Milestone & Kriteria Keberhasilan (DoD)

### Milestone 1: Fondasi Proyek & Desain Sistem
- [ ] Inisialisasi proyek Expo SDK (JavaScript murni).
- [ ] Pemasangan package resmi via `npx expo install`:
  - `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
  - `react-native-screens`, `react-native-safe-area-context`
  - `@react-native-async-storage/async-storage`
  - `@expo/vector-icons`, `expo-image-picker`
  - `react-native-calendars`
  - `firebase`
- [ ] Setup `.env.example` dan template konfigurasi Firebase di `src/services/firebase.js` dengan fallback aman.
- [ ] Pembuatan modul `src/theme/` (colors, spacing, typography).
- [ ] Pembuatan utilitas di `src/utils/` (`formatRupiah`, `dateHelper`, `validators`, `firebaseErrors`).
- [ ] Pembuatan komponen UI dasar di `src/components/` (`Button`, `Input`, `StatusBadge`, `EmptyState`, `Skeleton`, `ErrorState`, `SectionHeader`, `ConfirmDialog`, `PropertyCard`).
- **Verifikasi M1**: Aplikasi dapat dijalankan tanpa error di Expo Go menampilkan showcase/fondasi awal.

### Milestone 2: Autentikasi & Navigasi Berbasis Role
- [ ] Implementasi `authService.js` (login, register, logout, reset password, update profile).
- [ ] Implementasi `AuthContext.js` dengan state listener `onAuthStateChanged`, pembacaan dokumen `users/{uid}`, dan session role (`guest` vs `admin`).
- [ ] Layar `OnboardingScreen.js` (3 slide pengenalan, flag persistensi `hasSeenOnboarding` di AsyncStorage).
- [ ] Layar `LoginScreen.js`, `RegisterScreen.js` (role default guest), `ForgotPasswordScreen.js`.
- [ ] Penerjemahan pesan kesalahan Firebase Auth ke bahasa Indonesia ramah pengguna.
- [ ] `RootNavigator.js` yang secara otomatis mengarahkan:
  - Belum login -> `AuthStack` (atau `OnboardingScreen` jika baru pertama).
  - Login role `guest` -> `GuestTabs`.
  - Login role `admin` -> `AdminTabs`.
- **Verifikasi M2**: Alur register, login, logout, dan navigasi peran berjalan mulus di Expo Go.

### Milestone 3: Alur Guest (Lengkap & Teruji)
- [ ] Layar `HomeScreen.js`: Sapaan nama user, banner promosi, pencarian cepat, tombol kategori (Kamar, Kos, Villa, Apartemen), daftar rekomendasi & terpopuler, pull-to-refresh.
- [ ] Layar `ExploreScreen.js`: Input pencarian real-time, tombol modal filter (pilihan kota, tipe hunian, rentang harga, fasilitas), pengurutan (harga terendah/tertinggi, rating).
- [ ] Layar `PropertyDetailScreen.js`: Carousel foto hunian, informasi harga tebal, detail lokasi, deskripsi lengkap, daftar fasilitas dengan ikon, status ketersediaan, sticky bottom bar (harga + tombol "Pesan Sekarang").
- [ ] Layar `BookingFormScreen.js`:
  - Kalender interaktif (`react-native-calendars`) dengan highlight tanggal yang sudah dibooking orang lain.
  - Pemilihan tanggal check-in & check-out, kalkulasi jumlah malam & total harga otomatis.
  - Input jumlah tamu & catatan khusus.
  - Validasi ketat bentrok tanggal sebelum lanjut.
- [ ] Layar `BookingSummaryScreen.js`: Review rincian booking & identitas tamu, konfirmasi simpan booking dengan status `pending` melalui transaksi Firestore.
- [ ] Layar `MyBookingsScreen.js`: Tab filter status (Semua, Menunggu, Dikonfirmasi, Selesai, Dibatalkan), kartu booking informatif, opsi batalkan untuk booking berstatus `pending`.
- [ ] Layar `BookingDetailScreen.js`: Tampilan lengkap rincian pesanan dan kode booking.
- [ ] Layar `FavoritesScreen.js`: Manajemen hunian favorit (toggle langsung dari card atau detail).
- [ ] Layar `ProfileScreen.js`: Edit nama & no HP, info aplikasi, tombol keluar akun.
- **Verifikasi M3**: Seluruh pengalaman tamu dari menjelajah hingga booking dan melihat riwayat berjalan lancar tanpa bentrok.

### Milestone 4: Alur Admin (Manajemen & Operasional)
- [ ] Layar `DashboardScreen.js`: Metrik ringkasan (total booking, pendapatan terakumulasi dari status confirmed/completed, total hunian aktif), daftar reservasi terbaru.
- [ ] Layar `PropertyListScreen.js`: Daftar hunian kelolaan, switch toggle ketersediaan langsung, tombol hapus dengan `ConfirmDialog`.
- [ ] Layar `PropertyFormScreen.js`: Form tambah & edit hunian, pemilihan banyak gambar via `expo-image-picker` & upload ke Firebase Storage / URL image, checklist fasilitas, validasi data lengkap.
- [ ] Layar `BookingListScreen.js`: Daftar seluruh pesanan dari seluruh tamu dengan tab status.
- [ ] Layar `AdminBookingDetailScreen.js`: Aksi operasional admin: Setujui (ubah ke `confirmed`), Tolak (ubah ke `cancelled`), dan Selesaikan (ubah ke `completed`).
- [ ] Layar `AdminProfileScreen.js`: Profil admin & logout.
- **Verifikasi M4**: Admin dapat mengelola hunian dan merespons booking tamu secara real-time.

### Milestone 5: Keamanan, Demo Data, Polish & Dokumentasi
- [ ] Penulisan berkas `firestore.rules` berbasis role (guest & admin).
- [ ] Penulisan berkas `storage.rules` (akses baca publik, tulis hanya admin).
- [ ] Script demo data (`scripts/seedData.js` / seeder internal) yang memuat minimal 8 properti variatif di berbagai kota Indonesia (Jakarta, Bandung, Bali, Yogyakarta, Malang) dengan foto Unsplash berlisensi bebas.
- [ ] Dokumentasi lengkap `README.md` (arsitektur, panduan setup Firebase, pembuatan akun admin, akun demo, alur booking, dan troubleshooting).
- [ ] Pemeriksaan akhir lint/syntax & kestabilan di Expo Go.
- **Verifikasi M5**: Proyek siap produksi/demo, aman, dan terdokumentasi rapi.

---

## 7. Catatan Mengenai Kredensial Firebase

Sebelum eksekusi Milestone 2 (Auth), konfigurasi Firebase akan menggunakan variabel lingkungan `EXPO_PUBLIC_FIREBASE_*` di berkas `.env`. Jika kredensial belum diisi oleh pengguna, `src/services/firebase.js` akan dirancang dengan penanganan error anggun (graceful warning) agar aplikasi tetap dapat menampilkan UI dan tidak langsung crash di Expo Go.
