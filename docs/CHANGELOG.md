# Denjavas POS - Changelog

Semua perubahan yang signifikan pada proyek ini akan dicatat di file ini.

## [2026-05-14] - Refinement - Administrative UI Modernization
- **Open Layout Overhaul**: Refactored Categories, Raw Materials, and Menus index pages to remove "box-in-a-box" containers in favor of a clean, full-width, modern table design with individual row cards and hover animations.
- **Form UI Refinement**: Updated Category and Menu forms with a centered, minimalist layout, removing nested containers and implementing high-contrast, premium inputs.
- **Modern Dropdown System**: Created a custom `CustomSelect.vue` component with glassmorphism effects, replacing native browser selects for a consistent, premium experience across the app.
- **Typography Standardization**: Enforced "Plus Jakarta Sans" and "Playfair Display" (serif) across all admin pages, removing legacy mono fonts and browser-default numeric controls.

- **POS UI Overhaul**: Mengimplementasikan antarmuka kasir full-screen yang dioptimalkan untuk tablet dengan tata letak 3-kolom.
- **Shift Management**: Menambahkan fitur Buka Kasir dengan verifikasi PIN dan input saldo awal.
- **Order Processing**: Mengimplementasikan alur pemesanan lengkap mulai dari pemilihan kategori, menu, kustomisasi varian (modal), pemilihan meja, hingga penyimpanan transaksi ke database.
- **Transaction Snapshots**: Menjamin konsistensi data histori dengan menyimpan snapshot nama dan harga item saat transaksi diproses.
- **Unified Design Ecosystem**: Merombak UI/UX seluruh aplikasi (Admin, POS, Landing Page) untuk menggunakan *Light Mode* yang konsisten, bersih, dan modern (menggantikan dark mode) serta menggunakan tipografi global *Plus Jakarta Sans*.
## [2026-05-14] - Refinement - Menu CRUD & Variants Integrity

- **Logic Sync/Upsert**: Mengubah logika `update` pada `MenuController` dari pola *delete-and-recreate* menjadi *Sync/Upsert*. Hal ini memastikan integritas data transaksi lama tetap terjaga (menghindari error foreign key saat menu yang sudah pernah dipesan diupdate).
- **Storage Cleanup**: Menambahkan logika penghapusan file gambar lama secara otomatis di `public/storage` saat gambar menu diganti atau menu dihapus.
- **Validation Enhancement**: Mengimplementasikan penanganan error validasi untuk struktur data *nested array* (resep dan varian) di frontend `MenuForm.vue`.
- **UI/UX Premium Overhaul**: Memperbarui tampilan katalog menu (Index) dengan fitur pencarian, filter kategori, dan desain `MenuForm` yang lebih ergonomis dengan *sticky action bar* dan aksen warna Retro.

## [2026-05-14] - Feature - Phase 1 Core Database & Settings

- **Migrations & Models**: Menambahkan struktur tabel `cafe_tables` (untuk meja dine-in), `shifts` (untuk pencatatan sesi kasir), `orders`, `order_items`, dan `order_item_options` (dengan *snapshot pattern* untuk konsistensi histori transaksi).
- **Store Settings**: Menambahkan tabel `store_settings` untuk mengatur teks *receipt header/footer*, *store name*, dan *instagram* secara dinamis.
- **Seeder**: Memperbarui `DatabaseSeeder` dengan menambahkan Kasir 2 (rotasi shift bergantian), opsi "Level Gula" pada minuman sesuai request klien, dan data meja 1-30.
- **Relations**: Mengupdate model `User`, `Menu`, dan `MenuOptionItem` agar memiliki relasi `HasMany` ke transaksi yang bersangkutan.

## [2026-05-01] - Feature - Initialisasi Core Database & Eloquent Models
- Membuat file migration untuk tabel inti: `users`, `categories`, `menus`, `menu_option_groups`, `menu_option_items`, `raw_materials`, dan `recipes`.
- Mengimplementasikan pendekatan Nullable Foreign Keys untuk struktur *Bill of Materials* (BOM) pada tabel `recipes` (kolom `menu_id` dan `menu_option_item_id`).
- Membuat Eloquent Model berserta relasinya (`hasMany`, `belongsTo`), pengaturan `$fillable`, dan `$casts` untuk keenam entitas utama tersebut.

## [2026-05-01] - Feature - Finalisasi Complex Dummy Seeder (Skala Kafe Menengah)
- Mengimplementasikan `DatabaseSeeder.php` dengan skenario *real-world* operasional F&B.
- Menambahkan *Role & Permission* via Spatie: Akun `admin@denjavas.com` (Role: admin) dan `kasir@denjavas.com` (Role: kasir).
- Menyusun master Kategori (Coffee, Non-Coffee, Snack) dan 11 tipe Bahan Baku (termasuk *paper/plastic cup*, *ice cubes*, *fries*).
- Membuat skenario *Bill of Materials* (BOM) tingkat lanjut:
  - **Kopi Susu Aren**: Pengaruh suhu terhadap tipe *cup* dan ukuran (*Large*) terhadap penambahan takaran susu & gula.
  - **Matcha Latte**: Penggunaan sistem *Topping* (Boba, Extra Shot).
  - **French Fries**: Skenario makanan dengan *Option Group* Saus yang tidak memotong stok.
- Berhasil menjalankan `php artisan migrate:fresh --seed` tanpa kendala.
