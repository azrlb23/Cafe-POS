# Denjavas Retro Café POS

Sistem Point of Sales (POS) khusus untuk **Denjavas Retro Café**, dibangun menggunakan stack modern (Laravel 12, Vue.js 3, Inertia.js, TailwindCSS) untuk operasional kasir dan manajemen back-office yang efisien.

---

## 📌 Fitur Utama

### Kasir (POS)
- **Antarmuka Tablet**: UI full-screen 3-kolom yang dioptimalkan untuk tablet Android.
- **Manajemen Shift**: Buka/Tutup shift dengan kas awal, ringkasan penjualan, dan selisih kas.
- **Pemesanan Lengkap**: Pemilihan menu, kustomisasi varian, pemilihan meja (1-30) atau Takeaway, dan checkout multi-metode (Cash, QRIS, E-Wallet, Transfer).
- **Manajemen Stok Otomatis**: Bahan baku terpotong otomatis berdasarkan resep (BOM) saat transaksi diproses.
- **Kas Keluar (Petty Cash)**: Pencatatan pengeluaran darurat dari laci kasir.
- **Riwayat Transaksi**: Halaman riwayat penjualan dan kas keluar per hari.
- **Pembatalan Pesanan (Void)**: Batalkan pesanan dengan alasan, otomatis mengembalikan stok dan mengoreksi saldo shift.

### Admin / Manager
- **Dashboard Analitik**: Ringkasan KPI (Pendapatan, Transaksi, Petty Cash, Saldo Laci) dengan filter rentang waktu fleksibel.
- **Grafik Tren Penjualan**: Line chart pendapatan harian + bar chart Top 5 menu terlaris.
- **Peringatan Stok Kritis**: Notifikasi otomatis saat bahan baku menyentuh batas minimum.
- **Manajemen Menu & Kategori**: CRUD lengkap dengan varian (ukuran, suhu, topping) dan resep bahan baku.
- **Manajemen Bahan Baku**: Kelola stok (gram, ml, pcs) dengan batas minimum.
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

---

## 🗺️ Roadmap Development

### ✅ Sprint 1: Core System & POS
- [x] Skema database (menu, kategori, bahan baku, resep, meja, shift, orders)
- [x] Admin UI: Katalog Menu, Kategori, Bahan Baku (CRUD)
- [x] POS Kasir: Buka/Tutup Shift, Order, Checkout, Stok Otomatis
- [x] Petty Cash & Riwayat Transaksi
- [x] Void Order (Pembatalan + Restock + Koreksi Shift)

### ✅ Sprint 2: Dashboard Analitik
- [x] Dashboard Admin: KPI Cards, Tren Penjualan, Top Menu
- [x] Filter Rentang Waktu (Date Range Picker)
- [x] Peringatan Stok Kritis (Low Stock Alert)
- [x] Perbandingan Periode Otomatis

### 🔲 Sprint 3: Laporan & Audit (Backlog)
- [ ] Distribusi Metode Pembayaran (Pie Chart)
- [ ] Grafik Jam Sibuk (Peak Hours Heatmap)
- [ ] Revenue per Kategori Menu
- [ ] Laporan Audit Shift & Void
- [ ] Riwayat Mutasi Stok
- [ ] Export Laporan (Excel/PDF)

### 🔲 Sprint 4: Integrasi Lanjutan (Future)
- [ ] Cetak Struk (Thermal Printer via RawBT)
- [ ] Integrasi QRIS Dinamis (Midtrans/Xendit)

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [Panduan Operasional](docs/PANDUAN_OPERASIONAL.md) | Cara mengoperasikan sistem untuk Admin & Kasir |
| [Database Schema](docs/DB_SCHEMA.md) | Struktur tabel dan relasi database |
| [API Routes](docs/API_ROUTES.md) | Daftar endpoint dan payload |
| [Changelog](docs/CHANGELOG.md) | Riwayat perubahan per tanggal |
| [Bug Log](docs/BUG_LOG.md) | Catatan resolusi bug & pelajaran |
| [Data Statistics](docs/data_statistics.md) | Acuan data analitik untuk Dashboard |

---

## 💡 Catatan Teknis

- **Snapshot Pattern**: Kolom `menu_name`, `unit_price` di `order_items` adalah *hard copy* agar riwayat tidak berubah saat harga menu diupdate.
- **No Tax**: `Total = Subtotal` tanpa PPN/service charge.
- **Light Mode Only**: UI menggunakan tema Premium Light Mode (Amber & Slate) dengan font Plus Jakarta Sans + Playfair Display.
- **Meja Dinamis**: Tabel `cafe_tables` terpisah (bukan hardcode) untuk mendukung ekspansi real-time status meja.
