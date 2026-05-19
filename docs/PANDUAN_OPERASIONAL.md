# Panduan Operasional Cafe-POS (Denjavas Retro Café)

Dokumen ini berisi panduan lengkap untuk mengoperasikan sistem *Point of Sales* (POS) Denjavas. Sistem ini dirancang untuk dua jenis pengguna utama: **Administrator (Pemilik/Manajer)** dan **Kasir**.

> **Terakhir diperbarui:** 19 Mei 2026

---

## 1. Hak Akses & Akun Default

Sistem dilengkapi dengan dua level otorisasi (*Role-Based Access Control*). Saat pertama kali sistem diinstal dan di-seed, akun berikut otomatis terbuat:

### Akun Administrator (Admin)
Admin memiliki akses penuh ke seluruh sistem, termasuk mengelola data master (Kategori, Menu, Bahan Baku, Supplier, Kasir), melihat Dashboard Analitik, dan memantau operasional kasir.
- **Email Login:** `admin@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `123456`

### Akun Kasir (Cashier)
Kasir memiliki akses ke modul Tablet POS untuk melayani pelanggan, memproses pesanan, mencatat petty cash, dan melihat riwayat transaksi hari ini. Terdapat 4 akun kasir default:

| # | Nama | Email | Password | PIN |
|---|------|-------|----------|-----|
| 1 | Kasir 1 | `kasir@denjavas.com` | `password` | `654321` |
| 2 | Kasir 2 | `kasir2@denjavas.com` | `password` | `111222` |
| 3 | Kasir 3 | `kasir3@denjavas.com` | `password` | `333444` |
| 4 | Kasir 4 | `kasir4@denjavas.com` | `password` | `555666` |

---

## 2. Cara Menjalankan Aplikasi

```bash
composer run dev
```

Perintah di atas akan secara otomatis menjalankan:
1. Server Backend PHP (Laravel) di `http://localhost:8000`
2. Server Frontend (Vite) untuk *Hot Module Replacement* UI
3. Server Queue Worker

---

## 3. Navigasi Sistem

### Sidebar Admin
Setelah login sebagai Admin, sidebar navigasi vertikal akan tampil di sisi kiri dengan pengelompokan menu:
- **Utama:** Dashboard
- **Produk & Layout:** Katalog Menu, Kategori Menu, Layout Meja
- **Inventori:** Bahan Baku, Supplier, Stok Masuk
- **Karyawan:** Manajemen Kasir
- **Laporan:** Laporan & Riwayat

### Sidebar POS Kasir
Setelah login sebagai Kasir, sidebar sempit akan tampil di sisi kiri:
- Menu (halaman POS utama)
- Pesanan Aktif
- Riwayat Transaksi
- Kas Keluar
- Tutup Shift
- Logout

---

## 4. Alur Kerja Sistem (Workflow)

### Fase Setup (Tugas Admin)
Sebelum kasir bisa berjualan, Admin harus menyiapkan master data:
1. **Tambah Kategori:** Sidebar → `Kategori Menu` → buat kategori (Kopi, Non-Kopi, Snack).
2. **Daftarkan Supplier:** Sidebar → `Supplier` → daftarkan pemasok bahan baku.
3. **Kelola Stok Bahan Baku:** Sidebar → `Bahan Baku` → daftarkan bahan (Biji Kopi, Susu, dll), atur **Batas Minimum Stok**, dan pilih **Supplier Default**.
4. **Catat Stok Masuk:** Sidebar → `Stok Masuk` → buat Purchase Order dari supplier, ubah status menjadi `Received` untuk otomatis menambah stok.
5. **Buat Menu & Resep:** Sidebar → `Katalog Menu` → `Tambah Menu`:
   - Tetapkan harga dasar dan kategori.
   - Tautkan resep dasar (misal: 1 Kopi Susu = 18g Kopi + 150ml Susu + 20ml Gula).
   - Tambahkan opsi kustomisasi (Ukuran, Suhu, Topping) lengkap dengan tambahan harga dan resep.
6. **Daftarkan Kasir:** Sidebar → `Manajemen Kasir` → `Tambah Kasir Baru` → isi nama, email, PIN 6-digit, dan password.

### Fase Operasional (Tugas Kasir)
1. Login ke halaman POS (`/pos`) menggunakan email & password.
2. **Buka Shift** → masukkan PIN dan jumlah kas awal di laci kasir.
3. Terima pesanan pelanggan:
   - Pilih **Dine-in** (pilih nomor meja 1-30) atau **Takeaway**.
   - Pilih menu dan kustomisasi varian jika ada.
   - Tambahkan **catatan per item** jika pelanggan memiliki instruksi khusus (misal: "Tanpa gula", "Extra pedas").
   - Tambahkan ke keranjang.
4. **Checkout** → pilih metode pembayaran → stok otomatis terpotong.
5. **Cetak Struk (Otomatis):** Setelah checkout berhasil, sistem otomatis mencetak 3 struk secara berurutan:
   - **Struk Dapur** → dikirim ke printer dapur (item + catatan, tanpa harga).
   - **Struk Kasir** → arsip untuk audit internal (header "ARSIP KASIR").
   - **Struk Customer** → diberikan kepada pelanggan (total + kembalian).
6. **Cetak Ulang (Manual):** Gunakan tombol **"Opsi Cetak"** di header POS:
   - Pilih format struk (Customer / Kasir / Dapur).
   - Pilih aksi: **Cetak** (kirim ke printer thermal via RawBT) atau **PDF** (unduh file).
7. **Kas Keluar** (jika perlu) → catat pengeluaran darurat dari laci (beli es batu, dll).
8. **Pembatalan Pesanan** (jika ada kesalahan) → buka halaman Riwayat → pilih pesanan → masukkan alasan → stok otomatis dikembalikan.
9. **Tutup Shift** → cocokkan total uang tunai fisik dengan ekspektasi sistem.

### Fase Monitoring (Tugas Admin)
1. **Dashboard Analitik** (`/dashboard`):
   - Lihat KPI: Pendapatan, Transaksi, Petty Cash, Estimasi Saldo.
   - Pilih rentang waktu untuk analisis lebih dalam.
   - Pantau grafik: Tren penjualan (Line), Metode pembayaran (Donut), Jam sibuk (Bar), Performa kasir (Horizontal Bar).
   - Pantau tabel: Transaksi terbaru, Kas keluar terakhir, Log aktivitas kasir.
   - Perhatikan peringatan stok kritis (kotak merah).

2. **Manajemen Kasir** (`/admin/cashiers`):
   - Pantau status kasir aktif/offline.
   - Lihat timeline log aktivitas kasir hari ini.
   - Tambah, edit, atau hapus akun kasir.

3. **Laporan Operasional** (`/admin/reports`):
   - **Dashboard Analitik** — Grafik interaktif dan kartu profitabilitas.
   - **Penjualan Harian** — Ringkasan per hari.
   - **Performa Menu** — Ranking menu + HPP + margin laba.
   - **Audit Stok Bahan** — Ledger mutasi stok.
   - **Riwayat Shift** — Audit pertanggungjawaban kasir per sesi.
   - **Riwayat Transaksi** — Daftar lengkap semua pesanan.
   - **Buku Kas Keluar** — Rekapitulasi petty cash.
   - **Log Void** — Rekam jejak pembatalan pesanan.
   - **Ekspor**: Semua tab mendukung unduh dalam format **PDF** dan **CSV**.

---

## 5. Persyaratan Perangkat Cetak

Untuk fitur cetak struk otomatis, diperlukan:
- **Perangkat:** Tablet Android (tempat sistem POS dijalankan).
- **Aplikasi:** [RawBT](https://play.google.com/store/apps/details?id=ru.a402.rawbtprinter) — Print Service untuk printer thermal via Bluetooth/USB.
- **Printer:** Printer thermal 58mm (Bluetooth atau USB-OTG).
- **Pengaturan:** Pastikan RawBT aktif di latar belakang dan terhubung ke printer sebelum memulai transaksi.

---

## 6. Standar Tampilan (UI/UX)
Sistem ini menggunakan antarmuka **Premium Light Mode** dengan skema warna emas gelap (`#B45309` / Amber-700) secara eksklusif. Desain menggunakan font **Plus Jakarta Sans** untuk harga dan nominal, **Inter** untuk teks umum, dan **Playfair Display** untuk heading serif. Pengaturan tema sudah dikunci untuk menjaga konsistensi identitas brand *Denjavas Retro Café*.
