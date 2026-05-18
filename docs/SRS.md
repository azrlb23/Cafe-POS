# Software Requirements Specification (SRS)
# Denjavas Cafe — Sistem Point of Sale

**Versi:** 1.0.0
**Tanggal:** 18 Mei 2026
**Status Dokumen:** Aktif — Hasil Audit Implementasi

> Dokumen ini merupakan spesifikasi kebutuhan perangkat lunak resmi untuk sistem **Denjavas Cafe POS**, dihasilkan berdasarkan audit menyeluruh terhadap kode sumber aktual (*source code audit*). Setiap status implementasi mencerminkan kondisi nyata sistem pada tanggal di atas.

---

## Legenda Status

| Simbol | Makna |
|--------|-------|
| ✅ **SELESAI** | Fitur telah diimplementasikan sepenuhnya di backend dan frontend |
| ⚠️ **SEBAGIAN** | Fitur telah ada di backend tetapi UI/validasi frontend belum lengkap, atau sebaliknya |
| ❌ **BELUM** | Fitur belum diimplementasikan sama sekali |

---

## Deskripsi Sistem

Sistem POS (*Point of Sale*) berbasis web untuk kafe F&B berskala menengah bernama **Denjavas Cafe**. Dibangun menggunakan stack **Laravel 11 + Inertia.js + Vue 3 + Tailwind CSS** dan dioperasikan oleh kasir melalui **Tablet Android** di lingkungan operasional kafe.

### Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Backend Framework | Laravel 11 (PHP 8.2+) |
| Frontend Framework | Vue 3 + Inertia.js |
| Styling | Tailwind CSS |
| Database | MySQL / MariaDB |
| Build Tool | Vite 7 |
| PDF Generation | barryvdh/laravel-dompdf |
| Thermal Print | RawBT Protocol (ESC/POS via `rawbt:` URI scheme) |

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
| KF-02.1 | **Manajemen Data Bahan Baku (Raw Materials)** | ✅ SELESAI | `RawMaterialController` CRUD, tabel `raw_materials` dengan `unit`, `stock`, `cost_per_unit`. Supplier terintegrasi. |
| KF-02.2 | **Penyusunan Resep Terintegrasi (Recipe Linkage)** | ✅ SELESAI | Model `Recipe` polimorfik (mendukung `Menu` dan `MenuOptionItem`). Form resep di halaman Edit Menu. |
| KF-02.3 | **Otomatisasi Pemotongan Stok Real-time** | ✅ SELESAI | `InventoryService::deductStockFromOrder()` dalam `DB::transaction()` di `PosController::submitOrder()`. |
| KF-02.4 | **Pencatatan Riwayat Mutasi (Stock Ledger)** | ✅ SELESAI | Model `StockMutation` dengan `type`, `quantity`, `reference`, `notes`. Dicatat di setiap penjualan dan restock PO. |

---

### KF-03: Transaksi Kasir

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-03.1 | **Antarmuka Pemesanan Cepat (Touch-Optimized Grid)** | ✅ SELESAI | `Pos.vue` dengan grid 2–5 kolom responsif, filter kategori vertikal/horizontal. |
| KF-03.2 | **Kustomisasi Pesanan (Cart Modifier)** | ✅ SELESAI | `OptionSelectionModal.vue` dengan validasi min/max select sebelum item masuk keranjang. |
| KF-03.3 | **Manajemen Keranjang Fleksibel** | ✅ SELESAI | `CartPanel.vue` dengan increment/decrement qty, hapus item, dan input catatan per item. |
| KF-03.4 | **Tipe Pesanan & Identifikasi (Order Type)** | ✅ SELESAI | `TableSelectionModal.vue` untuk Dine-in. Takeaway otomatis jika tidak ada meja dipilih. |
| KF-03.5 | **Kalkulasi Finansial Otomatis** | ⚠️ SEBAGIAN | Subtotal dan kembalian sudah aktif di `PaymentModal.vue`. **PB1/pajak restoran belum diimplementasikan** — tidak ada kolom `tax` maupun logika kalkulasi pajak di backend atau frontend. |
| KF-03.6 | **Pencatatan Metode Pembayaran Manual** | ✅ SELESAI | Kolom `payment_method` (`cash`, `qris`, `transfer`) tersimpan di `orders`. PaymentModal menampilkan peringatan verifikasi manual untuk transfer + detail rekening BCA. |

---

### KF-04: Cetak Struk

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-04.1 | **Layout Struk Spesifik (3 Format)** | ✅ SELESAI | `PrinterService.js` mengimplementasikan `printCustomer()`, `printCashier()`, dan `printKitchen()` dengan format ESC/POS berbeda. PDF via DomPDF di route `pos.orders.print-pdf`. |
| KF-04.2 | **Integrasi Perangkat Keras (RawBT)** | ✅ SELESAI | `sendToRawBT()` mengkodekan data ke Base64 lalu mengirim via `window.location.href = "rawbt:base64,..."`. Mendukung printer thermal 58mm. |
| KF-04.3 | **Pencetakan Latar Belakang (Silent Print)** | ✅ SELESAI | Mekanisme `rawbt:` URI scheme menghilangkan dialog print bawaan browser Android. Cetakan langsung via aplikasi RawBT tanpa interupsi. |

---

### KF-05: Laporan & Analitik

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-05.1 | **Visualisasi Penjualan Fleksibel** | ✅ SELESAI | `ReportController::index()` menyediakan `dailySales`. Halaman `Admin/Reports/Index.vue` dengan grafik Chart.js + DatePicker filter rentang waktu kustom. |
| KF-05.2 | **Analisis Kinerja Produk (Best Sellers)** | ✅ SELESAI | Query `menuPerformance` merangkum total qty dan revenue per menu, diurutkan descending. Ditampilkan di tab laporan performa menu. |
| KF-05.3 | **Audit Inventaris Transparan** | ✅ SELESAI | `StockMutation` dikirimkan ke halaman laporan. Tabel `raw_materials` menampilkan stok terkini secara real-time. |
| KF-05.4 | **Pencatatan Arus Kas Operasional (Petty Cash)** | ✅ SELESAI | Route `pos.petty-cash` → `PosController::storePettyCash()`. `PettyCashModal.vue` di header POS. Terintegrasi ke kalkulasi selisih shift. |
| KF-05.5 | **Ekspor Data Universal** | ⚠️ SEBAGIAN | `ReportController::export()` menghasilkan **CSV** (via `fputcsv()`) dan **PDF** (via DomPDF) untuk semua tipe data. **Format Excel (.xlsx) native belum diimplementasikan** — tidak menggunakan library PhpSpreadsheet/Maatwebsite Excel. |

---

### KF-06: Autentikasi & Hak Akses

| ID | Fitur | Status | Keterangan Implementasi |
|----|-------|--------|------------------------|
| KF-06.1 | **Role-Based Access Control (RBAC)** | ✅ SELESAI | Middleware `role:admin` dan `role:kasir` pada seluruh route group di `web.php`. `RedirectByRole.php` mengarahkan pengguna sesuai perannya. |
| KF-06.2 | **Kredensial Admin Standar** | ✅ SELESAI | Autentikasi Laravel Breeze. Password di-hash `bcrypt`. Halaman `Auth/Login.vue` tersedia. |
| KF-06.3 | **Quick Login Kasir (PIN Tablet-Optimized)** | ⚠️ SEBAGIAN | Kolom `pin` (6 digit) sudah ada di tabel `users`. Verifikasi PIN berjalan di `PosController::startShift()`. **Namun antarmuka numpad PIN visual khusus tablet belum dibuat** — kasir masih login via form email/password standar yang sama dengan Admin. |
| KF-06.4 | **Siklus Manajemen Shift** | ✅ SELESAI | `ShiftModal.vue` (buka shift + PIN + modal awal). `EndShiftModal.vue` (tutup shift + uang fisik). `PosController::endShift()` menghitung `expected_closing_cash = opening_cash + total_cash_sales - total_petty_cash`. |

---

## Kebutuhan Non-Fungsional

| ID | Kebutuhan | Status | Keterangan |
|----|-----------|--------|-----------|
| KNF-01 | **Performa** — Load time < 2 detik di tablet Android mid-range | ✅ TERPENUHI | Aset dikompilasi via Vite dengan code-splitting. Data POS di-load via Inertia.js (SPA) tanpa full page reload. |
| KNF-02 | **Responsifitas** — Tablet-first, touch-optimized, min. 768px landscape | ✅ TERPENUHI | Breakpoint `lg:` Tailwind konsisten. Mode mobile (bottom bar + cart drawer) dan mode tablet (3-kolom). Tombol berukuran besar untuk ketepatan sentuhan. |
| KNF-03 | **Keandalan Transaksi** — DB Transaction untuk order + deduction stok | ✅ TERPENUHI | `submitOrder()` dan `voidOrder()` dikapsulasi dalam `DB::transaction()`. Rollback otomatis jika terjadi error. |

---

## Batasan Sistem

| Batasan | Penjelasan |
|---------|-----------|
| **Batas Inventaris** | Tidak ada notifikasi stok minimum otomatis. Ketersediaan menu dikontrol manual via toggle `is_active`. |
| **Ruang Lingkup Finansial** | Hanya laporan pendapatan kotor/bersih dan pengeluaran kasir. Tidak ada modul akuntansi standar (Jurnal Umum, Buku Besar, Neraca). |
| **Ketergantungan Perangkat Keras** | Fitur cetak struk thermal memerlukan aplikasi **RawBT** terinstal di Android dan printer thermal Bluetooth kompatibel ESC/POS. |
| **Ketergantungan Jaringan** | Aplikasi *online-only*. Tidak ada mekanisme penyimpanan lokal; operasional memerlukan koneksi internet stabil. |

---

## Ringkasan Status Implementasi

```
KF-01 Manajemen Menu           ████████████████████ 100%  (6/6 selesai)
KF-02 Manajemen Inventaris     ████████████████████ 100%  (4/4 selesai)
KF-03 Transaksi Kasir          █████████████████░░░  83%  (5/6 selesai, 1 sebagian)
KF-04 Cetak Struk              ████████████████████ 100%  (3/3 selesai)
KF-05 Laporan & Analitik       ████████████████░░░░  80%  (4/5 selesai, 1 sebagian)
KF-06 Autentikasi & Hak Akses  ███████████████░░░░░  75%  (3/4 selesai, 1 sebagian)
KNF   Kebutuhan Non-Fungsional ████████████████████ 100%  (3/3 terpenuhi)

TOTAL KESELURUHAN              ████████████████████  91%  (25/28 fitur selesai)
```

### Gap yang Belum Diimplementasikan (3 item)

| Prioritas | ID | Fitur | Gap yang Tersisa |
|-----------|-----|-------|-----------------|
| 🔴 Tinggi | KF-06.3 | Quick Login Kasir (PIN) | UI numpad tablet-optimized belum dibuat. Kasir masih login via form email/password standar. |
| 🟡 Sedang | KF-03.5 | Kalkulasi PB1/Pajak | Logika kalkulasi pajak restoran PB1 belum ada di backend maupun frontend. |
| 🟢 Rendah | KF-05.5 | Ekspor Excel (.xlsx) | Hanya CSV yang tersedia. Format `.xlsx` native belum diimplementasikan (perlu library PhpSpreadsheet). |

---

## Future Works (Rencana Pengembangan)

Fitur-fitur berikut telah direncanakan namun **tidak termasuk dalam lingkup versi saat ini**:

| Fitur | Deskripsi |
|-------|-----------|
| **Integrasi Payment Gateway (QRIS Dinamis)** | Otomatisasi verifikasi pembayaran via webhook Midtrans/Xendit. Layar tablet merespons "Lunas" otomatis setelah pelanggan membayar via e-wallet/M-Banking. Menutup celah kecurangan bukti transfer palsu. |
| **Self-Ordering System** | Portal web pelanggan via QR Code di meja. Pelanggan menelusuri katalog, memesan, dan membayar mandiri dari perangkat pribadi; pesanan langsung masuk ke antrean kasir. |
| **Sistem Toleransi Offline** | Penyimpanan lokal via IndexedDB/LocalStorage agar kasir dapat memproses transaksi tunai saat Wi-Fi terputus, dengan sinkronisasi otomatis setelah koneksi pulih. |
| **Kitchen Display System (KDS)** | Monitor interaktif di area dapur pengganti struk kertas. Koki memantau pesanan masuk *real-time* dan dapat menandai pesanan selesai (*bump*). |

---

*Dokumen ini dihasilkan dari audit kode sumber pada: 18 Mei 2026*
*Lokasi proyek: `D:\Cafe-POS`*
*File terkait: [SRS.md](file:///D:/Cafe-POS/docs/SRS.md)*
