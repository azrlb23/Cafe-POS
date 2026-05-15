# Panduan Operasional Cafe-POS (Denjavas Retro Café)

Dokumen ini berisi panduan dasar untuk mengoperasikan sistem *Point of Sales* (POS) Denjavas. Sistem ini dirancang untuk dua jenis pengguna utama: **Administrator (Pemilik/Manajer)** dan **Kasir**.

---

## 1. Hak Akses & Akun Default
Sistem dilengkapi dengan dua level otorisasi (*Role-Based Access Control*). Saat pertama kali sistem diinstal dan di-seed, akun berikut otomatis terbuat:

### Akun Administrator (Admin)
Admin memiliki akses penuh ke seluruh sistem, termasuk mengelola data master (Kategori, Menu, Bahan Baku, Resep) dan melihat laporan keuangan.
- **Email Login:** `admin@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `123456` *(Digunakan jika sistem beralih ke mode PIN login cepat)*

### Akun Kasir (Cashier)
Kasir hanya memiliki akses ke modul "Tablet POS" untuk melayani pelanggan, memproses pesanan, dan mencetak struk pembayaran. Karena kafe menerapkan sistem 2 shift dalam 1 tablet bergantian, terdapat 2 akun kasir default:

**Kasir 1 (Shift Pagi-Siang)**
- **Email Login:** `kasir@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `654321`

**Kasir 2 (Shift Siang-Malam)**
- **Email Login:** `kasir2@denjavas.com`
- **Password:** `password`
- **PIN Kasir:** `111222`

---

## 2. Cara Menjalankan Aplikasi
Untuk menjalankan sistem secara lokal di komputer, Anda hanya perlu menjalankan satu perintah praktis di terminal:

```bash
composer run dev
```
*(Atau bisa disingkat menjadi `composer dev`)*

Perintah di atas akan secara otomatis dan bersamaan menjalankan:
1. Server Backend PHP (Laravel) di `http://localhost:8000`
2. Server Frontend (Vite) untuk *Hot Module Replacement* UI.
3. Server Queue Worker (untuk memproses *background task* jika ada).

---

## 3. Alur Kerja Sistem (Workflow)

Sistem bekerja dengan relasi data yang saling terkait. Berikut adalah urutan kerja standar bagi manajemen kafe:

### Fase Setup (Tugas Admin)
Sebelum Kasir bisa berjualan, Admin harus menyiapkan master data secara berurutan:
1. **Tambah Kategori:** Masuk ke menu `Kategori Menu` dan buat kategori (misal: "Kopi", "Non-Kopi", "Snack").
2. **Kelola Stok Bahan Baku:** Masuk ke menu `Bahan Baku` untuk mendaftarkan bahan seperti Biji Kopi, Susu, Gula Aren, Cup, dll. Anda bisa memantau stok real-time di sini.
3. **Buat Menu & Resep:** Masuk ke `Katalog Menu` -> `Tambah Menu`. 
   - Anda dapat menetapkan harga dasar.
   - Menautkan "Resep Dasar" (misal: 1 Porsi Kopi Susu Aren = 18g Kopi + 150ml Susu + 20ml Gula).
   - Menambahkan opsi kustomisasi (misal: Suhu Panas/Dingin, Ukuran Reguler/Large) lengkap dengan penambahan harga dan tambahan resepnya.

### Fase Operasional (Tugas Kasir)
Setelah menu siap, kasir bertugas di depan meja pelayanan:
1. Kasir membuka halaman POS (`/pos`) dan login menggunakan **PIN 6-digit**.
2. **[PENTING]** Saat pertama masuk, kasir wajib **Membuka Shift (Open Shift)** dengan memasukkan uang kas awal di laci kasir.
3. Sistem akan menampilkan antarmuka modern berisi menu-menu yang aktif.
4. Kasir menerima pesanan pelanggan:
   - Pilih jenis pesanan: **Dine-in** (Nomor Meja 1-30) atau **Takeaway**.
   - Pilih menu dan kustomisasi jika ada.
   - Tambahkan ke Keranjang (*Cart*).
5. Kasir memproses "Checkout", memilih metode pembayaran, dan sistem akan otomatis memotong stok "Bahan Baku" secara otomatis berdasarkan resep.
6. Saat pergantian shift, kasir melakukan **Tutup Shift**, mencocokkan total uang tunai, lalu kasir berikutnya bisa login.

---

## 4. Standar Tampilan (UI/UX)
Sistem ini menggunakan antarmuka **Premium Light Mode (Amber & Slate)** secara eksklusif. Desain menggunakan font **Plus Jakarta Sans** untuk keterbacaan tinggi dan **Playfair Display** untuk kesan retro-modern. Pengaturan tema sudah dikunci untuk menjaga konsistensi identitas brand *Denjavas Retro Café*.
