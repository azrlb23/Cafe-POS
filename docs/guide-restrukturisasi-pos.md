# Guide Restrukturisasi Layout POS Kasir — Denjavas Retro Café

> **Status:** ✅ Selesai (Diimplementasikan)
> Dokumen analisa visual & panduan teknis untuk menyesuaikan antarmuka POS Denjavas
> berdasarkan gambar referensi desain POS modern.

---

## Struktur Layout Aktual (3 Kolom + Sidebar)

```
┌──────┬───────────────────────────────┬──────────────┐
│      │   SEARCH BAR + USER INFO     │              │
│ S    ├──────────────────────────────-│  ORDER       │
│ I    │   HORIZONTAL CATEGORY ROW     │  DETAILS     │
│ D    ├──────────────────────────────-│  PANEL       │
│ E    │                               │              │
│ B    │   MENU GRID (responsive)      │  - Header    │
│ A    │                               │  - Type Tabs │
│ R    │                               │  - Items     │
│      │                               │  - Summary   │
│      │                               │  - Actions   │
└──────┴───────────────────────────────┴──────────────┘
```

| Zona | Lebar | Isi |
|------|-------|-----|
| Sidebar Kiri | ~80px | Logo, Menu, Pesanan Aktif, Riwayat, Kas Keluar, Tutup Shift, Logout |
| Konten Tengah | flex-1 | Search bar, horizontal category cards, menu grid responsif |
| Panel Kanan | ~380px | Order Details, order type tabs, item list (grouped), summary, action buttons |

---

## Status Implementasi

| # | Aspek | Sebelumnya | Sekarang | Status |
|---|-------|------------|----------|--------|
| 1 | Sidebar navigasi kasir | Top bar saja | `PosSidebar.vue` — sidebar vertikal sempit | ✅ |
| 2 | Search bar | Tidak ada | Pill search di atas area menu | ✅ |
| 3 | Category layout | Vertical sidebar | Horizontal card row + ikon | ✅ |
| 4 | Menu grid | Card vertikal + harga overlay | Card responsif + tombol ADD | ✅ |
| 5 | Panel kanan — header | Sederhana | Order Details + kasir name + date/time | ✅ |
| 6 | Panel kanan — order type | Lewat table modal | Tab buttons inline (Dine In / Take Away) | ✅ |
| 7 | Panel kanan — item display | Card +/- controls | Nama + harga + varian pills + catatan | ✅ |
| 8 | Panel kanan — summary | Subtotal only | Subtotal (tanpa tax/service sesuai keputusan bisnis) | ✅ |
| 9 | Panel kanan — actions | Single button | Dropdown Opsi Cetak + Charge (CTA utama) | ✅ |

---

## File yang Dimodifikasi

| File | Aksi | Keterangan |
|------|------|------------|
| `Pos.vue` | **MODIFIED** | Layout 3-kolom dengan sidebar, search bar, kategori horizontal |
| `Pos/Partials/PosSidebar.vue` | **NEW** | Komponen sidebar kasir ~80px |
| `Pos/Partials/CartPanel.vue` | **MODIFIED** | Redesain panel kanan dengan tab layanan inline, catatan per item |
| `Pos/ActiveOrders.vue` | **NEW** | Halaman pesanan aktif |
| `Pos/History.vue` | **MODIFIED** | Halaman riwayat dengan sidebar |

---

*Restrukturisasi POS telah selesai dan seluruh aspek dari referensi desain telah diimplementasikan.*
