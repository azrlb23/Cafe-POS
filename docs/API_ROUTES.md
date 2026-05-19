# Denjavas POS - API & Route Documentation

Dokumentasi semua endpoint (rute) aplikasi yang digunakan untuk komunikasi antara frontend Vue.js (Inertia) dan backend Laravel.

> **Terakhir diperbarui:** 19 Mei 2026

---

## 1. Public Routes

### `[GET] /`
- **Deskripsi**: Landing page Denjavas Retro Café.
- **Response**: Komponen Inertia `Welcome`.

### `[GET] /login`
- **Deskripsi**: Halaman login (Email + Password).

### `[GET] /logout` *(Emergency)*
- **Deskripsi**: Rute darurat untuk logout via GET jika sesi pengguna tersangkut.

---

## 2. Admin Routes

Semua rute di bawah ini dilindungi middleware: `auth`, `verified`, `role:admin`.

### Dashboard Analitik

#### `[GET] /dashboard`
- **Controller**: `Admin\DashboardController@index`
- **Deskripsi**: Dashboard analitik utama dengan KPI cards, grafik tren, tabel transaksi/kas keluar terbaru, log aktivitas, dan peringatan stok.
- **Query Parameters** (opsional):
  - `start_date` (format: `YYYY-MM-DD`, default: awal bulan ini)
  - `end_date` (format: `YYYY-MM-DD`, default: hari ini)
- **Response**: Komponen Inertia `Dashboard` dengan data:
  - `filters` — Rentang waktu aktif
  - `kpis` — Pendapatan, transaksi, petty cash, estimasi saldo
  - `salesTrend` — Data tren penjualan harian
  - `topMenus` — Top 5 menu terlaris
  - `lowStockItems` — Bahan baku di bawah batas minimum
  - `activeShift` — Info shift kasir yang sedang berjalan
  - `recentTransactions` — 50 transaksi terbaru
  - `recentPettyCash` — 50 kas keluar terbaru
  - `activityLogs` — Log aktivitas hari ini

---

### Laporan Operasional

#### `[GET] /admin/reports`
- **Controller**: `Admin\ReportController@index`
- **Deskripsi**: Halaman laporan komprehensif dengan 8 tab: Dashboard Analitik, Penjualan Harian, Performa Menu, Audit Stok, Riwayat Shift, Riwayat Transaksi, Kas Keluar, dan Log Void.
- **Query Parameters** (opsional):
  - `start_date` (format: `YYYY-MM-DD`, default: awal bulan ini)
  - `end_date` (format: `YYYY-MM-DD`, default: akhir bulan ini)
  - `search` — Filter teks untuk kolom-kolom yang relevan per tab
- **Response**: Komponen Inertia `Admin/Reports/Index` dengan data lengkap laporan.

#### `[GET] /admin/reports/export`
- **Controller**: `Admin\ReportController@export`
- **Deskripsi**: Ekspor data laporan ke PDF atau CSV.
- **Query Parameters**:
  - `format` — `pdf` atau `excel` (default: `pdf`)
  - `type` — `sales`, `shifts`, `voids`, `menu_performance`, `expenses`, `transactions`, `stock_mutations`
  - `start_date`, `end_date` — Rentang waktu
  - `search` — Filter teks (opsional)
- **Response**: File download (PDF via DomPDF atau CSV stream).

---

### Manajemen Kategori

#### `[RESOURCE] /admin/categories`
- **Controller**: `Admin\CategoryController`
- **Fungsi**: CRUD kategori menu (Kopi, Snack, dll).
- **Halaman**: `Index.vue`, `Create.vue`, `Edit.vue` + `Partials/CategoryForm.vue`.

---

### Manajemen Menu

#### `[RESOURCE] /admin/menus`
- **Controller**: `Admin\MenuController`
- **Fungsi**: CRUD menu lengkap dengan upload gambar, option groups, dan resep BOM.
- **Halaman**: `Index.vue`, `Create.vue`, `Edit.vue` + `Partials/MenuForm.vue`.
- **Payload POST/PUT** (contoh):
```json
{
  "category_id": 1,
  "name": "Kopi Susu",
  "description": "Deskripsi",
  "base_price": 20000,
  "is_active": true,
  "image": "File (optional)",
  "recipes": [
    { "raw_material_id": 1, "quantity": 18 }
  ],
  "option_groups": [
    {
      "name": "Ukuran",
      "min_select": 1,
      "max_select": 1,
      "items": [
        {
          "name": "Large",
          "price_modifier": 5000,
          "recipes": [
            { "raw_material_id": 2, "quantity": 30 }
          ]
        }
      ]
    }
  ]
}
```

---

### Manajemen Bahan Baku

#### `[RESOURCE] /admin/raw-materials`
- **Controller**: `Admin\RawMaterialController`
- **Fungsi**: CRUD stok bahan baku (Coffee Beans, Milk, Syrup, dll) dengan supplier default dan par level.
- **Halaman**: `Index.vue`, `Create.vue`, `Edit.vue` + `Partials/RawMaterialForm.vue`.

---

### Manajemen Supplier

#### `[RESOURCE] /admin/suppliers`
- **Controller**: `Admin\SupplierController`
- **Fungsi**: CRUD data pemasok bahan baku.
- **Halaman**: `Index.vue`, `Create.vue`, `Edit.vue` + `Partials/SupplierForm.vue`.

---

### Stok Masuk (Purchase Orders)

#### `[RESOURCE] /admin/purchase-orders`
- **Controller**: `Admin\PurchaseOrderController`
- **Fungsi**: Pencatatan pembelian bahan baku dari supplier. Otomatis menambah stok dan mencatat mutasi stok saat status menjadi `received`.
- **Halaman**: `Index.vue`, `Create.vue`, `Edit.vue` + `Partials/PurchaseOrderForm.vue`.

---

### Layout Meja

#### `[GET] /admin/tables`
- **Controller**: `Admin\AdminTableController@index`
- **Route Name**: `admin.tables.index`
- **Deskripsi**: Halaman visualisasi layout meja kafe (30 meja) dengan status real-time.

---

### Manajemen Kasir

#### `[RESOURCE] /admin/cashiers`
- **Controller**: `Admin\CashierController`
- **Fungsi**: CRUD akun kasir (registrasi, edit profil/PIN/password, hapus). Monitoring status shift aktif dan log aktivitas.
- **Halaman**: `Index.vue` (daftar + statistik + timeline log), `Create.vue`, `Edit.vue` + `Partials/CashierForm.vue`.

---

## 3. POS / Kasir Routes

Semua rute di bawah ini dilindungi middleware: `auth`, `verified`, `role:kasir`.

### Halaman Utama

#### `[GET] /pos`
- **Controller**: `PosController@index`
- **Deskripsi**: Antarmuka kasir full-screen (tablet optimized).

#### `[GET] /pos/active-orders`
- **Controller**: `PosController@activeOrders`
- **Deskripsi**: Halaman pesanan aktif yang sedang diproses.

#### `[GET] /pos/history`
- **Controller**: `PosController@history`
- **Deskripsi**: Halaman riwayat transaksi & kas keluar hari ini.

---

### Shift Management

#### `[POST] /pos/shifts/start`
- **Controller**: `PosController@startShift`
- **Payload**: `{ "opening_cash": 500000 }`
- **Deskripsi**: Kasir membuka shift baru dengan kas awal.

#### `[POST] /pos/shifts/end`
- **Controller**: `PosController@endShift`
- **Payload**: `{ "closing_cash": 750000, "notes": "Catatan opsional" }`
- **Deskripsi**: Kasir menutup shift, mencatat kas akhir.

---

### Transaksi

#### `[POST] /pos/orders`
- **Controller**: `PosController@submitOrder`
- **Deskripsi**: Memproses checkout. Otomatis mengurangi stok bahan baku dan mencatat mutasi.

#### `[POST] /pos/orders/{order}/void`
- **Controller**: `PosController@voidOrder`
- **Payload**: `{ "void_reason": "Pelanggan salah pilih menu" }`
- **Deskripsi**: Membatalkan pesanan. Otomatis mengembalikan stok dan mengoreksi saldo shift.

#### `[POST] /pos/orders/{order}/status`
- **Controller**: `PosController@updateStatus`
- **Deskripsi**: Mengubah status pesanan (pending → completed/cancelled).

---

### Pencetakan Struk

#### `[GET] /pos/orders/{order}/print-pdf`
- **Controller**: `PosController@printPdf`
- **Route Name**: `pos.orders.print-pdf`
- **Query Parameters**:
  - `type` — `customer` (default), `cashier`, `kitchen`
- **Deskripsi**: Generate dan stream PDF struk sesuai format yang diminta.
- **Response**: PDF stream (inline display) via DomPDF, lebar kertas 164pt (58mm thermal).

---

### Kas Keluar

#### `[POST] /pos/petty-cash`
- **Controller**: `PosController@storePettyCash`
- **Payload**: `{ "amount": 25000, "description": "Beli es batu" }`
- **Deskripsi**: Mencatat pengeluaran darurat dari laci kasir.
