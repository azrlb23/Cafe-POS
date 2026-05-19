# Software Requirements Specification (SRS)
# Denjavas Cafe — Sistem Point of Sale

**Versi:** 1.2.0
**Tanggal:** 19 Mei 2026
**Status Dokumen:** Aktif — Hasil Audit Implementasi (Revisi: Tambah KF-07 Supply Chain & KF-08 Kasir)

> Dokumen ini merupakan spesifikasi kebutuhan perangkat lunak resmi untuk sistem **Denjavas Cafe POS**, dihasilkan berdasarkan audit menyeluruh terhadap kode sumber aktual (*source code audit*). Setiap status implementasi mencerminkan kondisi nyata sistem pada tanggal di atas.

---

## Legenda Status

| Simbol | Makna |
|--------|-------|
| ✅ **SELESAI** | Fitur telah diimplementasikan sepenuhnya di backend dan frontend |
| ⚠️ **SEBAGIAN** | Fitur telah ada di backend tetapi belum sepenuhnya lengkap |
| ~~Dicoret~~ | Fitur dihapus dari lingkup sistem (out-of-scope) |

---

## Deskripsi Sistem

Sistem POS (*Point of Sale*) berbasis web untuk kafe F&B berskala menengah bernama **Denjavas Cafe**. Dibangun menggunakan stack **Laravel 12 + Inertia.js + Vue 3 + Tailwind CSS** dan dioperasikan oleh kasir melalui **Tablet Android** di lingkungan operasional kafe.

### Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Backend Framework | Laravel 12 (PHP 8.2+) |
| Frontend Framework | Vue 3 + Inertia.js |
| Styling | Tailwind CSS |
| Database | SQLite (dev) / MySQL (production) |
| Build Tool | Vite 7 |
| PDF Generation | barryvdh/laravel-dompdf |
| Thermal Print | RawBT Protocol (ESC/POS via `rawbt:` URI scheme) |
| Charts | Chart.js (via vue-chartjs) |
| Auth | Laravel Breeze + Spatie Permission (RBAC) |

---

## Kebutuhan Fungsional

### KF-01: Manajemen Menu

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-01.1 | **Manajemen Kategori Terpusat** | ✅ SELESAI | `CategoryController` CRUD penuh, halaman Index/Create/Edit tersedia. |
| KF-01.2 | **Kelengkapan Informasi Menu (CRUD)** | ✅ SELESAI | `MenuController` CRUD penuh dengan upload gambar ke storage. |
| KF-01.3 | **Status Ketersediaan Instan (Toggle)** | ✅ SELESAI | Kolom `is_active` pada tabel `menus`. POS hanya menampilkan menu aktif. |
| KF-01.4 | **Manajemen Grup Varian (Option Groups)** | ✅ SELESAI | Model `MenuOptionGroup` + `MenuOptionItem`, terintegrasi di form Edit Menu. |
| KF-01.5 | **Aturan Validasi Varian (Min/Max Select)** | ✅ SELESAI | Kolom `min_select`/`max_select`, validasi di `OptionSelectionModal.vue`. |
| KF-01.6 | **Item Varian & Modifikasi Harga** | ✅ SELESAI | Kolom `price_modifier` di `menu_option_items`, diakumulasi di total keranjang. |

---

### KF-02: Manajemen Inventaris (BOM)

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-02.1 | **Manajemen Data Bahan Baku (Raw Materials)** | ✅ SELESAI | `RawMaterialController` CRUD, tabel `raw_materials` dengan `unit`, `stock`, `cost_per_unit`, `par_level`, `default_supplier_id`. |
| KF-02.2 | **Penyusunan Resep Terintegrasi (Recipe Linkage)** | ✅ SELESAI | Model `Recipe` polimorfik (mendukung `Menu` dan `MenuOptionItem`). Form resep di halaman Edit Menu. |
| KF-02.3 | **Otomatisasi Pemotongan Stok Real-time** | ✅ SELESAI | `InventoryService::deductStockFromOrder()` dalam `DB::transaction()` di `PosController::submitOrder()`. |
| KF-02.4 | **Pencatatan Riwayat Mutasi (Stock Ledger)** | ✅ SELESAI | Model `StockMutation` dengan `type`, `quantity`, `reference`, `notes`. Dicatat di setiap penjualan dan restock PO. |

---

### KF-03: Transaksi Kasir

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-03.1 | **Antarmuka Pemesanan Cepat (Touch-Optimized Grid)** | ✅ SELESAI | `Pos.vue` dengan grid responsif, filter kategori, sidebar navigasi kasir (`PosSidebar.vue`). |
| KF-03.2 | **Kustomisasi Pesanan (Cart Modifier)** | ✅ SELESAI | `OptionSelectionModal.vue` dengan validasi min/max select sebelum item masuk keranjang. |
| KF-03.3 | **Manajemen Keranjang Fleksibel** | ✅ SELESAI | `CartPanel.vue` dengan increment/decrement qty, hapus item, dan input catatan per item. |
| KF-03.4 | **Tipe Pesanan & Identifikasi (Order Type)** | ✅ SELESAI | `TableSelectionModal.vue` untuk Dine-in. Takeaway otomatis jika tidak ada meja dipilih. |
| KF-03.5 | **Kalkulasi Finansial Otomatis** | ✅ SELESAI | Subtotal dan kembalian aktif di `PaymentModal.vue`. Pajak restoran (PB1) **dihapus dari lingkup** — harga final tanpa tambahan pajak. |
| KF-03.6 | **Pencatatan Metode Pembayaran Manual** | ✅ SELESAI | Kolom `payment_method` (`cash`, `qris`, `transfer`) tersimpan di `orders`. |

---

### KF-04: Cetak Struk

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-04.1 | **Layout Struk Spesifik (3 Format)** | ✅ SELESAI | `PrinterService.js` mengimplementasikan `printCustomer()`, `printCashier()`, dan `printKitchen()` dengan format ESC/POS berbeda. PDF via DomPDF. |
| KF-04.2 | **Integrasi Perangkat Keras (RawBT)** | ✅ SELESAI | `sendToRawBT()` mengkodekan data ke Base64 lalu mengirim via `window.location.href = "rawbt:base64,..."`. |
| KF-04.3 | **Pencetakan Latar Belakang (Silent Print)** | ✅ SELESAI | Mekanisme `rawbt:` URI scheme menghilangkan dialog print bawaan browser Android. |

---

### KF-05: Laporan & Analitik

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-05.1 | **Visualisasi Penjualan Fleksibel** | ✅ SELESAI | `ReportController::index()` dan `DashboardController::index()` menyediakan data lengkap. Grafik Chart.js + DatePicker filter. |
| KF-05.2 | **Analisis Kinerja Produk (Best Sellers)** | ✅ SELESAI | Query `menuPerformance` merangkum total qty dan revenue per menu. |
| KF-05.3 | **Audit Inventaris Transparan** | ✅ SELESAI | `StockMutation` dikirimkan ke halaman laporan. |
| KF-05.4 | **Pencatatan Arus Kas Operasional (Petty Cash)** | ✅ SELESAI | Route `pos.petty-cash` → `PosController::storePettyCash()`. Terintegrasi ke kalkulasi selisih shift. |
| KF-05.5 | **Ekspor Data Universal** | ⚠️ SEBAGIAN | `ReportController::export()` menghasilkan **CSV** dan **PDF**. Format Excel (.xlsx) native belum diimplementasikan. |

---

### KF-06: Autentikasi & Hak Akses

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-06.1 | **Role-Based Access Control (RBAC)** | ✅ SELESAI | Middleware `role:admin` dan `role:kasir`. `RedirectByRole.php` mengarahkan pengguna sesuai perannya. |
| KF-06.2 | **Kredensial Admin Standar** | ✅ SELESAI | Autentikasi Laravel Breeze. Password di-hash bcrypt. |
| ~~KF-06.3~~ | ~~**Quick Login Kasir (PIN Tablet-Optimized)**~~ | ~~Dihapus~~ | PIN hanya untuk verifikasi saat membuka shift. |
| KF-06.4 | **Siklus Manajemen Shift** | ✅ SELESAI | `ShiftModal.vue` (buka shift) dan `EndShiftModal.vue` (tutup shift). |

---

### KF-07: Supply Chain (Supplier & Purchase Orders)

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-07.1 | **Manajemen Data Supplier** | ✅ SELESAI | `SupplierController` CRUD penuh. Halaman `Admin/Suppliers/Index`, `Create`, `Edit` dengan `SupplierForm.vue`. |
| KF-07.2 | **Purchase Order (Stok Masuk)** | ✅ SELESAI | `PurchaseOrderController` CRUD. Halaman form multi-item. Status: draft → ordered → received. Otomatis menambah stok dan mencatat mutasi saat status `received`. |
| KF-07.3 | **Supplier Default per Bahan Baku** | ✅ SELESAI | Kolom `default_supplier_id` pada `raw_materials`. Dropdown `CustomSelect` pada form bahan baku. |
| KF-07.4 | **Par Level (Reorder Point)** | ✅ SELESAI | Kolom `par_level` pada `raw_materials` untuk menandai level reorder. |

---

### KF-08: Manajemen Kasir

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-08.1 | **CRUD Akun Kasir** | ✅ SELESAI | `CashierController` CRUD. Halaman mandiri `Create.vue` dan `Edit.vue` dengan `CashierForm.vue`. |
| KF-08.2 | **Monitoring Status Shift Aktif** | ✅ SELESAI | Card grid pada `Cashiers/Index.vue` menampilkan badge online/offline, PIN (toggle), tombol akhiri sesi. |
| KF-08.3 | **Timeline Log Aktivitas Kasir** | ✅ SELESAI | Model `ActivityLog`. Timeline log harian dengan pagination 5 item/halaman. |
| KF-08.4 | **Statistik Kasir Real-time** | ✅ SELESAI | Counter: Total Kasir, Kasir Aktif, Transaksi Hari Ini. |

---

## Kebutuhan Non-Fungsional

| ID | Kebutuhan | Status | Keterangan |
|----|-----------|--------|-----------|
| KNF-01 | **Performa** — Load time < 2 detik di tablet Android mid-range | ✅ TERPENUHI | Aset dikompilasi via Vite dengan code-splitting. Data POS di-load via Inertia.js (SPA). |
| KNF-02 | **Responsifitas** — Tablet-first, touch-optimized, min. 768px landscape | ✅ TERPENUHI | Breakpoint `lg:` Tailwind konsisten. Sidebar responsive drawer. |
| KNF-03 | **Keandalan Transaksi** — DB Transaction untuk order + deduction stok | ✅ TERPENUHI | `submitOrder()` dan `voidOrder()` dalam `DB::transaction()`. |

---

## Batasan Sistem

| Batasan | Penjelasan |
|---------|-----------|
| **Ruang Lingkup Finansial** | Hanya laporan pendapatan kotor/bersih dan pengeluaran kasir. Tidak ada modul akuntansi standar. |
| **Tidak Ada Pajak/PB1** | Sistem **tidak menghitung pajak restoran (PB1)**. Harga final tanpa tambahan pajak. |
| **Autentikasi Kasir Standar** | Login email/password standar. PIN hanya untuk verifikasi shift. |
| **Ketergantungan Perangkat Keras** | Cetak struk memerlukan aplikasi **RawBT** di Android dan printer thermal Bluetooth 58mm. |
| **Ketergantungan Jaringan** | Aplikasi *online-only*. Tidak ada penyimpanan lokal. |

---

## Ringkasan Status Implementasi

```
KF-01 Manajemen Menu           ████████████████████ 100%  (6/6 selesai)
KF-02 Manajemen Inventaris     ████████████████████ 100%  (4/4 selesai)
KF-03 Transaksi Kasir          ████████████████████ 100%  (6/6 selesai)
KF-04 Cetak Struk              ████████████████████ 100%  (3/3 selesai)
KF-05 Laporan & Analitik       ████████████████░░░░  80%  (4/5 selesai, 1 sebagian)
KF-06 Autentikasi & Hak Akses  ████████████████████ 100%  (3/3 selesai, 1 dihapus)
KF-07 Supply Chain             ████████████████████ 100%  (4/4 selesai)
KF-08 Manajemen Kasir          ████████████████████ 100%  (4/4 selesai)
KNF   Kebutuhan Non-Fungsional ████████████████████ 100%  (3/3 terpenuhi)

TOTAL KESELURUHAN              ████████████████████  97%  (33/34 fitur aktif selesai)
```

> KF-03.5 (PB1/Pajak) dan KF-06.3 (Quick Login PIN) telah **dihapus dari lingkup sistem**. Tidak dihitung sebagai gap.

### Satu-satunya Gap yang Tersisa

| Prioritas | ID | Fitur | Gap yang Tersisa |
|-----------|-----|-------|-----------------| 
| 🟢 Rendah | KF-05.5 | Ekspor Excel (.xlsx) | Hanya CSV yang tersedia. Format `.xlsx` native belum diimplementasikan. |

---

## Future Works (Rencana Pengembangan)

| Fitur | Deskripsi |
|-------|-----------|
| **Integrasi Payment Gateway (QRIS Dinamis)** | Otomatisasi verifikasi pembayaran via webhook Midtrans/Xendit. |
| **Self-Ordering System** | Portal web pelanggan via QR Code di meja. |
| **Sistem Toleransi Offline** | Penyimpanan lokal via IndexedDB agar kasir dapat memproses transaksi saat Wi-Fi terputus. |
| **Kitchen Display System (KDS)** | Monitor interaktif di area dapur pengganti struk kertas. |

---

*Dokumen ini dihasilkan dari audit kode sumber pada: 19 Mei 2026*
*Lokasi proyek: `D:\Cafe-POS`*
