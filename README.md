# Denjavas Retro Café POS

Sistem Point of Sales (POS) khusus untuk **Denjavas Retro Café**, dibangun menggunakan stack modern (Laravel 12, Vue.js 3, Inertia.js, TailwindCSS) untuk operasional kasir dan manajemen back-office yang efisien.

---

## 📌 Fitur Utama

### Kasir (POS)
- **Antarmuka Tablet**: UI full-screen 3-kolom yang dioptimalkan untuk tablet Android, dengan sidebar navigasi kasir.
- **Manajemen Shift**: Buka/Tutup shift dengan kas awal, ringkasan penjualan, dan selisih kas.
- **Pemesanan Lengkap**: Pemilihan menu, kustomisasi varian, pemilihan meja (1-30) atau Takeaway, dan checkout multi-metode (Cash, QRIS, E-Wallet, Transfer).
- **Manajemen Stok Otomatis**: Bahan baku terpotong otomatis berdasarkan resep (BOM) saat transaksi diproses.
- **Kas Keluar (Petty Cash)**: Pencatatan pengeluaran darurat dari laci kasir.
- **Riwayat Transaksi**: Halaman riwayat penjualan dan kas keluar per hari.
- **Pembatalan Pesanan (Void)**: Batalkan pesanan dengan alasan, otomatis mengembalikan stok dan mengoreksi saldo shift.
- **Cetak Struk**: 3 format struk (Customer, Kasir, Dapur) via thermal printer (RawBT) dan PDF.

### Admin / Manager
- **Dashboard Analitik**: Ringkasan KPI (Pendapatan, Transaksi, Petty Cash, Saldo Laci) dengan filter rentang waktu fleksibel. Grafik tren penjualan, metode pembayaran, jam sibuk, dan performa kasir.
- **Tabel Monitoring**: Transaksi terbaru, kas keluar terakhir, dan log aktivitas kasir hari ini.
- **Peringatan Stok Kritis**: Notifikasi otomatis saat bahan baku menyentuh batas minimum.
- **Manajemen Menu & Kategori**: CRUD lengkap dengan varian (ukuran, suhu, topping) dan resep bahan baku.
- **Manajemen Bahan Baku**: Kelola stok (gram, ml, pcs) dengan batas minimum dan HPP (cost per unit).
- **Manajemen Supplier**: CRUD data pemasok bahan baku.
- **Stok Masuk (Purchase Orders)**: Pencatatan pembelian bahan baku dari supplier, otomatis menambah stok.
- **Manajemen Kasir**: CRUD akun kasir, monitoring status shift aktif, timeline log aktivitas.
- **Layout Meja**: Visualisasi layout 30 meja kafe dengan status real-time.
- **Laporan Komprehensif**: 8 tab laporan (Dashboard Analitik, Penjualan, Performa Menu, Audit Stok, Shift, Transaksi, Kas Keluar, Void) dengan ekspor CSV/PDF.
- **No Extra Tax**: Harga final tanpa PPN/service charge (sesuai kesepakatan klien).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Laravel 12.x (PHP 8.2+) |
| **Frontend** | Vue.js 3 (Composition API) + Inertia.js |
| **Styling** | TailwindCSS |
| **Database** | SQLite (dev) / MySQL (production) |
| **Auth** | Laravel Breeze + Spatie Permission (RBAC) |
| **Charts** | Chart.js (via vue-chartjs) |
| **PDF** | barryvdh/laravel-dompdf |
| **Thermal Print** | RawBT Protocol (ESC/POS) |

---

## 🚀 Instalasi & Setup

```bash
# 1. Clone dan install dependencies
git clone https://github.com/azrlb23/Denjavas-POS.git
cd Cafe-POS
composer install
npm install

# 2. Konfigurasi environment
cp .env.example .env
php artisan key:generate

# 3. Migrasi & seed database
php artisan migrate:fresh --seed

# 4. Jalankan development server (satu perintah)
composer run dev
```

> `composer run dev` secara otomatis menjalankan PHP server, Vite, dan Queue Worker secara bersamaan.

---

## 🔑 Default Users (Dari Seeder)

| Role | Name | Email | Password | PIN |
|------|------|-------|----------|-----|
| **Admin** | Administrator | `admin@denjavas.com` | `password` | `123456` |
| **Kasir 1** | Kasir 1 | `kasir@denjavas.com` | `password` | `654321` |
| **Kasir 2** | Kasir 2 | `kasir2@denjavas.com` | `password` | `111222` |
| **Kasir 3** | Kasir 3 | `kasir3@denjavas.com` | `password` | `333444` |
| **Kasir 4** | Kasir 4 | `kasir4@denjavas.com` | `password` | `555666` |

---

## 🗺️ Roadmap Development

### ✅ Sprint 1: Core System & POS
- [x] Skema database (menu, kategori, bahan baku, resep, meja, shift, orders)
- [x] Admin UI: Katalog Menu, Kategori, Bahan Baku (CRUD)
- [x] POS Kasir: Buka/Tutup Shift, Order, Checkout, Stok Otomatis
- [x] Petty Cash & Riwayat Transaksi
- [x] Void Order (Pembatalan + Restock + Koreksi Shift)

### ✅ Sprint 2: Dashboard Analitik & Laporan
- [x] Dashboard Admin: KPI Cards, Tren Penjualan, Top Menu
- [x] Filter Rentang Waktu (Date Range Picker)
- [x] Peringatan Stok Kritis (Low Stock Alert)
- [x] Perbandingan Periode Otomatis
- [x] Cetak Struk Multi-Format (Customer, Kasir, Dapur)
- [x] Laporan 8-Tab (Dashboard, Penjualan, Menu, Stok, Shift, Transaksi, Kas Keluar, Void)
- [x] Ekspor CSV/PDF

### ✅ Sprint 3: Admin Modernization & Supply Chain
- [x] Sidebar Navigation (Admin & POS)
- [x] Dashboard Modernization (Grafik, Tabel, Log Aktivitas)
- [x] Manajemen Supplier (CRUD)
- [x] Stok Masuk / Purchase Orders (CRUD + auto-restock)
- [x] Layout Meja (Visualisasi 30 meja)
- [x] Manajemen Kasir (CRUD + monitoring + timeline log)
- [x] Penyelarasan Warna Emas Gelap (amber-700)
- [x] Font Plus Jakarta Sans untuk harga
- [x] Form halaman mandiri (bukan popup) untuk semua CRUD

### 🔲 Sprint 4: Integrasi Lanjutan (Backlog)
- [ ] Export Excel (.xlsx) native
- [ ] Cetak Struk (Thermal Printer via RawBT) — testing hardware
- [ ] Integrasi QRIS Dinamis (Midtrans/Xendit)
- [ ] Kitchen Display System (KDS)
- [ ] Self-Ordering System (QR Code)
- [ ] Toleransi Offline (IndexedDB/LocalStorage)

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [Panduan Operasional](docs/PANDUAN_OPERASIONAL.md) | Cara mengoperasikan sistem untuk Admin & Kasir |
| [Database Schema](docs/DB_SCHEMA.md) | Struktur tabel dan relasi database (18 tabel) |
| [API Routes](docs/API_ROUTES.md) | Daftar endpoint dan payload (85 routes) |
| [Karakteristik Visual](docs/CHARACTERISTIC.md) | Panduan warna, font, dan desain UI |
| [Changelog](docs/CHANGELOG.md) | Riwayat perubahan per tanggal |
| [Bug Log](docs/BUG_LOG.md) | Catatan resolusi bug & pelajaran |
| [Data Statistics](docs/data_statistics.md) | Acuan data analitik untuk Dashboard |
| [SRS](docs/SRS.md) | Software Requirements Specification |

---

## 💡 Catatan Teknis

- **Snapshot Pattern**: Kolom `menu_name`, `unit_price` di `order_items` adalah *hard copy* agar riwayat tidak berubah saat harga menu diupdate.
- **No Tax**: `Total = Subtotal` tanpa PPN/service charge.
- **Light Mode Only**: UI menggunakan tema Premium Light Mode (Amber & Slate) dengan font Plus Jakarta Sans + Playfair Display.
- **Meja Dinamis**: Tabel `cafe_tables` terpisah (bukan hardcode) untuk mendukung ekspansi real-time status meja.
- **Warna Emas**: Palet warna emas diselaraskan ke `#B45309` (amber-700) di seluruh aplikasi untuk kesan premium yang konsisten.
