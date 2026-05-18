# Catatan Resolusi Bug & Error (Cafe-POS)

Dokumen ini berfungsi sebagai rekam jejak (log) dari berbagai error, bug, dan insiden kritis yang pernah terjadi selama masa pengembangan sistem Cafe-POS. Tujuannya adalah untuk mendokumentasikan "pelajaran" agar kesalahan yang sama tidak terulang kembali, dan mempercepat proses *debugging* jika gejala serupa muncul di masa depan.

---

## 1. Layar Putih (White Screen) pada Halaman Vue (Inertia.js)

Layar putih atau blank screen pada framework Vue 3 (menggunakan Inertia) biasanya menandakan adanya **JavaScript Runtime Error** (fatal error) yang terjadi tepat saat Vue sedang mencoba melakukan proses *render* (menggambar) komponen. Jika error ini tidak ditangkap (*unhandled*), Vue akan menghentikan seluruh proses, membiarkan layar menjadi kosong tanpa memuat elemen HTML apa pun.

### Kasus A: Fatal Error `toLocaleString is not a function`
* **Gejala:** Halaman POS menjadi putih setelah berhasil login, tidak ada error di terminal PHP server.
* **Penyebab Utama:** Laravel mengonversi data tipe `decimal:2` (seperti `opening_cash` atau `base_price`) menjadi **String** (teks) ketika dikirim ke antarmuka frontend (JSON). Fungsi `toLocaleString()` di JavaScript hanya bisa digunakan pada objek bertipe **Number**. Mencoba menggunakannya pada string akan menyebabkan *TypeError*.
* **Solusi/Pencegahan:** Selalu konversi atau bungkus data dari database dengan `Number()` atau `parseFloat()` sebelum melakukan pemformatan.
  ```vue
  <!-- SALAH (Menyebabkan Layar Putih) -->
  Rp {{ activeShift.opening_cash.toLocaleString('id-ID') }}
  
  <!-- BENAR (Aman) -->
  Rp {{ Number(activeShift.opening_cash || 0).toLocaleString('id-ID') }}
  ```

### Kasus B: Fatal Error `computed is not defined` (Missing Import)
* **Gejala:** Halaman POS menjadi putih seketika. Error console browser menunjukkan `Vue Error: computed is not defined`.
* **Penyebab Utama:** Di Vue 3 Composition API (`<script setup>`), fungsi reaktif bawaan seperti `ref`, `reactive`, `watch`, atau `computed` **wajib** di-*import* terlebih dahulu. Jika langsung dipanggil tanpa import, Vue akan menghasilkan *ReferenceError* di fase *setup*.
* **Solusi/Pencegahan:** Selalu pastikan deklarasi impor sudah lengkap di baris paling atas.
  ```javascript
  // BENAR
  import { ref, computed } from 'vue';
  
  const expectedCash = computed(() => { ... });
  ```

---

## 2. Isu Otentikasi & Redireksi (403 Forbidden / Method Not Allowed)

* **Gejala:** Pengguna Kasir yang login terjebak, tidak bisa mengakses halaman POS, atau melihat error "User does not have the right roles". Saat dipaksa keluar/logout melalui URL, muncul error Symfony `MethodNotAllowedHttpException`.
* **Penyebab Utama:** 
  1. Kompleksitas dua sistem login yang terpisah (PIN untuk kasir vs Email untuk Admin) yang membuat manajemen sesi di `LoginRequest` bentrok atau gagal meregistrasi otorisasi yang utuh.
  2. Middleware proteksi (*Role-based*) memblokir Kasir jika profil sesinya tidak terbaca sempurna.
  3. Laravel versi terbaru mengharuskan rute `/logout` dipanggil melalui `POST` untuk keamanan (mencegah CSRF).
* **Solusi/Pencegahan:**
  1. **Unifikasi Sistem Login:** Menyederhanakan form login sehingga **seluruh staff (Admin maupun Kasir)** menggunakan alur standar: *Email dan Password*.
  2. **Verbose Logging:** Menambahkan pelacakan detektif (`Log::info`) pada `AuthenticatedSessionController` dan middleware `RedirectByRole` untuk merekam persis ke mana alur membelok.
  3. **Emergency Logout:** Menambahkan `Route::get('/logout')` secara khusus sebagai pintu darurat jika sesi pengguna *nyangkut* dan tidak bisa mengakses tombol POST standar.

---

*Log ini akan terus diperbarui seiring berjalannya pengembangan untuk mencegah kesalahan berulang.*

---

## 3. Error Resolusi Import (Vite)

### Kasus: `Failed to resolve import "moment"`
* **Gejala:** Halaman POS tidak bisa dibuka, muncul error merah di terminal Vite: `Failed to resolve import "moment"`.
* **Penyebab Utama:** Kode mencoba menggunakan library eksternal (`moment.js`) yang belum terinstal di dalam `package.json`.
* **Solusi/Pencegahan:** Hindari ketergantungan pada library pihak ketiga jika fungsi tersebut bisa dilakukan dengan JavaScript murni (*Vanilla JS*). Saya telah mengganti penggunaan `moment` dengan objek `Date` bawaan browser untuk memformat waktu.
  ```javascript
  // BENAR (Vanilla JS)
  const hours = String(new Date().getHours()).padStart(2, '0');
  ```

---

## 4. Error Query SQL (No such column: price)

### Kasus: `no such column: price` pada Dashboard
* **Gejala:** Muncul Internal Server Error saat Admin membuka Dashboard.
* **Penyebab Utama:** Kode di `DashboardController` mencoba melakukan agregasi `SUM(price * quantity)`, namun kolom di tabel `order_items` sebenarnya bernama `unit_price` dan sudah tersedia kolom `subtotal` yang menampung total harga per baris (termasuk varian).
* **Solusi/Pencegahan:** Selalu periksa schema migrasi sebelum menulis query SQL manual (`DB::raw`). Gunakan kolom `subtotal` untuk menghitung total pendapatan per item.
  ```php
  // BENAR
  SUM(subtotal) as total_revenue
  ```

---

## 5. Error Kompilasi Template Vue (Vite: Invalid end tag)

### Kasus: Tag `</div>` Ekstra pada `Pos.vue`
* **Gejala:** Vite memunculkan error merah berulang di terminal: `Invalid end tag` di `Pos.vue:297:13`. Halaman POS tidak bisa dimuat. Error memicu tiga kali *hot reload* berturut-turut.
* **Penyebab Utama:** Saat menambahkan blok HTML dropdown baru (menu "Opsi Cetak" dengan 3 grup struk), proses *replace* menyisipkan satu tag penutup `</div>` ekstra di baris 295. Ini menyebabkan jumlah tag pembuka dan penutup tidak seimbang, sehingga parser Vue gagal membangun AST (Abstract Syntax Tree).
* **Cara Mendeteksi:** Periksa hierarki tag secara manual dari atas ke bawah di sekitar baris yang ditunjukkan oleh error. Hitung pasangan buka-tutup `<div>` / `</div>`.
* **Solusi/Pencegahan:**
  1. Selalu verifikasi jumlah pasangan tag setelah menambahkan blok HTML besar ke dalam template Vue.
  2. Gunakan fitur *bracket matching* di editor untuk memastikan setiap `<div>` memiliki pasangan `</div>`.
  ```
  Hierarki yang benar setelah diperbaiki:
  L292: </div>   ← Tutup grup Struk Dapur
  L293: </div>   ← Tutup kontainer Dropdown Menu
  L294: </div>   ← Tutup kontainer v-if="lastOrderId"
  L295: </div>   ← Tutup area ikon/tombol header
  L296: </div>   ← Tutup kontainer header justify-between
  ```

---

### Kasus: Tag `</div>` Ekstra pada `Dashboard.vue` (DealDeck Update)
* **Gejala:** Vite memunculkan error `Invalid end tag` di `Dashboard.vue:941:13`.
* **Penyebab Utama:** Saat melakukan pembaruan gaya "DealDeck", rentang baris pengganti tidak mencakup seluruh template lama. Ini menyisipkan struktur baru yang sudah tertutup, namun membiarkan tag penutup `</div>` dari struktur lama tetap ada di bagian bawah file.
* **Solusi/Pencegahan:** Lakukan penggantian seluruh blok template secara utuh dan verifikasi akhir file sebelum menyimpan. Pastikan tidak ada kode "sampah" yang tertinggal di bawah penutup kontainer utama.

### Kasus: Redeklarasi `radarOptions` pada `Dashboard.vue`
* **Gejala:** Vite memunculkan error `Identifier 'radarOptions' has already been declared`.
* **Penyebab Utama:** Saat melakukan restrukturisasi gaya grafik (mengganti Radar dengan PolarArea), terjadi kesalahan dalam proses *multi-replace* yang menduplikasi definisi variabel `radarOptions`.
* **Solusi/Pencegahan:** Selalu periksa apakah ada variabel dengan nama yang sama sebelum menambahkan definisi baru. Gunakan `grep` atau fitur pencarian editor untuk memverifikasi keunikan variabel di dalam satu file.

### Kasus: Dangling `</div>` setelah Penghapusan Konten Dashboard
* **Gejala:** Vite memunculkan error `Invalid end tag` di `Admin/Reports/Index.vue:1167:9`. Halaman Laporan gagal dimuat karena kesalahan sintaks HTML.
* **Penyebab Utama:** Saat memindahkan fitur Dashboard Analitik dari halaman Laporan ke halaman Dashboard Utama, proses penghapusan blok `v-if="activeTab === 'dashboard'"` meninggalkan satu tag penutup `</div>` yang tidak memiliki pasangan pembuka. Tag penutup yang menggantung ini mengacaukan seluruh hierarki `DOM` di bawahnya, menyebabkan tag penutup di baris-baris akhir file dianggap sebagai tag yang tidak valid.
* **Solusi/Pencegahan:** 
    1. Saat melakukan penghapusan blok HTML yang memiliki tingkatan *nesting* dalam, pastikan tag pembuka dan penutup dihapus secara berpasangan.
    2. Verifikasi struktur template menggunakan linter atau *auto-formatter* segera setelah melakukan manipulasi teks besar pada file `.vue`.

### Kasus: Missing End Tag `<header>` pada `AuthenticatedLayout.vue`
* **Gejala:** Vite memunculkan error `Element is missing end tag` atau `Pre-transform error: Element is missing end tag` pada `AuthenticatedLayout.vue:128:17`. Aplikasi gagal dimuat dan parser compiler Vue mogok.
* **Penyebab Utama:** Tag `<header>` pembuka dideklarasikan pada baris 128 untuk membungkus komponen Top Bar (navigasi atas), tetapi tag penutup `</header>`-nya hilang atau terhapus sebelum penanda komentar `<!-- PAGE CONTENT -->`. Ini mengakibatkan parser HTML Vue gagal membangun AST (Abstract Syntax Tree) karena struktur pohon DOM yang tidak seimbang.
* **Solusi/Pencegahan:**
    1. Menambahkan tag penutup `</header>` pada baris 181, tepat di bawah penutup `</div>` milik area kontrol kanan dan di atas blok penanda `<!-- PAGE CONTENT -->`.
    2. Pastikan linter dan fitur auto-close tag aktif pada editor untuk mencegah terjadinya tag pembuka yang menggantung tanpa pasangan penutupnya.

---

## 6. Error `Undefined property: stdClass::$id` pada ReportController

### Kasus: Properti `id` Tidak Ada di Hasil Query `DB::table()`
* **Gejala:** Internal Server Error (500) saat admin membuka halaman `/admin/reports`. Stack trace menunjuk ke `ReportController.php:108` di dalam callback `map()`.
* **Penyebab Utama:** Query performa menu menggunakan `DB::table('order_items')->join(...)` yang mengembalikan `stdClass` (bukan Eloquent Model). Kolom `menus.id` **tidak diikutkan** dalam perintah `->select(...)`, padahal kode di `map()` mencoba mengakses `$item->id` untuk mencari model Menu dan menghitung HPP (COGS).
* **Perbedaan Kunci:** `DB::table()` hanya mengembalikan kolom yang eksplisit di-`select()`, berbeda dengan Eloquent `Model::get()` yang mengembalikan semua kolom secara default (`SELECT *`).
* **Solusi/Pencegahan:**
  1. **Selalu sertakan `id`** dalam `select()` jika hasil query akan digunakan untuk lookup lebih lanjut.
  2. Ketika menggunakan `DB::table()` (Query Builder), pastikan semua properti yang diakses di `map()` / `each()` sudah ada di daftar `select()`.
  ```php
  // SALAH (menyebabkan error)
  ->select('menus.name', 'categories.name as category_name', ...)
  
  // BENAR (id tersedia untuk lookup COGS)
  ->select('menus.id', 'menus.name', 'categories.name as category_name', ...)
  ```
