# HuniHub - Aplikasi Booking Hunian Mobile & Web

HuniHub adalah aplikasi pemesanan (*booking*) hunian bergaya hotel (kamar, kos, villa, dan apartemen) yang dibangun menggunakan **React Native (Expo SDK 57)** dan **Firebase Modular (v9+)**. Aplikasi ini mendukung dua peran pengguna: **Guest (Tamu)** dan **Administrator**, dengan antarmuka berbahasa Indonesia dan mata uang Rupiah (IDR).

---

## 📱 Daftar Fitur Utama

### 1. Autentikasi & Akun
- **Onboarding Interaktif**: 3 slide pengenalan aplikasi dengan penyimpanan status ke `AsyncStorage` (hanya tampil pada instalasi pertama).
- **Registrasi Akun Tamu**: Pendaftaran (Nama, Email, No HP/WhatsApp, Password) yang otomatis menetapkan peran `role: "guest"`.
- **Masuk & Lupa Kata Sandi**: Pesan error Firebase diterjemahkan ke bahasa Indonesia yang ramah pengguna.
- **Navigasi Berbasis Peran**: Pengalihan rute otomatis ke antarmuka Guest atau Admin setelah login.
- **Sesi Persisten**: Menggunakan `AsyncStorage` (Android) dan *Browser Storage* (Web) agar sesi login tidak hilang saat aplikasi ditutup.

### 2. Fitur Tamu (Guest)
- **Beranda (Home)**: Sapaan nama tamu, bilah pencarian cepat, filter kategori hunian (Semua, Villa, Apartemen, Kamar, Kos), slider rekomendasi rating terbaik, dan hunian populer.
- **Eksplorasi & Filter (Explore)**: Pencarian nama/kota/alamat, filter kota populer, modal filter tipe hunian, fasilitas checklist, serta pengurutan (Terbaru, Rating Tertinggi, Harga Termurah, Harga Termahal).
- **Detail Hunian (Property Detail)**: Galeri foto swipe dengan indikator dot & counter, fasilitas berikon, lokasi, rating, ulasan, kebijakan menginap, serta *sticky bottom action bar* harga & tombol pesan.
- **Formulir Pemesanan (Booking Form)**:
  - Kalender interaktif (`react-native-calendars`) yang **menandai merah tanggal yang sudah terisi**.
  - **Pencegahan Bentrok Tanggal**: Sistem secara otomatis menolak pemilihan rentang tanggal yang bertabrakan dengan pesanan `pending` atau `confirmed`.
  - Kalkulasi jumlah malam dan total harga otomatis (`malam × harga per malam`).
  - Pengatur jumlah tamu (stepper) dan input catatan khusus.
- **Ringkasan Pesanan (Booking Summary)**: Rincian lengkap menginap dan data pemesan. Disimpan dengan status `pending` menggunakan transaksi atomik Firestore (`runTransaction`).
- **Pesanan Saya (My Bookings)**: Tab filter status (**Semua**, **Menunggu**, **Dikonfirmasi**, **Selesai**, **Dibatalkan**). Tamu dapat membatalkan pesanan yang masih berstatus `pending`.
- **Detail Reservasi (Booking Detail)**: Kode booking unik, rincian biaya, serta instruksi check-in di lokasi.
- **Favorit (Favorites)**: Penandaan hunian favorit dengan tombol hati (sinkron di kartu dan detail).
- **Profil Tamu (Profile)**: Edit nama & no HP WhatsApp, informasi aplikasi, dan logout berdialog konfirmasi.

### 3. Fitur Administrator
- **Dashboard Statistik**: Metrik total pendapatan (dari booking `confirmed` dan `completed`), total pemesanan, jumlah hunian aktif, okupansi berjalan, dan 5 reservasi terbaru.
- **Kelola Hunian (Property List)**: Daftar hunian, toggle switch ketersediaan langsung (*Tersedia* vs *Penuh*), tombol edit, dan tombol hapus.
- **Formulir Hunian (Property Form)**: Tambah & ubah data hunian, pemilihan banyak foto dari galeri HP via `expo-image-picker` & upload ke Firebase Storage, checklist fasilitas lengkap, dan validasi data.
- **Kelola Reservasi (Booking List)**: Filter status dan aksi operasional admin:
  - **Setujui Pesanan** (`confirmed`)
  - **Tolak Pesanan** (`cancelled`) — tanggal otomatis dibuka kembali untuk tamu lain
  - **Tandai Selesai** (`completed`)
- **Detail Reservasi Admin**: Rincian pemesan, kontak WhatsApp tamu, catatan tamu, dan tindakan operasional.
- **Dialog Konfirmasi**: Seluruh aksi penting atau destruktif dilindungi modal konfirmasi (`ConfirmDialog`).

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: React Native via Expo SDK 57 (JavaScript murni)
- **Navigasi**: React Navigation 7 (`@react-navigation/native-stack` & `@react-navigation/bottom-tabs`)
- **Backend & Database**: Firebase Modular JS SDK (`firebase/auth`, `firebase/firestore`, `firebase/storage`)
- **Komponen UI**: `@expo/vector-icons`, `react-native-calendars`, `expo-image-picker`, `expo-font`
- **Platform**: Android via **Expo Go** & Browser lokal (**Web Preview**)
- **Arsitektur Service Layer**: Seluruh pemanggilan database diisolasi di `src/services/` (Screen tidak memanggil Firestore langsung).

---

## 📂 Struktur Folder

```text
HuniHub/
├── .env                  # Konfigurasi kredensial Firebase aktif
├── .env.example          # Panduan variabel lingkungan
├── app.json              # Konfigurasi Expo & Android adaptive icon
├── firestore.rules       # Aturan keamanan database berbasis peran
├── storage.rules         # Aturan keamanan penyimpanan foto
├── package.json          # Dependensi & skrip
├── README.md             # Dokumentasi lengkap proyek
├── scripts/
│   └── seedRunner.js     # Script CLI mandiri untuk mengisi data awal
└── src/
    ├── components/       # Komponen reusable (Button, Input, PropertyCard, StatusBadge, dll.)
    ├── context/          # AuthContext (manajemen sesi, role, dan onboarding)
    ├── hooks/            # Custom hooks (useProperties, useBookings, useFavorites)
    ├── navigation/       # RootNavigator, AuthStack, GuestTabs, AdminTabs
    ├── screens/
    │   ├── auth/         # Onboarding, Login, Register, ForgotPassword
    │   ├── guest/        # Home, Explore, Detail, Booking, Summary, MyBookings, Favorites, Profile
    │   └── admin/        # Dashboard, PropertyList, PropertyForm, BookingList, AdminProfile
    ├── services/         # firebase, authService, propertyService, bookingService, favoriteService, storageService
    ├── theme/            # colors, spacing, typography
    └── utils/            # formatRupiah, dateHelper, validators, firebaseErrors, seedData
```

---

## ⚙️ Panduan Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru (misal: `hunihub-app`).
2. **Aktifkan Authentication**:
   - Masuk ke menu **Build** > **Authentication** > **Sign-in method**.
   - Aktifkan provider **Email/Password**.
3. **Aktifkan Firestore Database**:
   - Masuk ke menu **Build** > **Firestore Database** > klik **Create database**.
   - Pilih mode awal (*test mode* atau *production mode*) dan lokasi terdekat (`asia-southeast2` Jakarta).
4. **Aktifkan Cloud Storage**:
   - Masuk ke menu **Build** > **Storage** > klik **Get started**.
5. **Daftarkan Web App**:
   - Di Project Overview, klik ikon Web `</>`.
   - Beri nama aplikasi (misal: `HuniHub Web`).
   - Salin kredensial ke berkas `.env` seperti berikut:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

---

## 👑 Cara Membuat Akun Admin

Untuk alasan keamanan, formulir registrasi di aplikasi hanya membuat akun dengan peran `guest`. Akun Administrator dibuat melalui langkah manual berikut:

1. Buka aplikasi HuniHub dan lakukan pendaftaran akun baru melalui layar **Daftar Akun** (misal dengan email `admin@hunihub.id`).
2. Buka [Firebase Console](https://console.firebase.google.com/) > pilih proyek Anda.
3. Masuk ke menu **Firestore Database** > buka koleksi **`users`**.
4. Cari dokumen pengguna yang sesuai dengan UID akun admin yang baru didaftarkan.
5. Ubah nilai field **`role`** dari `"guest"` menjadi **`"admin"`**.
6. Simpan perubahan. Saat pengguna masuk kembali ke aplikasi, **RootNavigator** akan otomatis membaca peran admin dan mengarahkan ke **Panel Admin (AdminTabs)**!

---

## 🛡️ Deploy Aturan Keamanan (Security Rules)

### Firestore Rules
1. Buka **Firestore Database** di Firebase Console > klik tab **Rules**.
2. Salin seluruh isi dari berkas [`firestore.rules`](file:///d:/HuniHub/firestore.rules) pada repositori ini.
3. Klik **Publish**.

### Storage Rules
1. Buka **Storage** di Firebase Console > klik tab **Rules**.
2. Salin seluruh isi dari berkas [`storage.rules`](file:///d:/HuniHub/storage.rules) pada repositori ini.
3. Klik **Publish**.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan dependensi telah terinstal:
```bash
npm install
```

### 1. Menjalankan di Browser (Pratinjau Lokal)
```bash
npx expo start --web
```
Aplikasi akan otomatis terbuka di browser lokal Anda pada `http://localhost:8081`.

### 2. Menjalankan di Android via Expo Go
```bash
npx expo start
```
Buka aplikasi **Expo Go** di HP Android Anda, lalu scan QR Code yang muncul di terminal (pastikan HP dan laptop berada dalam jaringan WiFi yang sama).

### 3. Mengisi Data Demo (Seeding)
Jika database Firestore Anda masih kosong, Anda dapat menjalankan seeder data 8 hunian unik di kota-kota Indonesia dengan perintah:
```bash
npm run seed
```
*(Catatan: Aplikasi juga memiliki auto-seeder bawaan di Beranda yang akan otomatis mengisi hunian demo jika koleksi terdeteksi kosong)*.

---

## 🔄 Alur Pemesanan (Booking Flow)

```text
[ Beranda / Eksplorasi ]
         │
         ▼
[ Detail Hunian ] ──> Lihat fasilitas, foto, ulasan & harga
         │
         ▼
[ Form Pemesanan ] ──> Pilih rentang tanggal di Kalender
                       (Sistem otomatis mengecek bentrok tanggal)
         │
         ▼
[ Ringkasan Pesanan ] ──> Rincian biaya & data pemesan
         │
         ▼ (Simpan dengan transaksi atomik)
[ Pesanan Berstatus Pending ] ──> Masuk ke tab "Menunggu"
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
   [ Tamu Membatalkan ]                   [ Admin Menyetujui ]
(Ubah status ke cancelled)             (Ubah status ke confirmed)
                                                   │
                                                   ▼
                                         [ Selesai Menginap ]
                                      (Ubah status ke completed)
```
