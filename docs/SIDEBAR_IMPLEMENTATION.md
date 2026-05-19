# Sidebar Navigation — Implementation Guide

> **Status:** ✅ Selesai (Diimplementasikan)
> **Target File Utama:** `resources/js/Layouts/AuthenticatedLayout.vue`
> **Dibuat:** 17 Mei 2026
> **Selesai:** 18 Mei 2026

---

## 1. Latar Belakang

Navbar horizontal sebelumnya menampung **9 menu item** untuk role `admin` yang sudah sangat padat. Migrasi ke sidebar vertikal telah dilakukan untuk:

- Memberikan ruang untuk pengelompokan menu secara logis
- Meningkatkan skalabilitas (penambahan fitur baru tanpa masalah overflow)
- Menyelaraskan estetika dengan gaya dashboard premium yang sudah diterapkan

---

## 2. Struktur Menu (Implementasi Aktual)

### Role: Admin

```
UTAMA
  ├─ 📊 Dashboard              → route('dashboard')

PRODUK & LAYOUT
  ├─ 🍽️ Katalog Menu           → route('admin.menus.index')
  ├─ 📁 Kategori Menu          → route('admin.categories.index')
  ├─ 🪑 Layout Meja            → route('admin.tables.index')

INVENTORI
  ├─ 📦 Bahan Baku             → route('admin.raw-materials.index')
  ├─ 🚚 Supplier               → route('admin.suppliers.index')
  ├─ 📥 Stok Masuk             → route('admin.purchase-orders.index')

KARYAWAN
  ├─ 👤 Manajemen Kasir        → route('admin.cashiers.index')

LAPORAN
  ├─ 📈 Laporan & Riwayat      → route('admin.reports.index')
```

### Role: Kasir (POS Sidebar — `PosSidebar.vue`)

```
  ├─ 🖥️ Menu (POS Utama)       → route('pos')
  ├─ 📋 Pesanan Aktif          → route('pos.active-orders')
  ├─ 📜 Riwayat                → route('pos.history')
  ├─ 💸 Kas Keluar             → (emit: open petty cash modal)
  ├─ ⏹ Tutup Shift            → (emit: open end shift modal)
  ├─ 🚪 Logout                 → POST /logout
```

---

## 3. Arsitektur Komponen (Implementasi)

| File | Aksi | Status |
|------|------|--------|
| `Layouts/AuthenticatedLayout.vue` | **MODIFIED** — Refaktor dari navbar ke sidebar + top bar | ✅ |
| `Pos/Partials/PosSidebar.vue` | **NEW** — Sidebar kasir sempit (~80px) | ✅ |

---

## 4. Spesifikasi Desain (Implementasi Aktual)

### 4.1 Layout Grid

```
┌──────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────┐ │
│ │          │ │  Top Bar (breadcrumb, user info)  │ │
│ │          │ ├──────────────────────────────────┤ │
│ │ SIDEBAR  │ │                                  │ │
│ │  240px   │ │        MAIN CONTENT              │ │
│ │  fixed   │ │        (slot area)               │ │
│ │          │ │                                  │ │
│ │          │ │                                  │ │
│ │          │ │                                  │ │
│ └──────────┘ └──────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 4.2 Skema Warna (Implementasi Aktual)

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| Sidebar BG | `#FFFFFF` | Background sidebar |
| Sidebar Width | `240px` | Lebar sidebar |
| Sidebar Border | `border-slate-100` | Border kanan sidebar |
| Section Header | `text-slate-400` | Section header text |
| Inactive Item | `text-slate-500` | Inactive menu text |
| Hover BG | `bg-slate-50` | Hover background |
| Active Icon Color | `text-amber-700` | Active item icon (`#B45309`) |
| Active Text Color | `text-slate-800` | Active item text |
| Content BG | `#F8F9FD` | Background area konten |

> **Catatan:** Warna aktif menggunakan **amber-700** (`#B45309`), bukan indigo, untuk menyelaraskan dengan identitas brand Denjavas Cafe.

### 4.3 User Profile Card (Sidebar Bawah)

- Avatar: Inisial nama dalam lingkaran `w-10 h-10 bg-amber-50 text-amber-700`
- Nama: `text-sm font-bold text-slate-800`
- Role badge: `text-[9px] uppercase tracking-widest text-slate-400`
- Tombol logout: ikon kecil di kanan

---

## 5. Checklist Implementasi

```
[x] 1. Refactor `AuthenticatedLayout.vue` (sidebar + top bar + main content)
[x] 2. Buat `PosSidebar.vue` untuk navigasi kasir
[x] 3. Sidebar selalu tampil pada halaman admin dan POS history
[x] 4. Mobile responsive (drawer + overlay) untuk layar < 1024px
[x] 5. User profile card di bawah sidebar
[x] 6. Breadcrumb di top bar
[x] 7. Verifikasi semua halaman admin berfungsi normal
[x] 8. Verifikasi POS Kasir berfungsi normal
[x] 9. Update CHANGELOG.md
```

---

*Implementasi sidebar telah selesai dan berfungsi dengan baik di seluruh halaman admin dan POS.*
