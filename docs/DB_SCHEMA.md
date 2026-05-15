# Denjavas POS - Database Schema

Dokumentasi ini mencatat struktur relasi tabel dan *foreign key* dalam proyek Denjavas POS F&B.

## Tabel Inti (Katalog & Inventaris)

### 1. `categories`
- `id` (PK)
- `name` (String)

### 2. `menus`
- `id` (PK)
- `category_id` (FK -> categories.id) - *Restrict On Delete*
- `name` (String)
- `description` (Text, Nullable)
- `image_path` (String, Nullable)
- `base_price` (Decimal 12,2)
- `is_active` (Boolean)

### 3. `menu_option_groups`
- `id` (PK)
- `menu_id` (FK -> menus.id) - *Cascade On Delete*
- `name` (String)
- `min_select` (Integer)
- `max_select` (Integer)

### 4. `menu_option_items`
- `id` (PK)
- `menu_option_group_id` (FK -> menu_option_groups.id) - *Cascade On Delete*
- `name` (String)
- `price_modifier` (Decimal 12,2)
- `is_available` (Boolean)

### 5. `raw_materials`
- `id` (PK)
- `name` (String)
- `unit` (Enum: gram, ml, pcs)
- `current_stock` (Decimal 10,2)

### 6. `recipes` *(Bill of Materials / BOM)*
- `id` (PK)
- `raw_material_id` (FK -> raw_materials.id) - *Restrict On Delete*
- `menu_id` (FK -> menus.id, Nullable) - *Cascade On Delete*
- `menu_option_item_id` (FK -> menu_option_items.id, Nullable) - *Cascade On Delete*
- `quantity` (Decimal 8,2) - *Jumlah penggunaan bahan baku per porsi*
- *Unique Constraint*: `[raw_material_id, menu_id]`
- *Unique Constraint*: `[raw_material_id, menu_option_item_id]`

### 7. `cafe_tables`
- `id` (PK)
- `number` (Integer, Unique) - *Nomor meja (1-30)*
- `status` (Enum: available, occupied)

### 8. `shifts`
- `id` (PK)
- `user_id` (FK -> users.id) - *Restrict On Delete*
- `opened_at` (Timestamp)
- `closed_at` (Timestamp, Nullable)
- `opening_cash` (Decimal 12,2)
- `closing_cash` (Decimal 12,2, Nullable)
- `total_sales` (Decimal 12,2)
- `notes` (Text, Nullable)

### 9. `orders`
- `id` (PK)
- `order_number` (String, Unique) - *Auto-generated: ORD-YYYYMMDD-XXX*
- `shift_id` (FK -> shifts.id) - *Restrict On Delete*
- `user_id` (FK -> users.id) - *Restrict On Delete*
- `cafe_table_id` (FK -> cafe_tables.id, Nullable) - *Null On Delete*
- `order_type` (Enum: dine_in, takeaway)
- `subtotal` (Decimal 12,2)
- `total` (Decimal 12,2)
- `payment_method` (Enum: cash, qris, ewallet, transfer)
- `payment_amount` (Decimal 12,2)
- `change` (Decimal 12,2)
- `status` (Enum: pending, completed, cancelled)
- `notes` (Text, Nullable)

### 10. `order_items`
- `id` (PK)
- `order_id` (FK -> orders.id) - *Cascade On Delete*
- `menu_id` (FK -> menus.id) - *Restrict On Delete*
- `menu_name` (String) - *Snapshot*
- `quantity` (Integer)
- `unit_price` (Decimal 12,2) - *Snapshot base_price*
- `subtotal` (Decimal 12,2)
- `notes` (Text, Nullable)

### 11. `order_item_options`
- `id` (PK)
- `order_item_id` (FK -> order_items.id) - *Cascade On Delete*
- `menu_option_item_id` (FK -> menu_option_items.id) - *Restrict On Delete*
- `option_group_name` (String) - *Snapshot*
- `option_name` (String) - *Snapshot*
- `price_modifier` (Decimal 12,2) - *Snapshot*

### 12. `stock_mutations`
- `id` (PK)
- `raw_material_id` (FK -> raw_materials.id) - *Cascade On Delete*
- `type` (Enum: in, out)
- `quantity` (Decimal 10,2)
- `reference` (String, Nullable) - *e.g. Order Number or Manual Adjustment*
- `notes` (Text, Nullable)
- `created_at` (Timestamp)

### 13. `store_settings`
- `id` (PK)
- `key` (String, Unique)
- `value` (Text, Nullable)

---
*Catatan: Struktur tabel ini telah mencakup Phase 1 (Transaksi, Shift, Stok, dan Setting).*
