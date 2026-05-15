# Denjavas POS - API & Route Documentation

File ini mendokumentasikan semua rute (endpoint) aplikasi yang digunakan untuk komunikasi antara frontend Vue.js (Inertia) dan backend Laravel.

## Menu Catalog (Admin)

### `[GET] /admin/menus`
- **Deskripsi**: Menampilkan halaman daftar Menu.
- **Middleware**: `auth`, `role:admin`
- **Response**: Mengembalikan komponen Inertia `Admin/Menus/Index` beserta data `menus` (termasuk relasi `category`).

### `[GET] /admin/menus/create`
- **Deskripsi**: Menampilkan halaman form untuk membuat Menu baru.
- **Response**: Mengembalikan komponen Inertia `Admin/Menus/Create` beserta referensi master data `categories` dan `raw_materials`.

### `[POST] /admin/menus`
- **Deskripsi**: Menyimpan menu baru beserta resep dasar, option groups, option items, dan resep masing-masing option ke database dalam satu `DB::transaction()`.
- **Payload / Parameter**:
```json
{
  "category_id": 1,
  "name": "Kopi Susu",
  "description": "Deskripsi kopi",
  "base_price": 20000,
  "is_active": true,
  "image": "File object (optional)",
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
- **Response**: Redirect back to `/admin/menus` dengan flash message `success`.

### `[GET] /admin/menus/{menu}/edit`
- **Deskripsi**: Menampilkan halaman form edit untuk menu spesifik.
- **Response**: Mengembalikan komponen Inertia `Admin/Menus/Edit` beserta data `menu` (ter-eager load dengan `recipes`, `menuOptionGroups.menuOptionItems.recipes`), `categories`, dan `raw_materials`.

### `[PUT/PATCH] /admin/menus/{menu}`
- **Deskripsi**: Memperbarui data menu, melakukan sinkronisasi resep dasar, dan melakukan *recreate* option groups (sync).
- **Payload / Parameter**: *Sama seperti `[POST] /admin/menus`.*
- **Response**: Redirect back to `/admin/menus` dengan flash message `success`.

### `[DELETE] /admin/menus/{menu}`
- **Deskripsi**: Menghapus menu dari database (termasuk *cascade delete* pada option groups dan resep).
- **Response**: Redirect back to `/admin/menus` dengan flash message `success`.

---

## Master Data Management (Admin)

### `[RESOURCE] /admin/categories`
- **Controller**: `Admin/CategoryController`
- **Fungsi**: Kelola kategori menu (Kopi, Snack, dll).

### `[RESOURCE] /admin/raw-materials`
- **Controller**: `Admin/RawMaterialController`
- **Fungsi**: Kelola stok bahan baku (Coffee Beans, Milk, Syrup, dll).

---

## POS Operations (Phase 1 & 2)

### `[GET] /pos`
- **Deskripsi**: Halaman utama aplikasi kasir (Tablet POS).
- **Middleware**: `auth`, `role:kasir|admin`

### `[POST] /pos/shifts/start`
- **Deskripsi**: Kasir membuka shift dengan menginput kas awal (`opening_cash`).

### `[POST] /pos/orders`
- **Deskripsi**: Memproses transaksi baru (Checkout). Mengurangi stok secara otomatis dan mencatat mutasi.
