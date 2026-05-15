# Denjavas Retro Café POS

Sistem Point of Sales (POS) khusus untuk **Denjavas Retro Café**, dibangun menggunakan stack modern (Laravel 12, Vue.js 3, Inertia.js, TailwindCSS) untuk operasional kasir dan manajemen back-office yang efisien.

---

## 📌 Fitur Utama

Sistem ini dirancang untuk menjawab kebiasaan harian di kafe dengan 2 role utama (Admin & Kasir) dan alur kerja yang sudah disesuaikan dengan instruksi klien:

- **Dual-Interface Auth**: Login Admin dengan Email/Password, Login Kasir dengan PIN (6 digit) untuk kemudahan operasional cepat.
- **Quick Switch User**: Memungkinkan pergantian kasir dalam satu device tablet tanpa perlu full logout.
- **Manajemen Menu & Kategori**: Termasuk variasi harga berdasarkan ukuran atau topping.
- **Manajemen Stok Otomatis**: Inventarisasi bahan baku (`gram`, `ml`, `pcs`) yang terpotong otomatis berdasarkan resep (Recipe) dari setiap order. Sesuai request, banyak bahan dikelola menggunakan satuan unit `pcs`.
- **Manajemen Meja**: Sistem nomor meja fix (1-30) dengan status ketersediaan (available/occupied) untuk alur dine-in.
- **Manajemen Shift**: Melacak waktu buka/tutup kasir, jumlah kas awal/akhir, serta ringkasan penjualan per shift untuk akuntabilitas.
- **Store Settings**: Mengatur informasi header/footer struk, nama kafe, IG, dan nomor kontak secara dinamis untuk dicetak.
- **No Extra Tax Logic**: Berdasarkan kesepakatan klien, harga yang ada di menu adalah harga final tanpa perhitungan pajak atau service charge tambahan.

---

## 🛠️ Tech Stack

- **Backend**: Laravel 12.x (PHP 8.2+)
- **Frontend**: Vue.js 3 (Composition API) + Inertia.js
- **Styling**: TailwindCSS
- **Database**: MySQL / MariaDB
- **Authentication**: Laravel Breeze + Spatie Permission (RBAC)

---

## 🗄️ Database Schema & Architecture

Berikut adalah struktur entitas utama yang ada di sistem:

1. **`users` & `roles`**: Admin (Email) & Kasir (PIN). Memiliki relasi ke `shifts` dan `orders`.
2. **`categories`**: Kategori menu (Coffee, Non-Coffee, Snack).
3. **`menus`**: Data menu dengan harga *base price*. Tidak memakai field tax/service charge.
4. **`menu_option_groups` & `menu_option_items`**: Opsi tambahan (Suhu, Ukuran, Level Gula, dll) dengan *price modifier*.
5. **`raw_materials`**: Data stok bahan baku.
6. **`recipes`**: Jembatan antara `menus` / `menu_option_items` dengan `raw_materials` untuk kalkulasi pengurangan stok saat dipesan.
7. **`cafe_tables`**: Daftar meja (nomor 1-30) dengan status ketersediaan.
8. **`shifts`**: Tabel pencatatan jam kerja kasir per shift, merekam kas awal/akhir dan total penjualan.
9. **`orders`**: Transaksi pemesanan (Dine-in/Takeaway). Punya relasi ke meja, shift, dan kasir yang memproses. Mendukung auto-generation Order Number (`ORD-YYYYMMDD-XXX`).
10. **`order_items` & `order_item_options`**: Rincian pemesanan per order. Menyimpan **snapshot** nama, opsi, dan harga agar data historis tetap akurat meskipun ada perubahan harga menu di kemudian hari.
11. **`store_settings`**: Menyimpan konfigurasi global seperti teks header/footer struk, akun IG, dll.

---

## 🚀 Instalasi & Setup

1. **Clone repository dan install dependencies PHP & Node.js**
   ```bash
   git clone <repo-url>
   cd Cafe-POS
   composer install
   npm install
   ```

2. **Konfigurasi Environment**
   Salin `.env.example` ke `.env` lalu sesuaikan konfigurasi database Anda.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Migrasi Database & Seeding Data Awal**
   Proses ini akan membuat tabel dan mengisi data dummy yang komprehensif, termasuk admin, 2 kasir, kategori, menu, resep bahan baku, meja 1-30, opsi gula, dan pengaturan toko standar.
   ```bash
   php artisan migrate:fresh --seed
   ```

4. **Jalankan Development Server**
   Buka dua terminal dan jalankan:
   ```bash
   php artisan serve
   npm run dev
   ```

---

## 🔑 Default Users (Dari Seeder)

Data login yang bisa langsung digunakan setelah menjalankan seeder:

| Role | Name | Email / Login | Password / PIN |
|---|---|---|---|
| **Admin** | Administrator | `admin@denjavas.com` | `password` |
| **Kasir** | Kasir 1 | `kasir@denjavas.com` | `654321` (PIN) |
| **Kasir** | Kasir 2 | `kasir2@denjavas.com` | `111222` (PIN) |

*(Gunakan email & password di halaman admin, gunakan PIN di pad kasir)*

---

## 🗺️ Roadmap Development (Sprints)

### 🟢 Sprint 1: Core System & Modern UI
- [x] **Core Database & Settings**: Skema database transaksi, meja, shift, opsi pesanan, dan konfigurasi store.
- [x] **Modern Admin Interface**: Refaktor UI Admin (Katalog, Kategori, Bahan Baku) ke desain "Open Layout".
- [x] **POS Kasir v1**: Antarmuka kasir tablet-ready, pemilihan menu/varian, dan penyimpanan transaksi.
- [x] **Shift Management (Buka)**: Login PIN kasir dan input saldo awal laci.

### 🟡 Sprint 2: Payments, Online Orders & Reports
**Goal:** Integrasi payment QRIS, alur order online dari Buyer, dan dashboard laporan dasar. Durasi: **1–2 minggu**.

#### 1. Integrasi QRIS Dinamis (Midtrans/Xendit)
- [ ] Daftar akun & setup Midtrans atau Xendit
- [ ] Konfigurasi `.env` API Key + Secret
- [ ] Endpoint `POST /payment/create` → hit API, return `qr_string`
- [ ] Frontend render QR code di modal kasir
- [ ] Endpoint webhook `POST /payment/callback` → verifikasi signature
- [ ] Update `orders.payment_status = 'paid'` setelah webhook valid
- [ ] Realtime update UI kasir (polling atau Pusher/WebSocket)

#### 2. Alur Order Online (Buyer)
- [ ] Halaman menu publik untuk Buyer
- [ ] Buyer buat pesanan → simpan ke `orders` dengan `type = 'online'`
- [ ] Notifikasi masuk ke antrian kasir
- [ ] Kasir konfirmasi (terima/tolak) dari halaman POS
- [ ] Notifikasi status balik ke Buyer

#### 3. Dashboard Laporan (Admin)
- [ ] Laporan penjualan harian
- [ ] Filter: harian, mingguan, bulanan, all-time
- [ ] Rekap menu/varian terlaris
- [ ] Rekap pengeluaran harian kasir
- [ ] Export Excel/CSV

#### 4. Manajemen Shift Kasir
- [ ] Kasir buka shift → input `initial_cash`
- [ ] Kasir tutup shift → input `final_cash` + ringkasan transaksi hari ini
- [ ] Riwayat shift tersimpan di tabel `shifts`

---

## 📚 Dokumentasi Lanjut

Informasi yang lebih mendalam mengenai sistem tersedia di direktori `docs/`:

- **[Panduan Operasional](docs/PANDUAN_OPERASIONAL.md)**: Panduan untuk admin dan kasir dalam menggunakan aplikasi.
- **[Database Schema](docs/DB_SCHEMA.md)**: Rincian entitas dan relasi database.
- **[API Routes](docs/API_ROUTES.md)**: Referensi daftar routing yang ada.
- **[Changelog](docs/CHANGELOG.md)**: Riwayat update yang telah dilakukan pada project.

---

## 💡 Notes untuk Tim Developer

- Tabel transaksi menggunakan pattern **Snapshot**. Kolom seperti `menu_name` dan `unit_price` disimpan di dalam `order_items` sebagai bentuk *hard copy*. Hal ini memastikan riwayat tidak berubah apabila ada penggantian nama atau kenaikan harga pada tabel master di masa depan.
- Perhitungan Total Transaksi sederhana: `Total = Subtotal` karena di *Denjavas Cafe* tidak diberlakukan skema PPN dan Service Charge tambahan.
- Meja menggunakan tabel terpisah (`cafe_tables`) dan tidak hardcoded untuk menampung ekspansi jika suatu saat status meja (available/occupied) ditampilkan *realtime* di POS.
- Ekosistem UI secara ketat menggunakan **Light Mode** dan font **Plus Jakarta Sans** demi menstandarisasi identitas branding Denjavas Cafe.
