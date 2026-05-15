# Panduan Operasional Cafe-POS (Denjavas Retro Café)

Dokumen ini berisi panduan lengkap untuk mengoperasikan sistem *Point of Sales* (POS) Denjavas. Sistem ini dirancang untuk dua jenis pengguna utama: **Administrator (Pemilik/Manajer)** dan **Kasir**.

> **Terakhir diperbarui:** 15 Mei 2026

---

## 1. Hak Akses & Akun Default

Sistem dilengkapi dengan dua level otorisasi (*Role-Based Access Control*). Saat pertama kali sistem diinstal dan di-seed, akun berikut otomatis terbuat:

### Akun Administrator (Admin)
Admin memiliki akses penuh ke seluruh sistem, termasuk mengelola data master (Kategori, Menu, Bahan Baku), melihat Dashboard Analitik, dan memantau operasional kasir.
- **Email Login:** `admin@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `123456`

### Akun Kasir (Cashier)
Kasir memiliki akses ke modul Tablet POS untuk melayani pelanggan, memproses pesanan, mencatat petty cash, dan melihat riwayat transaksi hari ini. Terdapat 2 akun kasir default untuk sistem 2 shift:

**Kasir 1 (Shift Pagi-Siang)**
- **Email Login:** `kasir@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `654321`

**Kasir 2 (Shift Siang-Malam)**
- **Email Login:** `kasir2@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `111222`

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

## 3. Alur Kerja Sistem (Workflow)

### Fase Setup (Tugas Admin)
Sebelum kasir bisa berjualan, Admin harus menyiapkan master data:
1. **Tambah Kategori:** Menu `Kategori Menu` → buat kategori (Kopi, Non-Kopi, Snack).
2. **Kelola Stok Bahan Baku:** Menu `Bahan Baku` → daftarkan bahan (Biji Kopi, Susu, dll) dan atur **Batas Minimum Stok** untuk peringatan otomatis.
3. **Buat Menu & Resep:** Menu `Katalog Menu` → `Tambah Menu`:
   - Tetapkan harga dasar dan kategori.
   - Tautkan resep dasar (misal: 1 Kopi Susu = 18g Kopi + 150ml Susu + 20ml Gula).
   - Tambahkan opsi kustomisasi (Ukuran, Suhu, Topping) lengkap dengan tambahan harga dan resep.

### Fase Operasional (Tugas Kasir)
1. Login ke halaman POS (`/pos`) menggunakan email & password.
2. **Buka Shift** → masukkan jumlah kas awal di laci kasir.
3. Terima pesanan pelanggan:
   - Pilih **Dine-in** (pilih nomor meja 1-30) atau **Takeaway**.
   - Pilih menu dan kustomisasi varian jika ada.
   - Tambahkan ke keranjang.
4. **Checkout** → pilih metode pembayaran → stok otomatis terpotong.
5. **Kas Keluar** (jika perlu) → catat pengeluaran darurat dari laci (beli es batu, dll).
6. **Pembatalan Pesanan** (jika ada kesalahan) → buka halaman Riwayat → pilih pesanan → masukkan alasan → stok otomatis dikembalikan.
7. **Tutup Shift** → cocokkan total uang tunai fisik dengan ekspektasi sistem.

### Fase Monitoring (Tugas Admin)
1. **Dashboard Analitik** (`/dashboard`):
   - Lihat KPI: Pendapatan, Transaksi, Petty Cash, Estimasi Saldo.
   - Pilih rentang waktu untuk analisis lebih dalam.
   - Pantau grafik tren penjualan dan menu terlaris.
   - Perhatikan peringatan stok kritis (kotak merah di bawah).

---

## 4. Standar Tampilan (UI/UX)
Sistem ini menggunakan antarmuka **Premium Light Mode (Amber & Slate)** secara eksklusif. Desain menggunakan font **Plus Jakarta Sans** untuk keterbacaan tinggi dan **Playfair Display** untuk kesan retro-modern. Pengaturan tema sudah dikunci untuk menjaga konsistensi identitas brand *Denjavas Retro Café*.
