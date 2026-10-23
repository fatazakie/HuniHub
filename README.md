# HuniHub — Aplikasi Booking Hunian Mobile & Web

HuniHub adalah aplikasi pemesanan hunian bergaya hotel yang mencakup kamar, kos, villa, dan apartemen. Aplikasi dibangun menggunakan **React Native dengan Expo SDK 57** dan **Firebase Modular SDK**. HuniHub menyediakan antarmuka berbahasa Indonesia, menggunakan mata uang Rupiah (IDR), dan mendukung dua peran pengguna: **Guest** dan **Administrator**.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Persiapan Firebase](#persiapan-firebase)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Mengisi Data Demo](#mengisi-data-demo)
- [Membuat Akun Administrator](#membuat-akun-administrator)
- [Deploy Security Rules](#deploy-security-rules)
- [Alur Pemesanan](#alur-pemesanan)

## Fitur Utama

### Autentikasi dan Akun

- Onboarding interaktif tiga slide; status disimpan menggunakan `AsyncStorage` dan onboarding hanya ditampilkan saat pertama kali aplikasi digunakan.
- Registrasi akun tamu dengan nama, email, nomor HP/WhatsApp, dan kata sandi.
- Pesan kesalahan autentikasi Firebase diterjemahkan ke bahasa Indonesia.
- Navigasi berdasarkan peran pengguna setelah login.
- Persistensi sesi menggunakan `AsyncStorage` pada Android dan browser storage pada Web.

### Fitur Guest

- **Beranda:** sapaan pengguna, pencarian cepat, filter kategori hunian, rekomendasi berdasarkan rating, dan hunian populer.
- **Eksplorasi:** pencarian berdasarkan nama, kota, atau alamat; filter tipe hunian dan fasilitas; serta pengurutan berdasarkan terbaru, rating, dan harga.
- **Detail hunian:** galeri foto, fasilitas, lokasi, rating, ulasan, kebijakan menginap, harga, dan tombol pemesanan.
- **Form pemesanan:** kalender interaktif, pemilihan jumlah tamu, catatan khusus, serta kalkulasi jumlah malam dan total biaya otomatis.
- **Pemeriksaan bentrok tanggal:** rentang tanggal yang bertabrakan dengan booking berstatus `pending` atau `confirmed` ditolak oleh aplikasi.
- **Ringkasan pesanan:** rincian menginap dan data pemesan disimpan dengan status `pending` menggunakan transaksi Firestore (`runTransaction`).
- **Pesanan saya:** filter status Semua, Menunggu, Dikonfirmasi, Selesai, dan Dibatalkan. Tamu dapat membatalkan pesanan yang masih `pending`.
- **Detail reservasi:** kode booking, rincian biaya, dan instruksi check-in.
- **Favorit:** tandai hunian favorit dan sinkronkan tampilannya pada kartu maupun halaman detail.
- **Profil:** ubah nama dan nomor WhatsApp, lihat informasi aplikasi, dan logout dengan dialog konfirmasi.

### Fitur Administrator

- **Dashboard statistik:** total pendapatan dari booking `confirmed` dan `completed`, total pemesanan, jumlah hunian aktif, okupansi berjalan, dan lima reservasi terbaru.
- **Kelola hunian:** lihat daftar hunian, ubah ketersediaan, edit data, dan hapus hunian.
- **Form hunian:** tambah dan edit data, pilih beberapa foto dari galeri menggunakan `expo-image-picker`, unggah foto ke Firebase Storage, pilih fasilitas, dan validasi data.
- **Kelola reservasi:** filter berdasarkan status, menyetujui pesanan (`confirmed`), menolak pesanan (`cancelled`), dan menandai pesanan selesai (`completed`).
- **Detail reservasi admin:** lihat informasi pemesan, kontak WhatsApp, catatan tamu, dan tindakan operasional.
- **Dialog konfirmasi:** aksi penting atau destruktif dilindungi dialog konfirmasi.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | React Native, Expo SDK 57 |
| Bahasa | JavaScript |
| Navigasi | React Navigation 7 |
| Autentikasi | Firebase Authentication |
| Database | Cloud Firestore |
| Penyimpanan foto | Firebase Storage |
| Penyimpanan sesi | AsyncStorage dan browser storage |
| UI dan ikon | `@expo/vector-icons` |
| Kalender | `react-native-calendars` |
| Pemilihan gambar | `expo-image-picker` |
| Arsitektur akses data | Service layer di `src/services/` |
| Platform | Android melalui Expo Go dan Web |

Pemanggilan database diorganisasi pada `src/services/` agar screen tidak mengakses Firestore secara langsung.

## Struktur Folder

```text
HuniHub/
├── .env                  # Konfigurasi environment lokal (jangan commit)
├── .env.example          # Contoh variabel environment
├── app.json              # Konfigurasi Expo dan ikon Android
├── firestore.rules       # Aturan keamanan Firestore
├── storage.rules         # Aturan keamanan Firebase Storage
├── package.json          # Dependensi dan scripts
├── README.md
├── scripts/
│   └── seedRunner.js     # Script untuk mengisi data awal
└── src/
    ├── components/       # Komponen UI reusable
    ├── context/          # AuthContext, sesi, role, dan onboarding
    ├── hooks/            # useProperties, useBookings, useFavorites
    ├── navigation/       # RootNavigator, AuthStack, GuestTabs, AdminTabs
    ├── screens/
    │   ├── auth/         # Onboarding, Login, Register, ForgotPassword
    │   ├── guest/        # Halaman untuk tamu
    │   └── admin/        # Halaman untuk administrator
    ├── services/         # Firebase, autentikasi, hunian, booking, favorit, storage
    ├── theme/            # Warna, spacing, dan tipografi
    └── utils/            # Formatter Rupiah, helper tanggal, validator, dan lainnya
```

## Persiapan Firebase

Sebelum menjalankan aplikasi, siapkan proyek Firebase:

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek.
2. Buka **Build → Authentication → Sign-in method**, lalu aktifkan **Email/Password**.
3. Buka **Build → Firestore Database**, lalu buat database. Pilih lokasi yang sesuai dengan kebutuhan aplikasi; lokasi database tidak dapat diubah setelah dibuat.
4. Aktifkan **Firebase Storage** dari menu Build.
5. Dari halaman Project Overview, tambahkan aplikasi Web untuk memperoleh konfigurasi Firebase.
6. Siapkan file `.env` di root proyek menggunakan variabel pada bagian berikut.

## Konfigurasi Environment

Buat file `.env` di direktori utama proyek. Contoh:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

Ganti seluruh nilai contoh dengan konfigurasi dari Firebase Console. Pastikan nama variabel sesuai dengan yang digunakan aplikasi.

> **Catatan keamanan:** variabel dengan awalan `EXPO_PUBLIC_` akan tersedia di sisi aplikasi dan bukan tempat menyimpan rahasia server. Jangan pernah menaruh service account key atau kredensial privat di dalam aplikasi. Terapkan dan uji Firestore Rules serta Storage Rules sebelum aplikasi digunakan secara publik.

## Menjalankan Aplikasi

Pastikan Node.js dan npm telah terpasang. Dari direktori proyek, jalankan:

```bash
npm install
```

### Web

Jalankan aplikasi pada browser:

```bash
npx expo start --web
```

Expo akan menampilkan alamat lokal di terminal, biasanya `http://localhost:8081`.

### Android melalui Expo Go

Jalankan:

```bash
npx expo start
```

Buka Expo Go pada perangkat Android, lalu pindai QR code yang ditampilkan di terminal. Pastikan perangkat dan komputer berada pada jaringan yang dapat saling terhubung.

## Mengisi Data Demo

Jika database Firestore belum memiliki data hunian, jalankan script seeder:

```bash
npm run seed
```

Script ini dirancang untuk mengisi data demo delapan hunian di sejumlah kota Indonesia. Pastikan konfigurasi Firebase sudah benar sebelum menjalankannya.

Catatan: proyek juga memiliki mekanisme auto-seeder pada halaman Beranda ketika koleksi hunian terdeteksi kosong.

## Membuat Akun Administrator

Form registrasi aplikasi menetapkan peran awal sebagai `guest`. Untuk menyiapkan akun administrator pada lingkungan pengembangan:

1. Daftarkan akun melalui aplikasi.
2. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih proyek yang digunakan.
3. Buka **Firestore Database** dan koleksi `users`.
4. Temukan dokumen pengguna yang sesuai dengan UID akun tersebut.
5. Ubah field `role` dari `guest` menjadi `admin`.
6. Simpan perubahan, lalu login kembali untuk memuat navigasi administrator.

**Penting:** perubahan role langsung dari Console hanya boleh dilakukan oleh pihak yang berwenang. Pastikan Firestore Rules benar-benar membatasi akses berdasarkan identitas dan role yang tervalidasi. Jangan mengandalkan penyembunyian menu di antarmuka sebagai mekanisme keamanan.

## Deploy Security Rules

Aturan keamanan tersedia pada file berikut di repositori:

- [`firestore.rules`](./firestore.rules) — aturan akses Cloud Firestore.
- [`storage.rules`](./storage.rules) — aturan akses Firebase Storage.

Untuk menerapkannya:

1. Buka Firebase Console dan pilih proyek.
2. Untuk Firestore, buka **Firestore Database → Rules**, salin isi `firestore.rules`, lalu pilih **Publish**.
3. Untuk Storage, buka **Storage → Rules**, salin isi `storage.rules`, lalu pilih **Publish**.
4. Uji akses dengan akun Guest dan Administrator untuk memastikan setiap role hanya dapat melakukan tindakan yang diizinkan.

Jangan menggunakan aturan terbuka untuk deployment produksi. Periksa aturan secara menyeluruh sebelum aplikasi dipublikasikan.

## Alur Pemesanan

```text
Beranda / Eksplorasi
        |
        v
Detail Hunian
        |
        v
Form Pemesanan
(Pilih tanggal dan jumlah tamu;
sistem memeriksa bentrok tanggal)
        |
        v
Ringkasan Pesanan
        |
        v
Pesanan berstatus pending
        |
        +-----------------------------+
        |                             |
        v                             v
Tamu membatalkan               Admin menyetujui
        |                             |
        v                             v
cancelled                      confirmed
                                      |
                                      v
                                  completed
```

## Catatan

- Status booking yang digunakan dalam alur aplikasi mencakup `pending`, `confirmed`, `cancelled`, dan `completed`.
- Pemeriksaan bentrok tanggal di sisi aplikasi membantu pengalaman pengguna, tetapi tidak dengan sendirinya menjamin tidak ada dua permintaan bersamaan yang memesan tanggal sama. Untuk penggunaan produksi, pastikan proses validasi dan perubahan booking dirancang agar konsisten terhadap permintaan bersamaan, idealnya melalui mekanisme backend/transaksi yang sesuai.
- Sesuaikan dokumentasi ini jika nama script, struktur folder, konfigurasi, atau perilaku implementasi berubah.
