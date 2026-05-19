# Denjavas POS - Changelog

Semua perubahan signifikan pada proyek ini dicatat di file ini, diurutkan dari yang terbaru.

---

## [2026-05-19] - Refinement - Manajemen Kasir & UI Polish

### Diubah
- **Form Kasir Halaman Mandiri:** Mengganti popup/modal Tambah & Edit kasir menjadi halaman mandiri (`Create.vue`, `Edit.vue`) dengan komponen form bersama `CashierForm.vue`, selaras dengan pattern form admin lainnya (Kategori, Menu, dll).
- **Controller Methods:** Menambahkan method `create()` dan `edit()` pada `CashierController.php` untuk merender halaman Inertia baru.
- **Pagination Timeline Log Kasir:** Membatasi tampilan log kasir menjadi 5 per halaman dengan navigasi Previous/Next dan safety bounds.
- **Penyelarasan Warna Emas:** Memperbarui seluruh warna emas di halaman kasir dan komponen terkait ke skema `amber-700` / `#B45309`.

### Diperbaiki
- **Bug Pagination Dashboard:** Memperbaiki infinite loop pada navigasi pagination Recent Transaction dan Kas Keluar Terakhir di Dashboard.
- **Bug SVG Arrow Rotation:** Menghapus rotasi 180° yang salah pada ikon panah navigasi pagination.
- **Sesi Administrator Terjebak:** Menutup sesi shift administrator yang masih terbuka di database.

---

## [2026-05-18] - Feature - Manajemen Kasir & Aktivitas (Sprint 3)

### Ditambahkan
- **Halaman Manajemen Kasir** (`Admin/Cashiers/Index.vue`):
  - Statistik: Total Kasir, Kasir Aktif, Transaksi Hari Ini.
  - Card grid per kasir: status online/offline, PIN (toggle visibility), badge warna, tombol edit/hapus.
  - Timeline Log Kasir: aktivitas harian (buka shift, tutup shift, pesanan, void, petty cash) dengan pagination.
- **`CashierController.php`:** CRUD lengkap untuk akun kasir (role `kasir`).
- **Model `ActivityLog`:** Logging otomatis untuk seluruh aksi operasional kasir.
- **Migrasi `activity_logs`:** Tabel pencatatan aktivitas (`user_id`, `action`, `description`).

---

## [2026-05-17] - Feature - Sidebar Navigation & Dashboard Modernization

### Ditambahkan
- **Sidebar Navigasi Admin:** Sidebar vertikal 240px fixed di sisi kiri menggantikan navbar horizontal.
  - Logo brand Denjavas Cafe di atas.
  - Pengelompokan menu: Utama, Produk & Layout, Inventori, Karyawan, Laporan.
  - User profile card di bawah sidebar.
  - Responsive: drawer + overlay untuk layar < 1024px.
- **Sidebar POS Kasir:** Sidebar sempit (~80px) untuk navigasi kasir (Menu, Pesanan Aktif, Riwayat, Kas Keluar, Tutup Shift, Logout).
- **Breadcrumb Navigation:** Breadcrumb `ADMIN > Nama Halaman` di top bar.

### Diubah
- **Dashboard Admin:** Dimodernisasi ke desain SaaS premium:
  - KPI Cards dengan ikon, perbandingan periode, dan filter rentang waktu.
  - Grafik: Revenue Trend (Line), Top Menu (Bar), Metode Pembayaran (Donut), Jam Sibuk (Bar), Performa Kasir (Horizontal Bar).
  - Tabel: Transaksi Terbaru, Kas Keluar Terakhir, Log Aktivitas Hari Ini.
  - Peringatan Stok Kritis.
- **AuthenticatedLayout.vue:** Refaktor total dari navbar horizontal ke sidebar + top bar + main content.
- **Warna Emas Diselaraskan:** Seluruh warna emas diubah dari `amber-500`/`amber-600` ke `amber-700` (`#B45309`) / `amber-800` (`#92400E`).
- **Font Harga:** Seluruh nominal harga/uang menggunakan font `Plus Jakarta Sans`.
- **Custom Dropdown:** `CustomSelect.vue` digunakan pada seluruh form dropdown (termasuk form bahan baku).

---

## [2026-05-16] - Feature - Supplier, Purchase Orders & Stok Masuk

### Ditambahkan
- **Manajemen Supplier** (`Admin/Suppliers`): CRUD data pemasok bahan baku.
- **Stok Masuk / Purchase Orders** (`Admin/PurchaseOrders`): Pencatatan pembelian bahan baku dari supplier dengan otomatis menambah stok dan mencatat mutasi.
- **Kolom `default_supplier_id` dan `par_level`** pada `raw_materials`: Menghubungkan bahan baku ke supplier default dan level par untuk reorder otomatis.

---

## [2026-05-16] - Feature - Sistem Cetak Multi-Format (KF-04) & Visualisasi Laporan (KF-05)

### Ditambahkan

#### KF-04: Sistem Cetak & Struk
- **Tiga Format Struk Thermal (RawBT/ESC-POS):**
  - `PrinterService.printCustomer()` — Struk pelanggan dengan ringkasan pesanan dan total pembayaran.
  - `PrinterService.printCashier()` — Struk arsip kasir dengan detail metode pembayaran dan header "ARSIP KASIR".
  - `PrinterService.printKitchen()` — Struk dapur dengan font besar pada nama item, catatan instruksi koki, tanpa informasi harga.
- **Tiga Format PDF (DomPDF):**
  - `PosController@printPdf` menerima query parameter `?type=customer|cashier|kitchen` untuk menghasilkan PDF yang disesuaikan per format.
  - Template `receipt_pdf.blade.php` menjadi dinamis: mengubah tata letak, ukuran font, dan konten berdasarkan tipe struk.
- **Catatan Per Item (Order Notes):**
  - Input catatan per item di `CartPanel.vue` (contoh: "Tanpa gula", "Extra pedas").
  - Catatan disimpan ke kolom `order_items.notes` dan ditampilkan di struk Dapur.
- **UI Dropdown "Opsi Cetak":**
  - Tombol tunggal di POS diganti menjadi dropdown menu terstruktur.
  - Tiga grup kategori (Customer/Kasir/Dapur), masing-masing memiliki dua aksi: **Cetak** (RawBT) dan **PDF** (download).
  - Kode warna per grup: Hijau (Customer), Biru (Kasir), Oranye (Dapur).

#### KF-05: Dashboard Analitik & Visualisasi Laporan
- **Tab "Dashboard Analitik" (Baru):**
  - Empat **KPI Cards** premium: Total Pendapatan, HPP (COGS), Laba Kotor, Laba Bersih.
  - **Tren Penjualan Harian** — Line Chart (area fill) via Chart.js / vue-chartjs.
  - **Metode Pembayaran** — Doughnut Chart dengan cutout 70%.
  - **Jam Sibuk (Heatmap)** — Bar Chart distribusi pesanan per jam.
  - **Performa Kasir** — Horizontal Bar Chart ranking kontribusi penjualan per staf.
  - **Peringatan Stok Rendah** — Alert card merah menampilkan bahan baku di bawah batas minimum.
- **Tab "Audit Stok Bahan" (Baru):**
  - Tabel mutasi stok (masuk/keluar) bahan baku dengan kolom: Waktu, Bahan Baku, Tipe, Jumlah, Referensi/Catatan.
  - Badge warna: Hijau untuk "Stok Masuk", Merah untuk "Stok Keluar".
  - Data dari model `StockMutation` dengan relasi `rawMaterial`.
- **Analisis Profitabilitas Menu (COGS):**
  - Kolom baru di tabel Performa Menu: **Total HPP** dan **Margin Laba** (nominal + persentase).
  - Perhitungan HPP per menu menggunakan harga beli bahan baku (`raw_materials.cost_per_unit`) × kuantitas resep.
- **Navigasi Laporan Diperluas:**
  - Dropdown pemilih laporan ditambahkan 2 opsi baru: "Dashboard Analitik" (default) dan "Audit Stok Bahan".
  - Urutan tab dioptimalkan: Dashboard → Penjualan → Performa Menu → Audit Stok → Shift → Transaksi → Kas Keluar → Void.
- **Ekspor Data Baru:**
  - Dukungan ekspor CSV/PDF untuk data mutasi stok (`stock_mutations`).

### Diperbaiki
- **Bug HTML Tag Mismatch (Pos.vue):** Tag `</div>` ekstra pada dropdown cetak menyebabkan error Vite `Invalid end tag`. Dihapus untuk memperbaiki hierarki DOM.
- **Bug `Undefined property: stdClass::$id` (ReportController):** Query performa menu tidak menyertakan `menus.id` dalam `SELECT`, padahal diperlukan oleh `map()` untuk menghitung COGS. Kolom `menus.id` ditambahkan ke query.

### Keputusan Teknis
- **Protokol Cetak Thermal:** Menggunakan `window.location.href = "rawbt:base64,..."` untuk silent print di Android.
- **Rendering PDF:** DomPDF dengan lebar kertas `164pt` (setara 58mm thermal).
- **Default Tab Laporan:** Diubah dari `sales` menjadi `dashboard` agar admin langsung melihat ringkasan visual.
- **Snapshot Data Transaksi:** `menu_name` dan `unit_price` disimpan di `order_items` untuk menjaga integritas historis.

---

## [2026-05-15] - Feature - Dashboard Analitik Admin

### Ditambahkan
- **Dashboard Controller**: `Admin\DashboardController` untuk mengumpulkan data KPI, tren penjualan, top menu, dan peringatan stok.
- **Filter Rentang Waktu**: Admin dapat memilih `start_date` dan `end_date` untuk memfilter semua data analitik.
- **KPI Cards**: Pendapatan, Total Transaksi, Petty Cash, dan Estimasi Saldo Laci — semua mendukung perbandingan vs periode sebelumnya (%).
- **Grafik Interaktif**: Tren Penjualan (Line Chart) dan Top 5 Menu (Bar Chart) menggunakan Chart.js.
- **Peringatan Stok Menipis**: Widget otomatis muncul jika bahan baku menyentuh batas `minimum_stock`.
- **Kolom `minimum_stock`**: Ditambahkan ke tabel `raw_materials` via migrasi.
- **Dependency**: Install `chart.js` dan `vue-chartjs`.
- **Dokumen `data_statistics.md`**: Acuan lengkap klasifikasi data untuk analitik.

### Diperbaiki
- **Bug SQL**: `SUM(price * quantity)` → `SUM(subtotal)` karena kolom `price` tidak ada di tabel `order_items`.

---

## [2026-05-15] - Feature - Petty Cash, History, & Void Order

### Ditambahkan
- **Kas Keluar (Petty Cash)**: Kasir bisa mencatat pengeluaran darurat dari laci kasir selama shift aktif.
- **Halaman Riwayat**: Full-page history (bukan modal) menampilkan tab Penjualan & Kas Keluar hari ini.
- **Void Order**: Pembatalan pesanan dengan alasan wajib, otomatis:
  - Mengembalikan stok bahan baku (`InventoryService::restoreStockFromOrder`).
  - Mengoreksi `total_sales` dan `total_cash_sales` pada shift.
- **Kolom `void_reason`**: Ditambahkan ke tabel `orders`.
- **Breakdown Shift**: Kolom `total_cash_sales` dan `expected_closing_cash` di tabel `shifts`.
- **Navigasi**: Toggle POS ↔ Riwayat di navbar.

### Dihapus
- `HistoryModal.vue` (legacy, diganti halaman penuh).
- Ketergantungan `moment.js` (diganti Vanilla JS).

---

## [2026-05-14] - Feature - POS Kasir v1 & Shift Management

### Ditambahkan
- **POS UI**: Antarmuka kasir full-screen 3-kolom, dioptimalkan untuk tablet Android.
- **Shift Management**: Buka shift (kas awal) dan Tutup shift (ringkasan penjualan, selisih kas).
- **Order Processing**: Pemilihan kategori → menu → kustomisasi varian → pemilihan meja → checkout.
- **Stok Otomatis**: `InventoryService` mengurangi bahan baku berdasarkan resep (BOM) saat transaksi.
- **Transaction Snapshots**: Menyimpan snapshot nama, harga, dan opsi item saat checkout.
- **Migrasi**: `cafe_tables`, `shifts`, `orders`, `order_items`, `order_item_options`, `store_settings`, `stock_mutations`.

---

## [2026-05-14] - Refinement - Admin UI Modernization

### Diubah
- **Open Layout**: Refaktor halaman Categories, Raw Materials, dan Menus ke desain full-width modern.
- **Custom Dropdown**: `CustomSelect.vue` dengan efek glassmorphism, menggantikan native select.
- **Typography**: Standarisasi Plus Jakarta Sans + Playfair Display di seluruh aplikasi.
- **Light Mode**: Ekosistem UI dikunci ke Premium Light Mode (Amber & Slate).

---

## [2026-05-14] - Refinement - Menu CRUD & Variants Integrity

### Diperbaiki
- **Sync/Upsert**: Logika update `MenuController` diganti dari *delete-recreate* ke *Sync/Upsert* untuk menjaga integritas foreign key transaksi lama.
- **Storage Cleanup**: Otomatis hapus gambar lama saat gambar menu diganti/dihapus.
- **Validation**: Penanganan error validasi nested array (resep & varian) di `MenuForm.vue`.

---

## [2026-05-01] - Feature - Core Database & Eloquent Models

### Ditambahkan
- Migrasi tabel inti: `users`, `categories`, `menus`, `menu_option_groups`, `menu_option_items`, `raw_materials`, `recipes`.
- Nullable Foreign Keys untuk BOM pada tabel `recipes`.
- Eloquent Models dengan relasi `hasMany`, `belongsTo`, `$fillable`, dan `$casts`.
- `DatabaseSeeder.php` dengan skenario real-world: Admin, 4 Kasir, Kategori, 11 Bahan Baku, BOM kompleks (Kopi Susu Aren, Matcha Latte, French Fries).
- Spatie Role & Permission: `admin` dan `kasir`.
