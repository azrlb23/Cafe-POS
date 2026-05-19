# Daftar Akun Pengguna — Denjavas Retro Café POS

> Dokumen ini berisi kredensial default untuk seluruh akun yang tersedia di sistem POS Denjavas Retro Café.
> **Penting:** Ganti password dan PIN default sebelum digunakan di lingkungan produksi.
> **Terakhir diperbarui:** 19 Mei 2026

---

## Admin

| Field    | Value                  |
|----------|------------------------|
| Nama     | Administrator          |
| Email    | `admin@denjavas.com`   |
| Password | `password`             |
| PIN      | `123456`               |
| Role     | **Admin**              |

---

## Kasir

| # | Nama    | Email                    | Password   | PIN      |
|---|---------|--------------------------|------------|----------|
| 1 | Kasir 1 | `kasir@denjavas.com`     | `password` | `654321` |
| 2 | Kasir 2 | `kasir2@denjavas.com`    | `password` | `111222` |
| 3 | Kasir 3 | `kasir3@denjavas.com`    | `password` | `333444` |
| 4 | Kasir 4 | `kasir4@denjavas.com`    | `password` | `555666` |

> **Catatan:** Kasir baru dapat didaftarkan oleh Admin melalui menu Sidebar → **Manajemen Kasir** → **Tambah Kasir Baru**.

---

## Cara Login

### Sebagai Admin
1. Buka halaman login di browser (`http://localhost:8000/login`)
2. Masukkan **email** dan **password** admin
3. Anda akan diarahkan ke Dashboard Analitik

### Sebagai Kasir
1. Buka halaman login di browser (`http://localhost:8000/login`)
2. Masukkan **email** dan **password** kasir
3. Anda akan diarahkan ke antarmuka POS (Point of Sale)
4. Untuk **membuka shift**, masukkan **PIN** kasir dan jumlah modal awal

---

## Catatan Keamanan

- Semua password menggunakan default `password` — **wajib diganti** di production
- PIN 6-digit digunakan kasir untuk membuka/menutup shift sebagai verifikasi identitas
- Admin dapat memantau aktivitas semua kasir melalui Sidebar → **Manajemen Kasir**
- Admin dapat mengakhiri sesi shift kasir yang masih terbuka dari halaman Manajemen Kasir
- Admin dapat menambah, mengedit, dan menghapus akun kasir dari halaman mandiri (bukan popup)
