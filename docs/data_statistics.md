# Data Statistics — Acuan Analitik Dashboard Denjavas Cafe-POS

Dokumen ini adalah referensi utama untuk semua data yang tersedia di sistem POS dan bagaimana data tersebut dapat divisualisasikan menjadi grafik/laporan yang komprehensif di Dashboard Admin.

> **Konvensi Status:**
> - ✅ Sudah diimplementasikan di Dashboard
> - 🔲 Belum diimplementasikan (Backlog)

---

## A. DATA FINANSIAL (Pendapatan & Pengeluaran)

Sumber: `orders`, `petty_cashes`, `shifts`

| # | Data Point | Deskripsi | Kolom/Query | Status |
|---|-----------|-----------|-------------|--------|
| A1 | **Total Omzet (Gross Revenue)** | Akumulasi `total` dari semua pesanan `completed` dalam periode tertentu | `orders.total WHERE status='completed'` | ✅ |
| A2 | **Perbandingan Periode** | Tren naik/turun pendapatan vs periode sebelumnya (%) | Kalkulasi di controller | ✅ |
| A3 | **Total Kas Keluar (Petty Cash)** | Rekapitulasi uang keluar dari laci untuk kebutuhan operasional | `petty_cashes.amount` | ✅ |
| A4 | **Estimasi Saldo Laci** | Saldo tunai yang seharusnya ada di kasir saat shift aktif | `shifts.running_balance` | ✅ |
| A5 | **Distribusi Metode Pembayaran** | Proporsi Cash vs QRIS vs E-wallet vs Transfer | `orders.payment_method` | 🔲 |
| A6 | **Pendapatan per Kategori Menu** | Revenue dikelompokkan berdasarkan kategori (Kopi, Makanan, dll) | `order_items → menus → categories` | 🔲 |
| A7 | **Laba Kotor Harian** | Revenue dikurangi Petty Cash per hari | `orders.total - petty_cashes.amount` (per hari) | 🔲 |
| A8 | **Rata-rata Nilai Pesanan (Avg. Basket)** | Rata-rata `total` per transaksi dalam periode | `AVG(orders.total)` | 🔲 |

---

## B. DATA PENJUALAN & PRODUKTIVITAS

Sumber: `orders`, `order_items`, `menus`, `categories`, `cafe_tables`

| # | Data Point | Deskripsi | Kolom/Query | Status |
|---|-----------|-----------|-------------|--------|
| B1 | **Volume Transaksi** | Jumlah total pesanan sukses per hari | `COUNT(orders) WHERE status='completed'` | ✅ |
| B2 | **Menu Terlaris (Best Seller)** | Top 5 menu berdasarkan kuantitas terjual | `order_items.quantity GROUP BY menu_id` | ✅ |
| B3 | **Tren Penjualan Harian** | Grafik omzet per hari dalam rentang waktu | `SUM(orders.total) GROUP BY DATE(created_at)` | ✅ |
| B4 | **Distribusi Dine-in vs Takeaway** | Rasio tipe pesanan | `orders.order_type` | 🔲 |
| B5 | **Distribusi Pesanan per Meja** | Frekuensi penggunaan setiap nomor meja | `orders.cafe_table_id` | 🔲 |
| B6 | **Jam Sibuk (Peak Hours)** | Distribusi pesanan berdasarkan jam dalam sehari | `HOUR(orders.created_at) GROUP BY hour` | 🔲 |
| B7 | **Menu Kurang Diminati** | Menu yang jarang/tidak pernah terjual | `menus LEFT JOIN order_items (qty rendah)` | 🔲 |
| B8 | **Kontribusi Varian** | Opsi/varian menu mana yang paling sering dipilih | `order_item_options → menu_option_items` | 🔲 |

---

## C. DATA INVENTORI & BAHAN BAKU

Sumber: `raw_materials`, `stock_mutations`, `recipes`

| # | Data Point | Deskripsi | Kolom/Query | Status |
|---|-----------|-----------|-------------|--------|
| C1 | **Stok Real-time** | Posisi stok bahan baku saat ini | `raw_materials.current_stock` | ✅ (alert) |
| C2 | **Peringatan Stok Kritis** | Bahan baku yang sudah ≤ batas minimum | `current_stock <= minimum_stock` | ✅ |
| C3 | **Riwayat Mutasi Stok** | Timeline masuk/keluarnya bahan baku | `stock_mutations (type, quantity, reference)` | 🔲 |
| C4 | **Konsumsi Bahan per Periode** | Estimasi bahan baku terpakai berdasarkan penjualan & resep | `recipes.quantity × order_items.quantity` | 🔲 |
| C5 | **Proyeksi Kehabisan Stok** | Estimasi kapan bahan akan habis berdasarkan rata-rata pemakaian harian | Kalkulasi (konsumsi harian / stok sisa) | 🔲 |

---

## D. DATA OPERASIONAL SHIFT & SDM

Sumber: `shifts`, `users`, `orders`

| # | Data Point | Deskripsi | Kolom/Query | Status |
|---|-----------|-----------|-------------|--------|
| D1 | **Riwayat Shift** | Tabel buka/tutup shift: modal awal, total penjualan, selisih | `shifts.*` | 🔲 |
| D2 | **Selisih Kas per Shift** | Perbedaan antara uang fisik dan ekspektasi sistem | `shifts.closing_cash - expected_closing_cash` | 🔲 |
| D3 | **Log Pembatalan (Void Audit)** | Daftar pesanan void + alasan + kasir yang bertanggung jawab | `orders WHERE status='void' + void_reason` | 🔲 |
| D4 | **Performa Kasir** | Jumlah & total transaksi per kasir | `orders GROUP BY user_id` | 🔲 |
| D5 | **Durasi Shift** | Lama waktu kerja per shift | `shifts.closed_at - shifts.opened_at` | 🔲 |

---

## E. REKOMENDASI VISUALISASI GRAFIK

Berikut adalah rekomendasi grafik komprehensif yang akan memberikan nilai analitis tinggi bagi Admin/Manager:

### 📊 Grafik Prioritas Tinggi (Wajib Ada)

| Grafik | Tipe Chart | Data Source | Insight yang Diberikan |
|--------|-----------|-------------|----------------------|
| **Tren Pendapatan** | Line Chart (area fill) | A1, B3 | Mendeteksi pola kenaikan/penurunan omzet harian/mingguan |
| **Top Menu Terlaris** | Horizontal Bar Chart | B2 | Membantu keputusan pembelian bahan baku & promosi |
| **Distribusi Metode Pembayaran** | Donut/Pie Chart | A5 | Memahami preferensi bayar pelanggan, apakah perlu tambah opsi |
| **Jam Sibuk (Heatmap)** | Heatmap / Stacked Bar | B6 | Mengoptimalkan jadwal kerja staf & persiapan bahan |
| **Pendapatan vs Pengeluaran** | Dual-axis Line Chart | A1, A3 | Visualisasi *net income* setiap harinya, deteksi anomali pengeluaran |

### 📈 Grafik Prioritas Sedang (Sangat Berguna)

| Grafik | Tipe Chart | Data Source | Insight yang Diberikan |
|--------|-----------|-------------|----------------------|
| **Dine-in vs Takeaway** | Pie Chart + Trend Line | B4 | Mengetahui apakah kafe lebih diminati untuk makan di tempat atau dibawa pulang |
| **Revenue per Kategori** | Stacked Bar / Treemap | A6 | Mengetahui kategori mana penghasil uang terbesar |
| **Audit Void Order** | Timeline / Table | D3 | Mendeteksi pola pembatalan mencurigakan (potensi kecurangan) |
| **Selisih Kas per Shift** | Bar Chart (+ / - diverging) | D2 | Mendeteksi kasir yang sering memiliki selisih uang |
| **Stok Bahan Baku** | Horizontal Gauge / Progress Bar | C1, C2 | Melihat level stok secara visual, siap/tidak siap operasional |

### 📉 Grafik Prioritas Rendah (Nice to Have)

| Grafik | Tipe Chart | Data Source | Insight yang Diberikan |
|--------|-----------|-------------|----------------------|
| **Peta Meja Populer** | Bubble Chart / Grid Heatmap | B5 | Mengetahui meja favorit pelanggan, optimasi layout kafe |
| **Menu Tidak Laku** | Table with flags | B7 | Pertimbangan untuk menghapus menu dari daftar |
| **Proyeksi Kehabisan Stok** | Gauge / Countdown | C5 | Estimasi hari menuju kehabisan bahan baku kritis |
| **Performa Kasir** | Radar / Table | D4 | Evaluasi produktivitas masing-masing kasir |
| **Kontribusi Varian** | Treemap | B8 | Mengetahui varian mana yang sering dipilih (size L vs M, dll) |

---

## F. CATATAN IMPLEMENTASI

1. **Semua grafik harus mendukung filter rentang waktu** (start_date, end_date) yang sudah diimplementasikan di `DashboardController`.
2. **Grafik Prioritas Tinggi** sebaiknya berada di halaman Dashboard utama.
3. **Grafik Prioritas Sedang** sebaiknya berada di halaman laporan tersendiri (terpisah dari dashboard) agar tampilan tidak terlalu padat.
4. **Grafik Prioritas Rendah** bisa diimplementasikan secara bertahap sesuai kebutuhan operasional nyata.
5. Library yang digunakan: **Chart.js** (via `vue-chartjs`) — sudah terinstal.
