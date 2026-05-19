# Panduan Karakteristik & Identitas Visual Denjavas Cafe

Dokumen ini mendefinisikan karakteristik visual, skema warna, tipografi, dan filosofi desain yang telah mapan (*solid*) untuk sistem **Denjavas Cafe (Cafe-POS)**. Seluruh pengembang dan asisten AI wajib mematuhi aturan ini dan **tidak mengubah** skema warna serta karakteristik dasar yang telah ditetapkan di bawah ini.

> **Terakhir diperbarui:** 19 Mei 2026

---

## 1. Filosofi Brand & Identitas

*   **Nama Brand:** Denjavas Cafe (ditulis sebagai `Denjavas Cafe` pada sidebar atau `Denjavas Retro Café` pada struk/dokumen resmi).
*   **Karakter Visual:** Klasik, hangat, premium, dan profesional.
*   **Esensi Desain:** Menggabungkan kehangatan budaya Jawa klasik/tradisional (diwakili oleh warna emas gelap/kopi dan tipografi Serif) dengan efisiensi operasional modern (diwakili oleh tata letak SaaS bersih, ruang kosong yang lega, dan fungsionalitas responsif).

---

## 2. Palet Warna Tetapan (Fixed Color Palette)

Warna-warna di bawah ini telah dikurasi secara harmonis untuk memberikan kesan premium dan tidak boleh diganti dengan warna primer bawaan browser yang mentah.

### A. Warna Emas Gelap / Kopi (Dark Gold & Warm Amber)
Melambangkan kehangatan seduhan kopi terbaik, kemewahan yang ramah, dan sentuhan budaya klasik.
*   **Warna Emas Utama (Brand Gold):** `#B45309` (Tailwind `amber-700`).
    *   *Penggunaan:* Ikon aktif, teks penekanan pada sub-judul, indikator status aktif penting, border aktif, ikon sidebar aktif, dan badge aksen.
*   **Warna Emas Hover (Accent Gold Hover):** `#92400E` (Tailwind `amber-800`).
    *   *Penggunaan:* Hover state pada tombol emas, gradasi kedua pada CTA buttons (`from-amber-700 to-amber-800`).
*   **Gradasi Tombol CTA:** `bg-gradient-to-r from-amber-700 to-amber-800`, hover: `from-amber-800 to-amber-900`.
    *   *Penggunaan:* Tombol aksi utama (Tambah, Simpan, Checkout).
*   **Aksen Emas Halus (Soft Gold):** `bg-amber-50/70` atau `rgba(180, 83, 9, 0.08)`.
    *   *Penggunaan:* Latar belakang badge statistik, ikon container, penanda kategori aktif yang lembut.
*   **Ring Focus Input:** `focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10`.
    *   *Penggunaan:* Seluruh input field saat mendapat fokus.

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

### D. Sticky Action Bar (Form Pages)
Seluruh halaman form menggunakan action bar yang menempel di bawah layar:
*   **Background:** `bg-[#1C1E23]` (gelap hampir hitam) dengan `border border-amber-700/30`.
*   **Shadow:** `shadow-[0_30px_60px_rgba(0,0,0,0.4)]`.
*   **Border Radius:** `rounded-[2.5rem]`.
*   **Ikon:** `bg-amber-700 rounded-2xl` dengan ikon centang putih.

---

## 3. Sistem Tipografi (Typography)

Sistem menggunakan kombinasi tiga rumpun huruf Google Fonts:

1.  **Font Serif: *Playfair Display***
    *   *Karakter:* Anggun, klasik, artistik, kontras tinggi.
    *   *Penerapan:* Nama logotype brand di sidebar (`font-serif`), judul utama halaman, tajuk penekanan visual.
2.  **Font Sans-Serif: *Inter***
    *   *Karakter:* Bersih, sangat terbaca pada layar digital, proporsi angka yang rapi.
    *   *Penerapan:* Navigasi sidebar, teks isi tabel, label formulir, teks paragraf umum.
3.  **Font Sans-Serif: *Plus Jakarta Sans***
    *   *Karakter:* Modern, geometris, sangat terbaca untuk angka.
    *   *Penerapan:* **Seluruh harga dan nominal mata uang** di semua bagian POS dan admin (`font-family: 'Plus Jakarta Sans'`).

---

## 4. Panduan Implementasi UI & UX

Seluruh perubahan dan penambahan halaman baru di masa depan wajib mengikuti standar tata letak berikut:

*   **Sudut Melengkung Lebar (Large Border Radius):**
    Hindari sudut tajam. Gunakan radius besar untuk kenyamanan visual:
    *   Kartu Utama / Tabel / Form: `rounded-[2rem]` hingga `rounded-[3rem]`.
    *   Tombol / Badge / Input: `rounded-2xl` atau `rounded-xl`.
*   **Elevasi & Bayangan Lembut (Soft Shadowing):**
    Gunakan `shadow-sm` atau bayangan tipis khusus dengan opasitas rendah (misal: `shadow-amber-700/20`) untuk memberikan dimensi kedalaman yang elegan saat elemen disorot (*hover*).
*   **Micro-Animations:**
    Berikan transisi halus pada setiap elemen interaktif:
    *   Kelas standar: `transition-all duration-300`.
    *   Efek klik tombol: `active:scale-95`.
    *   Efek sorot: `hover:scale-105` atau `hover:-translate-y-1`.
*   **Penyelarasan Tata Letak (Grid Alignment):**
    *   Selalu gunakan batas luar halaman yang sejajar dengan lebar maksimal `max-w-[1600px] mx-auto px-6 lg:px-10`.
    *   Hindari menaruh judul/filter besar di Sticky Navbar atas. Biarkan bilah atas bersih dan letakkan judul halaman langsung di dalam area konten utama agar memiliki ruang bernapas yang cukup.
*   **Navigasi Sidebar (Admin):**
    *   Sidebar vertikal fixed 240px di sisi kiri untuk seluruh halaman admin.
    *   Sidebar selalu tampil, termasuk pada halaman POS History kasir.
    *   User profile card di bagian bawah sidebar.
*   **Form Pattern (Admin):**
    *   Seluruh form admin (Tambah/Edit) menggunakan **halaman mandiri** (dedicated page), bukan popup/modal.
    *   Menggunakan layout grid 2 kolom (`xl:grid-cols-3`): deskripsi di kiri, form fields di kanan.
    *   Sticky action bar di bawah layar untuk tombol Simpan/Batal.
*   **Pagination Pattern:**
    *   Tabel dan list menggunakan sistem pagination lokal (client-side) dengan batas item per halaman.
    *   Tombol Previous/Next dengan safety bounds (`<= 1` dan `>= totalPages`).
    *   Watcher untuk reset halaman saat data berubah.
