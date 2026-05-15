# Denjavas POS - API & Route Documentation

Dokumentasi semua endpoint (rute) aplikasi yang digunakan untuk komunikasi antara frontend Vue.js (Inertia) dan backend Laravel.

> **Terakhir diperbarui:** 15 Mei 2026

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

### Kas Keluar

#### `[POST] /pos/petty-cash`
- **Controller**: `PosController@storePettyCash`
- **Payload**: `{ "amount": 25000, "description": "Beli es batu" }`
- **Deskripsi**: Mencatat pengeluaran darurat dari laci kasir.
