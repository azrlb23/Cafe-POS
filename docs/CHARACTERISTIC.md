# Panduan Karakteristik & Identitas Visual Denjavas Cafe

Dokumen ini mendefinisikan karakteristik visual, skema warna, tipografi, dan filosofi desain yang telah mapan (*solid*) untuk sistem **Denjavas Cafe (Cafe-POS)**. Seluruh pengembang dan asisten AI wajib mematuhi aturan ini dan **tidak mengubah** skema warna serta karakteristik dasar yang telah ditetapkan di bawah ini.

---

## 1. Filosofi Brand & Identitas

*   **Nama Brand:** Denjavas Cafe (ditulis sebagai `Denjavas.` atau `Denjavas Cafe` pada antarmuka).
*   **Karakter Visual:** Klasik, hangat, premium, dan profesional.
*   **Esensi Desain:** Menggabungkan kehangatan budaya Jawa klasik/tradisional (diwakili oleh warna emas/kopi dan tipografi Serif) dengan efisiensi operasional modern (diwakili oleh tata letak SaaS bersih, ruang kosong yang lega, dan fungsionalitas responsif).

---

## 2. Palet Warna Tetapan (Fixed Color Palette)

Warna-warna di bawah ini telah dikurasi secara harmonis untuk memberikan kesan premium dan tidak boleh diganti dengan warna primer bawaan browser yang mentah.

### A. Warna Emas / Kopi (Gold & Warm Amber)
Melambangkan kehangatan seduhan kopi terbaik, kemewahan yang ramah, dan sentuhan budaya klasik.
*   **Warna Emas Utama (Brand Gold):** `#D97706` (Tailwind `amber-600`).
    *   *Penggunaan:* Logo utama, teks penekanan pada sub-judul, indikator status aktif penting.
*   **Warna Emas Gradasi (Accent Gold):** `#F59E0B` (Tailwind `amber-500`) hingga `#D97706` (Tailwind `amber-600`).
    *   *Penggunaan:* Latar belakang tombol aksi utama (seperti *Tambah Menu*, *Simpan*), *hover states*, efek gradasi premium.
*   **Aksen Emas Halus (Soft Gold):** `bg-amber-50` (atau opasitas `bg-amber-500/5`).
    *   *Penggunaan:* Latar belakang badge statistik, penanda kategori aktif yang lembut, dan notifikasi sekunder.

### B. Warna Putih & Latar Belakang (White & Clean Canvas)
Menciptakan ruang bernapas (*whitespace*) yang memisahkan data penting dengan sangat jelas.
*   **Latar Belakang Komponen/Kartu:** `#FFFFFF` (Solid White).
    *   *Penggunaan:* Kartu statistik (KPI), tabel produk, form input, modal, dan sidebar.
*   **Latar Belakang Halaman Utama (Canvas):** `#F8F9FD` (Off-White dengan rona biru-abu dingin).
    *   *Penggunaan:* Latar belakang dasar seluruh aplikasi (membantu membuat kartu putih murni menonjol dan tidak melelahkan mata).
*   **Pembatas Minimalis (Borders):** `border-slate-100` / `border-slate-200/60` (Sangat tipis dan halus).
    *   *Penggunaan:* Garis pemisah tabel, pembatas kolom, dan tepi tombol minimalis.

### C. Warna Kontras & Teks (Sleek Dark Slate)
Menghindari penggunaan warna hitam solid (`#000000`) agar teks terasa lebih lembut dan nyaman dibaca dalam waktu lama.
*   **Teks Utama (Primary Text):** `#1C1917` (Tailwind `stone-900`) atau `#292524` (Tailwind `stone-800`).
    *   *Penggunaan:* Judul besar, angka nominal uang, teks tebal, dan konten utama.
*   **Teks Sekunder (Secondary Text):** `#64748B` (Tailwind `slate-500`) atau `#94A3B8` (Tailwind `slate-400`).
    *   *Penggunaan:* Label input, deskripsi pembantu, waktu/tanggal, dan teks sekunder di bawah judul.

---

## 3. Sistem Tipografi (Typography)

Sistem menggunakan kombinasi dua rumpun huruf Google Fonts untuk menyeimbangkan nilai estetika klasik dan keterbacaan modern:

1.  **Font Serif: *Playfair Display***
    *   *Karakter:* Anggun, klasik, artistik, kontras tinggi.
    *   *Penerapan:* Nama logotype brand di sidebar (`font-serif`), judul utama halaman, tajuk penekanan visual.
2.  **Font Sans-Serif: *Inter***
    *   *Karakter:* Bersih, sangat terbaca pada layar digital, proporsi angka yang rapi.
    *   *Penerapan:* Navigasi sidebar, teks isi tabel, nominal harga, label formulir, teks paragraf umum.

---

## 4. Panduan Implementasi UI & UX

Seluruh perubahan dan penambahan halaman baru di masa depan wajib mengikuti standar tata letak berikut:

*   **Sudut Melengkung Lebar (Large Border Radius):**
    Hindari sudut tajam. Gunakan radius besar untuk kenyamanan visual:
    *   Kartu Utama / Tabel / Form: `rounded-[2rem]` hingga `rounded-[3rem]`.
    *   Tombol / Badge / Input: `rounded-2xl` atau `rounded-xl`.
*   **Elevasi & Bayangan Lembut (Soft Shadowing):**
    Gunakan `shadow-sm` atau bayangan tipis khusus dengan opasitas rendah (misal: `shadow-amber-500/20`) untuk memberikan dimensi kedalaman yang elegan saat elemen disorot (*hover*).
*   **Micro-Animations:**
    Berikan transisi halus pada setiap elemen interaktif:
    *   Kelas standar: `transition-all duration-300`.
    *   Efek klik tombol: `active:scale-95`.
    *   Efek sorot: `hover:scale-105` atau `hover:-translate-y-1`.
*   **Penyelarasan Tata Letak (Grid Alignment):**
    *   Selalu gunakan batas luar halaman yang sejajar dengan lebar maksimal `max-w-[1600px] mx-auto px-6 lg:px-10`.
    *   Hindari menaruh judul/filter besar di Sticky Navbar atas. Biarkan bilah atas bersih dan letakkan judul halaman langsung di dalam area konten utama agar memiliki ruang bernapas yang cukup.
