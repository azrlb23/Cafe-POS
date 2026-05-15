# Denjavas POS - Database Schema

Dokumentasi struktur tabel, kolom, dan relasi *foreign key* dalam sistem Denjavas POS.

> **Terakhir diperbarui:** 15 Mei 2026 — Mencakup semua migrasi termasuk `void_reason`, `minimum_stock`, `petty_cashes`, dan breakdown shift.

---

## Tabel Inti (Katalog & Inventaris)

### 1. `categories`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `name` | String | Nama kategori (Kopi, Snack, dll) |

### 2. `menus`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `category_id` | FK → categories | *Restrict On Delete* |
| `name` | String | |
| `description` | Text, Nullable | |
| `image_path` | String, Nullable | Path gambar di storage |
| `base_price` | Decimal(12,2) | Harga dasar |
| `is_active` | Boolean | Toggle ketersediaan |

### 3. `menu_option_groups`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `menu_id` | FK → menus | *Cascade On Delete* |
| `name` | String | Nama grup (Ukuran, Suhu, dll) |
| `min_select` | Integer | Min pilihan wajib |
| `max_select` | Integer | Max pilihan diizinkan |

### 4. `menu_option_items`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `menu_option_group_id` | FK → menu_option_groups | *Cascade On Delete* |
| `name` | String | Nama opsi (Large, Panas, dll) |
| `price_modifier` | Decimal(12,2) | Tambahan harga |
| `is_available` | Boolean | Toggle ketersediaan opsi |

### 5. `raw_materials`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `name` | String | |
| `unit` | Enum: gram, ml, pcs | Satuan ukur |
| `current_stock` | Decimal(10,2) | Stok saat ini |
| `minimum_stock` | Decimal(10,2) | Batas minimum (untuk alert) |

### 6. `recipes` *(Bill of Materials / BOM)*
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `raw_material_id` | FK → raw_materials | *Restrict On Delete* |
| `menu_id` | FK → menus, Nullable | *Cascade On Delete* |
| `menu_option_item_id` | FK → menu_option_items, Nullable | *Cascade On Delete* |
| `quantity` | Decimal(8,2) | Jumlah bahan per porsi |
| *Unique* | | `[raw_material_id, menu_id]` |
| *Unique* | | `[raw_material_id, menu_option_item_id]` |

---

## Tabel Operasional (Transaksi & Shift)

### 7. `cafe_tables`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `number` | Integer, Unique | Nomor meja (1–30) |
| `status` | Enum: available, occupied | |

### 8. `shifts`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `user_id` | FK → users | *Restrict On Delete* |
| `opened_at` | Timestamp | Waktu buka shift |
| `closed_at` | Timestamp, Nullable | Waktu tutup (null = aktif) |
| `opening_cash` | Decimal(12,2) | Kas awal |
| `closing_cash` | Decimal(12,2), Nullable | Kas akhir (diisi saat tutup) |
| `total_sales` | Decimal(12,2) | Total penjualan selama shift |
| `total_cash_sales` | Decimal(12,2) | Total penjualan tunai saja |
| `expected_closing_cash` | Decimal(12,2) | Ekspektasi uang fisik di laci |
| `notes` | Text, Nullable | |

### 9. `orders`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `order_number` | String, Unique | Auto: `ORD-YYYYMMDD-XXX` |
| `shift_id` | FK → shifts | *Restrict On Delete* |
| `user_id` | FK → users | Kasir yang memproses |
| `cafe_table_id` | FK → cafe_tables, Nullable | null = takeaway |
| `order_type` | Enum: dine_in, takeaway | |
| `subtotal` | Decimal(12,2) | |
| `total` | Decimal(12,2) | Sama dengan subtotal (no tax) |
| `payment_method` | Enum: cash, qris, ewallet, transfer | |
| `payment_amount` | Decimal(12,2) | Uang diterima |
| `change` | Decimal(12,2) | Kembalian |
| `status` | Enum: pending, completed, cancelled, void | |
| `void_reason` | Text, Nullable | Alasan pembatalan |
| `notes` | Text, Nullable | |

### 10. `order_items`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `order_id` | FK → orders | *Cascade On Delete* |
| `menu_id` | FK → menus | *Restrict On Delete* |
| `menu_name` | String | **Snapshot** nama menu |
| `quantity` | Integer | |
| `unit_price` | Decimal(12,2) | **Snapshot** base_price |
| `subtotal` | Decimal(12,2) | (unit_price + modifiers) × qty |
| `notes` | Text, Nullable | |

### 11. `order_item_options`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `order_item_id` | FK → order_items | *Cascade On Delete* |
| `menu_option_item_id` | FK → menu_option_items | *Restrict On Delete* |
| `option_group_name` | String | **Snapshot** |
| `option_name` | String | **Snapshot** |
| `price_modifier` | Decimal(12,2) | **Snapshot** |

---

## Tabel Pendukung

### 12. `petty_cashes`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `shift_id` | FK → shifts | *Cascade On Delete* |
| `user_id` | FK → users | *Cascade On Delete* |
| `amount` | Decimal(12,2) | Nominal pengeluaran |
| `description` | Text | Keterangan pengeluaran |

### 13. `stock_mutations`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `raw_material_id` | FK → raw_materials | *Cascade On Delete* |
| `type` | Enum: in, out | Masuk/keluar stok |
| `quantity` | Decimal(10,2) | |
| `reference` | String, Nullable | e.g. Order # atau Manual |
| `notes` | Text, Nullable | |

### 14. `store_settings`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | PK | |
| `key` | String, Unique | Nama pengaturan |
| `value` | Text, Nullable | Nilai pengaturan |

---

*Struktur ini mencakup seluruh migrasi hingga Sprint 2 (Dashboard Analitik).*
