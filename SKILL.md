---
name: live-message-wall
description: Panduan membangun Live Message Wall (dinding pesan realtime) berbasis Laravel + Inertia + React.js tanpa autentikasi, dengan 2 halaman, yaitu halaman Kirim Pesan (HP peserta) dan halaman Display (proyektor). Gunakan skill ini setiap kali mengerjakan fitur, migration, controller, halaman React/Inertia, antrean/animasi kartu, polling/Reverb, rate limit, atau deployment di project ini, termasuk saat user menyebut "wisuda FTI", "display pesan", "pesan realtime", "pop-up pesan", atau "message wall", walau tidak menyebut nama skill.
---

# Live Message Wall

Peserta scan QR, isi nama + pesan di HP, pesan langsung tampil sebagai kartu pop-up di layar proyektor. Dipakai pada demo wisuda Fakultas Teknik dan Informatika (±183 peserta, desain aman sampai ±1.000 pesan).

## Prinsip utama

- **Hanya Display yang butuh realtime.** HP cukup melakukan satu POST. Jangan buat koneksi realtime di halaman Kirim.
- **Tanpa autentikasi.** Hapus semua route/halaman login, register, dan profil bawaan starter kit.
- **Polling dulu, Reverb belakangan.** Endpoint polling wajib ada (data awal + pemulihan pesan terlewat). Reverb hanya peningkatan opsional.
- **Hanya 2 halaman.** Jangan menambah halaman lain tanpa diminta (moderasi lewat artisan, bukan halaman).
- Penamaan tabel, kolom, dan variabel memakai bahasa Indonesia (`pesan`, `nama`, `isi_pesan`).

## Stack

Laravel (versi stabil terbaru, PHP 8.3+), Inertia.js, React.js, Vite, Tailwind CSS, Motion (`motion`/framer-motion), MySQL. Opsional: Laravel Reverb + Echo, Redis. Produksi: Nginx, PHP-FPM, Cloudflare.

## Route

| Method | URL | Fungsi |
|---|---|---|
| GET | `/` | Halaman Kirim Pesan (Inertia `Kirim`) |
| POST | `/kirim` | Simpan pesan (validasi + throttle) |
| GET | `/display` | Halaman Display (Inertia `Display`) |
| GET | `/api/pesan?setelah_id=N` | JSON pesan dengan `id > N`, urut naik, maks 50 |

Pesan awal Display: kirim 30 pesan terbaru lewat props Inertia, lalu polling memakai `id` terbesar.

## Database

Tabel `pesan`: `id`, `nama` (varchar 30), `isi_pesan` (varchar 200), `disetujui` (boolean, default true), `sidik_perangkat` (varchar 64), `created_at`. Tambahkan index pada `disetujui, id`. Endpoint polling dan Display hanya mengambil `disetujui = true`.

## Backend

1. Gunakan **FormRequest** `KirimPesanRequest`: `nama` required|string|max:30, `isi_pesan` required|string|max:200. Trim spasi dan hilangkan karakter kontrol sebelum validasi.
2. Tambahkan **honeypot** (field tersembunyi, misalnya `website`). Jika terisi, balas sukses palsu tanpa menyimpan.
3. **Filter kata kasar** lewat class `FilterKataKasar` dengan daftar kata Indonesia dan Inggris di `config/kata_kasar.php`. Jika terdeteksi, simpan dengan `disetujui = false` dan tetap balas sukses.
4. **Rate limit** lewat `RateLimiter::for('kirim-pesan')`:
   - Per perangkat (cookie token acak atau hash IP + user agent): **3 pesan per menit**.
   - Per IP: **300 per menit**. Wajib longgar karena seluruh peserta berbagi satu IP WiFi kampus. Batas ketat per IP akan memblokir peserta sah.
5. Simpan data dengan Eloquent. Jika memakai Reverb, dispatch event `PesanDikirim` (`ShouldBroadcast`, channel publik `pesan-baru`, payload hanya `id`, `nama`, `isi_pesan`).
6. Jangan pernah mengirim HTML. Output hanya teks biasa.

## Frontend: halaman Kirim

- Mobile-first, ringan, satu kolom, tombol besar.
- Dua field + penghitung karakter. Tombol kirim dengan state loading dan anti klik ganda (`useForm` Inertia).
- Setelah sukses: tampilkan layar konfirmasi dan tombol "Kirim pesan lagi" (dengan jeda beberapa detik).
- Sembunyikan honeypot dengan CSS (bukan `type="hidden"`).

## Frontend: halaman Display

Fullscreen 16:9 (target 1920×1080), tanpa scroll, cursor tersembunyi, tanpa elemen UI selain judul acara, logo, dan QR code ke halaman Kirim.

**Hook `useAntreanPesan`** (pisahkan logika dari tampilan):
- `antreanBaru`: pesan yang belum pernah tampil, diproses lebih dulu.
- `arsipPutarUlang`: semua pesan yang sudah tampil; saat `antreanBaru` kosong, pilih acak dari sini dan hindari 10 pesan terakhir yang tampil.
- `kartuAktif`: maksimal **8** (konfigurasi di satu objek `KONFIG`: `maksKartu`, `durasiTampilMs` 8000–12000, `intervalPollingMs` 2000).
- Saat `antreanBaru.length > 15`, percepat tampil (kurangi durasi hingga 5 detik) agar antrean tidak tertinggal.

**Layout berbasis slot, bukan posisi acak:**
- Bagi layar jadi grid zona (default 4 kolom × 3 baris, dapat dikonfigurasi).
- Ukuran kartu menyesuaikan panjang teks: `<60` karakter = 1 zona, font besar; `60–120` = 1 zona lebar, font sedang; `>120` = 2 zona, font lebih kecil.
- Kartu menempati zona kosong; jangan pernah menumpuk kartu.
- Animasi masuk pop-up (scale + fade, sedikit spring) dan animasi keluar halus. Variasikan warna kartu dari palet 5–6 warna.

**Realtime:**
- Polling `/api/pesan?setelah_id=` tiap 2 detik, simpan `idTerakhir`. Tangani error dengan retry diam-diam (tanpa memunculkan error di layar).
- Jika Reverb aktif, dengarkan `pesan-baru` lewat Echo dan **tetap** jalankan polling sebagai fallback. Hindari duplikat dengan membandingkan `id`.
- Simpan `arsipPutarUlang` ke memori; jika jaringan putus, layar tetap berjalan dengan memutar ulang arsip.

**Render aman:** tampilkan `nama` dan `isi_pesan` sebagai teks React biasa. Dilarang memakai `dangerouslySetInnerHTML`.

## Urutan pengerjaan

1. Setup Laravel + Inertia + React, hapus semua fitur auth, migration `pesan`.
2. Halaman Kirim + `POST /kirim` + validasi.
3. Endpoint polling + halaman Display statis (daftar sederhana) untuk memastikan alur data jalan.
4. Hook antrean, layout slot, animasi, mode putar ulang.
5. Honeypot, filter kata kasar, rate limit, command artisan `pesan:sembunyikan {id}`.
6. (Opsional) Reverb + Echo dengan fallback polling.
7. Seeder `pesan:isi-contoh {jumlah}` untuk uji tampilan, lalu uji beban.

## Kriteria selesai

- Pesan terkirim dari HP muncul di Display ≤ 3 detik (polling) atau ≤ 1 detik (Reverb).
- 100 pesan masuk sekaligus: tidak ada kartu bertumpuk, Display tidak freeze, tidak ada pesan hilang.
- Refresh Display tidak menghilangkan pesan; antrean kosong memutar ulang arsip.
- Teks `<script>` atau HTML yang dikirim tampil sebagai teks biasa.
- Satu perangkat tidak bisa mengirim lebih dari 3 pesan per menit, tetapi 200 perangkat dari satu IP bisa mengirim bersamaan.
- Tidak ada route login/register/profil yang tersisa.

## Deployment (ringkas)

`composer install --no-dev`, `npm run build`, `APP_ENV=production`, `APP_DEBUG=false`, `php artisan migrate --force`, `php artisan optimize`. Letakkan Cloudflare di depan server untuk cache aset. Jika memakai Reverb: jalankan dengan Supervisor dan proxy WebSocket di Nginx.
