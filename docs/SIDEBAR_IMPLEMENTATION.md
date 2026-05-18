# Sidebar Navigation — Implementation Guide

> **Status:** 📋 Pending  
> **Target File Utama:** `resources/js/Layouts/AuthenticatedLayout.vue`  
> **Dibuat:** 17 Mei 2026  

---

## 1. Latar Belakang

Navbar horizontal saat ini menampung **9 menu item** untuk role `admin` yang sudah sangat padat. Migrasi ke sidebar vertikal akan:

- Memberikan ruang untuk pengelompokan menu secara logis
- Meningkatkan skalabilitas (penambahan fitur baru tanpa masalah overflow)
- Menyelaraskan estetika dengan gaya dashboard premium "DealDeck" yang sudah diterapkan

### Referensi Visual

Desain terinspirasi dari referensi UI berikut:
- Sidebar kiri dengan latar belakang putih/light
- Menu item dengan ikon + label
- Pengelompokan menu dengan section header kecil
- Active state dengan rounded highlight dan aksen warna brand
- User profile card di bagian bawah sidebar

---

## 2. Struktur Menu

### Role: Admin

```
UTAMA
  ├─ 📊 Dashboard              → route('dashboard')

PRODUK
  ├─ 🍽️ Katalog Menu           → route('admin.menus.index')
  ├─ 📁 Kategori Menu          → route('admin.categories.index')
  ├─ 🪑 Layout Meja            → route('admin.tables.index')

INVENTORI
  ├─ 📦 Stok Bahan Baku        → route('admin.raw-materials.index')
  ├─ 🚚 Supplier               → route('admin.suppliers.index')
  ├─ 📥 Stok Masuk             → route('admin.purchase-orders.index')

LAPORAN
  ├─ 📈 Laporan & Riwayat      → route('admin.reports.index')
```

### Role: Kasir

```
UTAMA
  ├─ 🖥️ POS Kasir              → route('pos')
  ├─ 📜 Riwayat Transaksi      → route('pos.history')
```

> **Catatan:** Halaman POS Kasir (`Pos.vue`) sebaiknya tetap menggunakan mode **full-screen tanpa sidebar** karena kebutuhan layar maksimal untuk operasional kasir. Sidebar hanya ditampilkan untuk halaman admin.

---

## 3. Arsitektur Komponen

### 3.1 File yang Perlu Diubah

| File | Aksi | Keterangan |
|------|------|------------|
| `Layouts/AuthenticatedLayout.vue` | **MODIFY** | Perombakan total — navbar → sidebar + top bar |
| `Components/SidebarLink.vue` | **NEW** | Komponen link sidebar (menggantikan NavLink di sidebar) |

### 3.2 File yang TIDAK Perlu Diubah

Semua **22 halaman** (`Dashboard.vue`, `Reports/Index.vue`, dll.) **tidak perlu dimodifikasi** karena menggunakan sistem `<slot>` dari `AuthenticatedLayout`. Konten halaman otomatis menyesuaikan container baru.

---

## 4. Spesifikasi Desain

### 4.1 Layout Grid

```
┌──────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────┐ │
│ │          │ │  Top Bar (user info, search)     │ │
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

### 4.2 Sidebar (Panel Kiri)

```
Lebar           : 240px (fixed, tidak collapsible v1)
Background      : #FFFFFF (putih bersih)
Border          : border-r border-slate-100
Posisi          : fixed left-0 top-0 h-screen
z-index         : 40
Overflow        : overflow-y-auto (scrollable jika menu banyak)
```

**Elemen Internal (dari atas ke bawah):**

1. **Logo Area** (`h-16`)
   - Logo "Denjavas." dengan font serif
   - Padding horizontal seragam `px-6`

2. **Section Headers**
   - Font: `text-[10px] font-black uppercase tracking-[0.2em]`
   - Color: `text-slate-400`
   - Padding: `px-6 pt-8 pb-2`

3. **Menu Items**
   - Padding: `px-3` (container), lalu tiap item `px-4 py-3`
   - Border radius: `rounded-xl`
   - Icon: `w-5 h-5` dengan `stroke-width="2"`
   - Label: `text-[13px] font-semibold`
   - Gap antara icon dan label: `gap-3`
   - **Inactive state:**
     - Text: `text-slate-500`
     - Background: `transparent`
     - Hover: `bg-slate-50 text-slate-700`
   - **Active state:**
     - Text: `text-indigo-600`
     - Background: `bg-indigo-50`
     - Font weight: `font-bold`

4. **User Profile Card** (bagian bawah, `mt-auto`)
   - Background: `bg-slate-50 rounded-2xl mx-4 mb-4 p-4`
   - Avatar placeholder: inisial nama dalam lingkaran `w-10 h-10`
   - Nama user: `text-sm font-bold`
   - Role badge: `text-[9px] uppercase tracking-widest`
   - Tombol logout sebagai icon kecil di kanan

### 4.3 Top Bar (Panel Kanan Atas)

```
Tinggi          : h-16
Background      : transparent atau bg-[#F8F9FD]
Posisi          : sticky top-0
Margin kiri     : ml-[240px] (mengikuti lebar sidebar)
```

**Elemen Internal:**
- Kiri: Slot `#header` dari setiap halaman (judul halaman, filter, dll.)
- Kanan: Theme switcher + notifikasi shift aktif

### 4.4 Main Content Area

```
Margin kiri     : ml-[240px]
Background      : bg-[#F8F9FD] (lavender-light, konsisten dengan dashboard)
Min height      : min-h-screen
Padding         : sesuai halaman masing-masing (sudah diatur per page)
```

---

## 5. Responsivitas (Mobile)

### Breakpoint: `< 1024px (lg)`

1. **Sidebar** → disembunyikan secara default (`-translate-x-full`)
2. **Hamburger button** → muncul di top bar kiri
3. **Overlay** → backdrop gelap semi-transparan (`bg-black/30`) saat sidebar terbuka
4. **Gesture** → klik overlay atau tombol close untuk menutup sidebar
5. **Main content** → kembali ke `ml-0` (full width)

```
State: Sidebar Tertutup          State: Sidebar Terbuka
┌────────────────────┐           ┌──────────┬───────────┐
│ ☰  Page Title      │           │          │ (overlay) │
├────────────────────┤           │ SIDEBAR  │           │
│                    │           │          │           │
│   MAIN CONTENT     │           │          │           │
│   (full width)     │           │          │           │
│                    │           └──────────┴───────────┘
└────────────────────┘
```

---

## 6. Skema Warna & Token Desain

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| `--sidebar-bg` | `#FFFFFF` | Background sidebar |
| `--sidebar-width` | `240px` | Lebar sidebar |
| `--sidebar-border` | `#F1F5F9` (slate-100) | Border kanan sidebar |
| `--sidebar-section` | `#94A3B8` (slate-400) | Section header text |
| `--sidebar-item` | `#64748B` (slate-500) | Inactive menu text |
| `--sidebar-item-hover` | `#F8FAFC` (slate-50) | Hover background |
| `--sidebar-active-bg` | `#EEF2FF` (indigo-50) | Active item background |
| `--sidebar-active-text` | `#4F46E5` (indigo-600) | Active item text + icon |
| `--content-bg` | `#F8F9FD` | Background area konten |
| `--topbar-height` | `64px` | Tinggi top bar |

---

## 7. Ikon per Menu Item (SVG Inline)

Setiap menu item menggunakan ikon SVG inline berukuran `w-5 h-5` dengan `stroke-width="2"`:

| Menu | Ikon (Deskripsi) |
|------|-----------------|
| Dashboard | Grid/chart icon (4 kotak) |
| Katalog Menu | Book/menu icon |
| Kategori Menu | Folder icon |
| Layout Meja | Layout/grid icon |
| Stok Bahan Baku | Package/box icon |
| Supplier | Truck icon |
| Stok Masuk | Download/inbox icon |
| Laporan | Bar chart/trending icon |

---

## 8. Komponen Baru: `SidebarLink.vue`

### Props

```js
defineProps({
    href: { type: String, required: true },
    active: { type: Boolean, default: false },
    icon: { type: String, default: null }  // slot-based, bukan prop
})
```

### Template Skeleton

```html
<Link
    :href="href"
    :class="[
        'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200',
        active
            ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold'
    ]"
>
    <slot name="icon" />
    <slot />
</Link>
```

---

## 9. Struktur Template AuthenticatedLayout (Pseudocode)

```html
<div class="flex min-h-screen">

    <!-- SIDEBAR (Admin Only) -->
    <aside v-if="isAdmin" class="fixed left-0 top-0 h-screen w-[240px] bg-white
        border-r border-slate-100 z-40 flex flex-col
        transition-transform duration-300 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
        <!-- Logo -->
        <!-- Section: UTAMA -->
        <!-- Section: PRODUK -->
        <!-- Section: INVENTORI -->
        <!-- Section: LAPORAN -->
        <!-- Spacer (mt-auto) -->
        <!-- User Profile Card -->
    </aside>

    <!-- MOBILE OVERLAY -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false"
        class="fixed inset-0 bg-black/30 z-30 lg:hidden" />

    <!-- MAIN WRAPPER -->
    <div :class="isAdmin ? 'lg:ml-[240px]' : ''" class="flex-1 flex flex-col">

        <!-- TOP BAR -->
        <header class="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur
            border-b border-slate-100 flex items-center px-6">
            <!-- Hamburger (mobile) -->
            <!-- Page Header Slot -->
            <!-- Right: Theme toggle, Shift indicator -->
        </header>

        <!-- PAGE CONTENT -->
        <main class="flex-1 bg-[#F8F9FD]">
            <slot />
        </main>
    </div>
</div>
```

---

## 10. Checklist Implementasi

```
[ ] 1. Buat komponen `SidebarLink.vue`
[ ] 2. Refactor `AuthenticatedLayout.vue`:
      [ ] 2a. Struktur flex container (sidebar + main)
      [ ] 2b. Sidebar panel dengan logo, sections, menu items
      [ ] 2c. User profile card di bawah sidebar
      [ ] 2d. Top bar dengan header slot + user controls
      [ ] 2e. Mobile responsive (drawer + overlay)
[ ] 3. Hapus komponen yang tidak diperlukan lagi:
      [ ] 3a. NavLink.vue (jika hanya dipakai di navbar) — EVALUASI DULU
      [ ] 3b. ResponsiveNavLink.vue — EVALUASI DULU
[ ] 4. Testing visual di semua halaman admin
[ ] 5. Verifikasi POS Kasir tetap full-screen
[ ] 6. Update dokumentasi (CHANGELOG.md)
```

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Tag HTML tidak seimbang saat refactor | Vite compilation error | Validasi struktur div sebelum save |
| Halaman anak terganggu layoutnya | Visual rusak | Test setiap halaman setelah perubahan |
| POS Kasir ikut terdampak sidebar | Area kerja kasir menyempit | Kondisional `v-if="isAdmin"` pada sidebar |
| Mobile sidebar z-index conflict | Overlay tidak berfungsi | Gunakan z-index bertingkat (30 overlay, 40 sidebar) |

---

## 12. Catatan Penting

1. **Jangan ubah halaman anak** — Semua perubahan terisolasi di `AuthenticatedLayout.vue` dan komponen baru `SidebarLink.vue`.
2. **Pertahankan font** — Tetap gunakan `Inter` (sans) dan `Playfair Display` (serif) yang sudah ada.
3. **Pertahankan warna brand** — Aksen utama tetap `indigo-600` sesuai desain DealDeck saat ini.
4. **Tag penutup** — Berdasarkan riwayat bug (`BUG_LOG.md`), selalu verifikasi keseimbangan `<div>` dan `</div>` sebelum commit.
