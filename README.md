# 🎓 Live Message Wall (Wisuda FTI)

Aplikasi **Live Message Wall** interaktif berbasis web yang dirancang khusus untuk menampilkan pesan, harapan, ucapan selamat, dan doa secara *real-time* di layar proyektor / panggung acara wisuda. Dibangun dengan desain modern **Claymorphism**, animasi halus, responsif mobile, serta dilengkapi sistem moderasi kata otomatis.

---

## 🌟 Fitur Utama

### 1. 💌 Halaman Kirim Pesan (`/` atau `/kirim`)
- **Desain Claymorphism**: Tampilan 3D *puffy* yang elegan, ceria, dan interaktif.
- **Validasi & Proteksi**:
  - Validasi batas karakter (Nama: 30 karakter, Pesan: 200 karakter).
  - Proteksi spam bot dengan honeypot tersembunyi.
  - Rate limiting berbasis perangkat (maksimal 3 pesan per menit) & IP address.
- **Modal Konfirmasi Cerdas**:
  - **Pesan Disetujui**: Menampilkan kartu sukses hijau dengan status *"Pesanmu Sudah Mengudara!"*.
  - **Pesan Mengandung Kata Terlarang**: Menampilkan kartu peringatan amber/oranye yang memberitahukan bahwa pesan tidak akan ditampilkan pada halaman display karena mengandung kata/kalimat yang tidak diperbolehkan.

### 2. 🖥️ Halaman Layar Display (`/display`)
- **Grid Proyektor Dinamis (2 Baris × 3 Kolom)**:
  - Menampilkan maksimal 6 pesan aktif sekaligus pada proyektor.
  - **Formasi Variatif**:
    - **Baris 1**: `[Lebar (Span 2), Sedang (Span 1), Sedang (Span 1)]`
    - **Baris 2**: `[Sedang (Span 1), Sedang (Span 1), Lebar (Span 2)]` (kebalikan simetris dari baris 1).
- **Transisi Bebas Tumpukan (*No Overlapping*)**: Menggunakan arsitektur *Slot Cell* dengan `AnimatePresence mode="wait"` sehingga pergantian kartu berlangsung bersih (`fade out` terlebih dahulu, baru `fade in`).
- **Rotasi Otomatis & Polling Realtime**:
  - Polling server setiap 2 detik untuk mengambil pesan baru yang masuk.
  - Rotasi otomatis berkala secara bergantian (*round-robin*) tanpa duplikasi pesan di layar.
- **Sidebar Drawer Riwayat Pesan**:
  - Tombol toggle *"Semua Pesan"* pada navbar untuk membuka riwayat seluruh pesan yang terkirim.
  - Fitur pencarian instan berdasarkan nama pengirim atau isi pesan.
- **Mode Fullscreen**: Tombol cepat untuk mode layar penuh saat ditayangkan ke proyektor panggung.
- **Mode Mobile Khusus**: Jika dibuka pada perangkat smartphone / layar kecil (< 768px), tampilan otomatis beralih menjadi *mobile feed list* yang ringkas dan mudah dibaca.

### 3. 🛡️ Moderasi & Filter Kata Terlarang
- Didukung oleh `FilterKataKasar` dengan kamus kata tidak senonoh (Bahasa Indonesia & Bahasa Inggris) di `config/kata_kasar.php`.
- Pesan yang memuat kata terlarang disimpan dengan status `disetujui = false`, sehingga aman dan tidak akan bocor ke layar proyektor panggung.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: [Laravel 12](https://laravel.com/) (PHP 8.2+)
- **Frontend**: [React 18](https://react.dev/) + [Inertia.js](https://inertiajs.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Animasi & Interaksi**: [Framer Motion (Motion)](https://motion.dev/)
- **Styling**: Vanilla CSS kustom bertema *Claymorphism 3D*, Glassmorphism, & Google Fonts (*Outfit*, *Nunito*)
- **Database**: SQLite (default) / MySQL / PostgreSQL

---

## 🚀 Panduan Instalasi & Menjalankan Program

Ikuti langkah-langkah berikut untuk menjalankan project di komputer lokal:

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- **PHP** (minimal versi 8.2) dengan ekstensi `pdo_sqlite`, `curl`, `mbstring`.
- **Composer** ([getcomposer.org](https://getcomposer.org/))
- **Node.js** (minimal versi 18+) & **NPM**

### 2. Clone Repository & Masuk ke Direktori
```bash
git clone https://github.com/username/Live-Message-Wall.git
cd Live-Message-Wall
```

### 3. Install Dependensi PHP (Composer)
```bash
composer install
```

### 4. Install Dependensi JavaScript (NPM)
```bash
npm install
```

### 5. Konfigurasi File Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*Di Windows PowerShell:*
```powershell
Copy-Item .env.example .env
```

Generate application encryption key:
```bash
php artisan key:generate
```

### 6. Migrasi Database & Seeding Data Dummy
Secara default project menggunakan SQLite. Jalankan migrasi tabel dan seeder data contoh:
```bash
# Jalankan migrasi tabel database
php artisan migrate

# Isi 10 pesan dummy wisuda untuk testing
php artisan db:seed --class=PesanSeeder
```

### 7. Menjalankan Server Aplikasi
Jalankan backend Laravel dan Vite dev server secara bersamaan:

**Terminal 1 (Laravel Server):**
```bash
php artisan serve
```
*Aplikasi backend akan aktif di: `http://127.0.0.1:8000`*

**Terminal 2 (Vite Server):**
```bash
npm run dev
```

---

## 🌐 Navigasi Halaman

Setelah server berjalan, akses URL berikut di browser:
- 📱 **Halaman Kirim Pesan (Audiens/Tamu):** [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) atau [`http://127.0.0.1:8000/kirim`](http://127.0.0.1:8000/kirim)
- 📽️ **Halaman Display Utama (Proyektor Panggung):** [`http://127.0.0.1:8000/display`](http://127.0.0.1:8000/display)

---

## 🧪 Menjalankan Pengujian (Testing)

Untuk memastikan seluruh fungsionalitas (API, rate limit, filter kata kasar, database) berjalan normal:

```bash
php artisan test
```
atau untuk menjalankan test spesifik:
```bash
php artisan test --filter=PesanTest
```

---

## 📁 Struktur Direktori Penting

```
Live-Message-Wall/
├── app/
│   ├── Http/Controllers/
│   │   └── PesanController.php         # Handler kirim pesan, display, & API polling
│   ├── Models/
│   │   └── Pesan.php                   # Model pesan wisuda
│   └── Services/
│       └── FilterKataKasar.php         # Engine penyaring kata kasar
├── config/
│   └── kata_kasar.php                  # Daftar kamus kata tidak diperbolehkan
├── database/
│   ├── migrations/                     # Skema tabel database (tabel pesan)
│   └── seeders/
│       └── PesanSeeder.php             # Seeder data contoh ucapan wisuda
├── resources/
│   ├── css/
│   │   └── app.css                     # Desain sistem Claymorphism & responsivitas
│   └── js/
│       ├── Components/
│       │   └── Navbar.jsx              # Navbar universal + toggle sidebar + fullscreen
│       ├── hooks/
│       │   └── useAntreanPesan.js      # State queue, rotasi kartu 2x3, polling realtime
│       └── Pages/
│           ├── Display.jsx             # Layar display proyektor + sidebar drawer
│           └── Kirim.jsx               # Form kirim ucapan + modal konfirmasi
└── tests/
    └── Feature/
        └── PesanTest.php               # Unit & feature tests
```

---

## 📄 Lisensi

Project ini dibuat untuk kebutuhan seremonial dan edukasi di lingkungan **Fakultas Teknologi Informasi (FTI)** di bawah lisensi open-source [MIT License](LICENSE).
