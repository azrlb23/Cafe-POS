# Denjavas POS - API & Route Documentation

Dokumentasi semua endpoint (rute) aplikasi yang digunakan untuk komunikasi antara frontend Vue.js (Inertia) dan backend Laravel.

> **Terakhir diperbarui:** 16 Mei 2026

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
- **Deskripsi**: Dashboard analitik utama dengan KPI cards, grafik tren, dan peringatan stok.
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

---

### Laporan Operasional

#### `[GET] /admin/reports`
- **Controller**: `Admin\ReportController@index`
- **Deskripsi**: Halaman laporan komprehensif dengan 8 tab: Dashboard Analitik, Penjualan Harian, Performa Menu, Audit Stok, Riwayat Shift, Riwayat Transaksi, Kas Keluar, dan Log Void.
- **Query Parameters** (opsional):
  - `start_date` (format: `YYYY-MM-DD`, default: awal bulan ini)
  - `end_date` (format: `YYYY-MM-DD`, default: akhir bulan ini)
  - `search` — Filter teks untuk kolom-kolom yang relevan per tab
- **Response**: Komponen Inertia `Admin/Reports/Index` dengan data:
  - `dailySales` — Ringkasan penjualan per hari
  - `shifts` — Riwayat & audit shift kasir
  - `voidLogs` — Log pembatalan pesanan
  - `menuPerformance` — Ranking menu + HPP (COGS) + margin laba
  - `pettyCashLogs` — Riwayat pengeluaran kas keluar
  - `orderHistory` — Detail lengkap semua transaksi
  - `stockMutations` — Ledger mutasi stok bahan baku
  - `charts` — Data grafik (revenue trend, payment methods, busy hours)
  - `profitability` — Analisis laba rugi (revenue, COGS, gross profit, net profit)
  - `performance` — Performa kasir (penjualan & transaksi per kasir)
  - `alerts` — Peringatan stok rendah

#### `[GET] /admin/reports/export`
- **Controller**: `Admin\ReportController@export`
- **Deskripsi**: Ekspor data laporan ke PDF atau CSV/Excel.
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

---

### Manajemen Menu

#### `[GET] /admin/menus`
- **Deskripsi**: Halaman daftar menu.
- **Response**: Komponen Inertia `Admin/Menus/Index` + data `menus` (relasi `category`).

#### `[GET] /admin/menus/create`
- **Deskripsi**: Form membuat menu baru.
- **Response**: Komponen Inertia `Admin/Menus/Create` + referensi `categories`, `raw_materials`.

#### `[POST] /admin/menus`
- **Deskripsi**: Menyimpan menu baru + resep + option groups dalam `DB::transaction()`.
- **Payload**:
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

#### `[GET] /admin/menus/{menu}/edit`
- **Deskripsi**: Form edit menu (eager load resep & option groups).

#### `[PUT/PATCH] /admin/menus/{menu}`
- **Deskripsi**: Update menu + sinkronisasi resep (pola Sync/Upsert, bukan delete-recreate).

#### `[DELETE] /admin/menus/{menu}`
- **Deskripsi**: Hapus menu + cascade delete options & resep.

---

### Manajemen Bahan Baku

#### `[RESOURCE] /admin/raw-materials`
- **Controller**: `Admin\RawMaterialController`
- **Fungsi**: CRUD stok bahan baku (Coffee Beans, Milk, Syrup, dll).

---

## 3. POS / Kasir Routes

Semua rute di bawah ini dilindungi middleware: `auth`, `verified`, `role:kasir`.

### Halaman Utama

#### `[GET] /pos`
- **Controller**: `PosController@index`
- **Deskripsi**: Antarmuka kasir full-screen (tablet optimized).

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

---

### Pencetakan Struk

#### `[GET] /pos/orders/{order}/print-pdf`
- **Controller**: `PosController@printPdf`
- **Route Name**: `pos.orders.print-pdf`
- **Query Parameters**:
  - `type` — `customer` (default), `cashier`, `kitchen`
- **Deskripsi**: Generate dan stream PDF struk sesuai format yang diminta.
  - **Customer**: Struk standar pelanggan (semua detail + total + kembalian).
  - **Cashier**: Struk arsip kasir (header "ARSIP KASIR" + detail metode bayar).
  - **Kitchen**: Struk dapur (font besar + catatan item, tanpa harga).
- **Response**: PDF stream (inline display) via DomPDF, lebar kertas 164pt (58mm thermal).

---

### Kas Keluar

#### `[POST] /pos/petty-cash`
- **Controller**: `PosController@storePettyCash`
- **Payload**: `{ "amount": 25000, "description": "Beli es batu" }`
- **Deskripsi**: Mencatat pengeluaran darurat dari laci kasir.
