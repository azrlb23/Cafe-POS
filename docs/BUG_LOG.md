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
