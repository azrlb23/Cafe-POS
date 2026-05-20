# 🚀 Panduan Deployment Production — Denjavas Retro Café POS

Dokumen ini adalah panduan deployment produksi yang disusun berdasarkan **analisa langsung** terhadap kode sumber proyek. Setiap langkah disesuaikan dengan kebutuhan nyata aplikasi.

---

## 📋 Hasil Analisa Proyek

Sebelum masuk ke langkah deployment, berikut adalah temuan teknis yang memengaruhi strategi deployment:

| Aspek | Temuan | Dampak Deployment |
|-------|--------|-------------------|
| **Database** | SQLite (dev), MySQL siap pakai di `config/database.php` | Produksi **wajib** MySQL — SQLite tidak mampu handle concurrent write dari multi-kasir |
| **Queue** | `QUEUE_CONNECTION=database`, digunakan di `composer run dev` (`queue:listen`) | Queue worker **wajib** berjalan sebagai background process di server |
| **File Upload** | `MenuController` menyimpan gambar menu ke `Storage::disk('public')` → folder `storage/app/public/menus/` | **Wajib** jalankan `php artisan storage:link` agar gambar bisa diakses via URL |
| **PDF Generation** | `barryvdh/laravel-dompdf` untuk cetak struk 58mm (PosController::printPdf) | Perlu ekstensi PHP `gd` dan `mbstring` aktif di server |
| **Session & Cache** | Keduanya menggunakan driver `database` | Tabel `sessions` dan `cache` sudah ada di migration default — tidak perlu Redis |
| **Scheduled Tasks** | Tidak ada scheduled task di `console.php` | Cron job **tidak wajib** saat ini, tapi direkomendasikan untuk session garbage collection |
| **Broadcasting** | `BROADCAST_CONNECTION=log`, Pusher terdaftar di `composer.json` tapi **tidak digunakan** di kode | Pusher **tidak perlu** dikonfigurasi — bisa diabaikan |
| **Timezone** | `config/app.php` → `'timezone' => 'UTC'` | **Harus** diubah ke `Asia/Makassar` (WITA) karena kafe berlokasi di Balikpapan |
| **Auth** | Spatie Permission RBAC dengan 2 role: `admin` dan `kasir`, plus PIN kasir | Pastikan seeder dijalankan untuk membuat role & user awal |
| **Static Assets** | 7 gambar di `public/images/` (~5MB total), build Vite di `public/build/` | `npm run build` wajib dijalankan sebelum deploy, folder `node_modules` **jangan** di-upload |

---

## 🖥️ Persyaratan Server

### Minimum Hardware (untuk 1 kafe, 2-4 kasir simultan)
- **CPU**: 1 vCPU
- **RAM**: 1 GB (2 GB direkomendasikan)
- **Storage**: 10 GB SSD
- **OS**: Ubuntu 22.04 LTS atau 24.04 LTS

### Software yang Dibutuhkan
| Software | Versi Minimum | Catatan |
|----------|---------------|---------|
| PHP | 8.2+ | Dengan ekstensi: `pdo_mysql`, `mbstring`, `xml`, `curl`, `gd`, `zip`, `bcmath` |
| MySQL | 8.0+ | Atau MariaDB 10.6+ |
| Nginx | 1.18+ | Alternatif: Apache 2.4+ (tapi Nginx lebih hemat RAM) |
| Composer | 2.x | Untuk install dependency PHP |
| Node.js | 18+ | **Hanya** dibutuhkan untuk build aset, bisa di lokal |
| Supervisor | 4.x | Untuk menjaga queue worker tetap berjalan |

### Rekomendasi VPS Provider (Harga Terjangkau)
| Provider | Paket | Harga/bulan |
|----------|-------|-------------|
| DigitalOcean | Basic Droplet 1vCPU/1GB | ~$6 |
| Vultr | Cloud Compute 1vCPU/1GB | ~$6 |
| IDCloudHost | VM 1vCPU/1GB (data center Indonesia) | ~Rp 50.000 |
| Biznet Gio | NEO Lite 1vCPU/1GB | ~Rp 55.000 |

> 💡 **Tip**: Pilih provider dengan data center di **Jakarta/Singapore** agar latensi rendah ke Balikpapan.

---

## 📝 Langkah Deployment (Step-by-Step)

### Tahap 1: Persiapan di Komputer Lokal

Build aset frontend di lokal **sebelum** upload ke server:

```bash
# Di komputer lokal, dalam folder proyek
npm install
npm run build
```

Pastikan folder `public/build/` sudah terisi file `manifest.json` dan aset yang ter-compile. Folder ini yang akan di-upload ke server.

---

### Tahap 2: Setup Server (Ubuntu + Nginx + MySQL)

#### 2.1 Instal Software

```bash
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2 + ekstensi yang dibutuhkan
sudo apt install -y php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml \
    php8.2-curl php8.2-gd php8.2-zip php8.2-bcmath php8.2-intl

# Install Nginx, MySQL, Supervisor, dan tools
sudo apt install -y nginx mysql-server supervisor unzip git
```

#### 2.2 Instal Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

### Tahap 3: Konfigurasi Database MySQL

```bash
sudo mysql -u root
```

```sql
-- Buat database
CREATE DATABASE cafe_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus (GANTI password!)
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'GantiDenganPasswordKuat!';
GRANT ALL PRIVILEGES ON cafe_pos.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Tahap 4: Upload & Setup Proyek

#### 4.1 Clone atau Upload Proyek

```bash
# Opsi A: Clone dari Git
cd /var/www
sudo git clone https://github.com/azrlb23/Denjavas-POS.git cafe-pos

# Opsi B: Upload via SCP/SFTP
# scp -r ./Cafe-POS user@server-ip:/var/www/cafe-pos
```

#### 4.2 Instal Dependensi PHP (Tanpa Dev)

```bash
cd /var/www/cafe-pos
composer install --no-dev --optimize-autoloader
```

#### 4.3 Konfigurasi File `.env`

```bash
cp .env.example .env
php artisan key:generate
nano .env
```

Ubah isi `.env` menjadi konfigurasi produksi berikut:

```env
APP_NAME="Denjavas Retro Café POS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://pos.denjavas.com       # Ganti dengan domain/IP server Anda

APP_LOCALE=id
APP_TIMEZONE=Asia/Makassar             # WITA — sesuai lokasi kafe di Balikpapan

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error                        # Di produksi, hanya log error

# ============ DATABASE (MySQL) ============
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cafe_pos
DB_USERNAME=pos_user
DB_PASSWORD=GantiDenganPasswordKuat!

# ============ SESSION & CACHE ============
SESSION_DRIVER=database
SESSION_LIFETIME=480                   # 8 jam — sesuai durasi shift kasir
SESSION_ENCRYPT=true                   # Enkripsi session di produksi
SESSION_SECURE_COOKIE=true             # Wajib jika menggunakan HTTPS

CACHE_STORE=database

# ============ QUEUE ============
QUEUE_CONNECTION=database              # Tetap database, bukan sync!

# ============ FILESYSTEM ============
FILESYSTEM_DISK=local
BROADCAST_CONNECTION=log

# ============ VITE ============
VITE_APP_NAME="Denjavas Retro Café POS"
```

> ⚠️ **Penting — Timezone**: Proyek ini menggunakan `now()->today()` di banyak query (riwayat transaksi hari ini, pesanan aktif hari ini). Jika timezone salah, data shift dan pesanan akan kacau. Pastikan `APP_TIMEZONE=Asia/Makassar`.

#### 4.4 Tambahkan Timezone di `config/app.php`

Karena `config/app.php` saat ini hardcode `'timezone' => 'UTC'`, Anda perlu mengubahnya agar membaca dari `.env`:

```php
// config/app.php, baris 68
'timezone' => env('APP_TIMEZONE', 'Asia/Makassar'),
```

#### 4.5 Jalankan Migrasi & Seeder

```bash
# Migrasi database (buat semua tabel)
php artisan migrate --force

# Jalankan seeder untuk data awal (role, admin, kasir, menu, meja, dll)
php artisan db:seed --force
```

#### 4.6 Buat Symlink Storage

Ini **wajib** agar gambar menu yang di-upload admin bisa diakses melalui URL:

```bash
php artisan storage:link
# Membuat symlink: public/storage → storage/app/public
```

#### 4.7 Upload Folder `public/build` (Jika Belum Ada)

Jika Anda clone dari Git dan folder `public/build` tidak ter-include (karena `.gitignore`), upload folder build hasil `npm run build` dari lokal ke server:

```bash
# Dari komputer lokal:
scp -r ./public/build user@server-ip:/var/www/cafe-pos/public/
```

---

### Tahap 5: Atur Hak Akses File

```bash
# Set kepemilikan ke user web server
sudo chown -R www-data:www-data /var/www/cafe-pos

# Set permission standar
sudo find /var/www/cafe-pos -type f -exec chmod 644 {} \;
sudo find /var/www/cafe-pos -type d -exec chmod 755 {} \;

# Folder yang butuh write access
sudo chmod -R 775 /var/www/cafe-pos/storage
sudo chmod -R 775 /var/www/cafe-pos/bootstrap/cache
```

---

### Tahap 6: Konfigurasi Nginx

Buat file `/etc/nginx/sites-available/cafe-pos`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name pos.denjavas.com;          # Ganti dengan domain/IP Anda
    root /var/www/cafe-pos/public;          # WAJIB mengarah ke folder public

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;
    charset utf-8;

    # Aset statis (gambar, CSS, JS) — cache 30 hari
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Blokir akses ke file sensitif
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Upload size untuk gambar menu (max 5MB)
    client_max_body_size 5M;
}
```

Aktifkan site dan restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/cafe-pos /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default    # Hapus default site
sudo nginx -t                                # Test konfigurasi
sudo systemctl restart nginx
```

---

### Tahap 7: Setup Queue Worker (Supervisor)

Queue worker **wajib aktif** karena `composer run dev` di lokal menjalankan `queue:listen`. Di produksi, gunakan Supervisor agar worker otomatis restart jika crash.

Buat file `/etc/supervisor/conf.d/cafe-pos-worker.conf`:

```ini
[program:cafe-pos-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/cafe-pos/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/cafe-pos/storage/logs/worker.log
stopwaitsecs=3600
```

> 💡 `numprocs=1` cukup untuk 1 kafe. Naikkan ke `2` jika volume transaksi tinggi.

Aktifkan:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start cafe-pos-worker:*
```

Verifikasi berjalan:

```bash
sudo supervisorctl status
# Output: cafe-pos-worker:cafe-pos-worker_00   RUNNING   pid 12345, uptime 0:00:05
```

---

### Tahap 8: Optimasi Laravel untuk Produksi

```bash
cd /var/www/cafe-pos

# Cache konfigurasi, route, dan view untuk performa maksimal
php artisan optimize

# Ini menjalankan:
# - php artisan config:cache
# - php artisan route:cache
# - php artisan view:cache
# - php artisan event:cache
```

---

### Tahap 9: Setup SSL/HTTPS (Sangat Direkomendasikan)

Data transaksi, password, dan PIN kasir **harus** terenkripsi dalam transit:

```bash
# Instal Certbot untuk Let's Encrypt (gratis)
sudo apt install certbot python3-certbot-nginx -y

# Generate sertifikat SSL
sudo certbot --nginx -d pos.denjavas.com

# Auto-renew (sudah otomatis via systemd timer)
sudo certbot renew --dry-run
```

Setelah SSL aktif, pastikan `.env` memiliki:
```env
APP_URL=https://pos.denjavas.com
SESSION_SECURE_COOKIE=true
```

---

## ✅ Verifikasi Deployment

Setelah semua langkah selesai, lakukan pengecekan berikut:

### Checklist Verifikasi

| # | Item | Cara Cek | ✅ |
|---|------|----------|---|
| 1 | Halaman login muncul | Buka `https://pos.denjavas.com` di browser | ☐ |
| 2 | Login Admin berhasil | Email: `admin@denjavas.com`, Password: `password` | ☐ |
| 3 | Login Kasir berhasil | Email: `kasir@denjavas.com`, Password: `password` | ☐ |
| 4 | Dashboard Admin menampilkan data | Cek grafik dan KPI cards | ☐ |
| 5 | POS: Buka Shift berhasil | PIN: `654321`, masukkan modal awal | ☐ |
| 6 | POS: Buat pesanan berhasil | Pilih menu, checkout, cek stok berkurang | ☐ |
| 7 | POS: Cetak struk PDF | Klik cetak → PDF terbuka di tab baru | ☐ |
| 8 | Gambar menu tampil | Admin > Menu > upload gambar, cek tampil di POS | ☐ |
| 9 | Queue worker berjalan | `sudo supervisorctl status` → RUNNING | ☐ |
| 10 | SSL aktif | Gembok hijau di browser, URL `https://` | ☐ |

### Perintah Debugging

```bash
# Cek log error Laravel
tail -f /var/www/cafe-pos/storage/logs/laravel.log

# Cek log queue worker
tail -f /var/www/cafe-pos/storage/logs/worker.log

# Cek status Nginx
sudo systemctl status nginx

# Cek status PHP-FPM
sudo systemctl status php8.2-fpm

# Cek status Supervisor
sudo supervisorctl status
```

---

## 🔄 Prosedur Update Kode (Re-Deployment)

Ketika Anda melakukan perubahan kode dan perlu update di server:

```bash
cd /var/www/cafe-pos

# 1. Pull kode terbaru
sudo git pull origin main

# 2. Update dependency PHP (jika berubah)
composer install --no-dev --optimize-autoloader

# 3. Jalankan migrasi baru (jika ada)
php artisan migrate --force

# 4. Upload ulang public/build jika ada perubahan frontend
#    (build dulu di lokal: npm run build, lalu upload folder public/build)

# 5. Bersihkan cache lama dan buat cache baru
php artisan optimize:clear
php artisan optimize

# 6. Restart queue worker (agar membaca kode terbaru)
sudo supervisorctl restart cafe-pos-worker:*
```

---

## ⚠️ Keamanan Pasca-Deployment

| Item | Status di Proyek Anda | Tindakan |
|------|-----------------------|----------|
| `APP_DEBUG` | Saat ini `true` | **Wajib** ubah ke `false` di `.env` produksi |
| Default Password | Semua user menggunakan `password` | **Wajib** ganti password admin & kasir setelah deploy |
| Route Register | Route `/register` terbuka di `auth.php` | Pertimbangkan menonaktifkan jika tidak perlu registrasi publik |
| Route `/logout` (GET) | Ada di `web.php` line 51-56 — rentan CSRF | Pertimbangkan menghapus dan hanya gunakan POST `/logout` |
| `.env` file | Berisi APP_KEY dan DB credentials | Pastikan **tidak** ter-commit ke Git dan tidak bisa diakses dari web |
| `debugbar` | Terdaftar di `require-dev` composer | Sudah aman karena `--no-dev` pada `composer install` di produksi |

---

## 📌 Catatan Penting

1. **Kenapa MySQL, bukan SQLite di produksi?**
   SQLite menggunakan file-level locking. Jika 2 kasir checkout bersamaan, salah satu akan error `SQLITE_BUSY`. MySQL mendukung row-level locking yang aman untuk concurrent access.

2. **Kenapa Queue Worker, bukan `QUEUE_CONNECTION=sync`?**
   Proyek ini menjalankan `queue:listen` di `composer run dev`. Meskipun saat ini tidak ada Job class yang di-dispatch (proses inventori berjalan sinkron di dalam DB::transaction), queue worker tetap dibutuhkan untuk kompatibilitas dan jika di masa depan Anda menambahkan background jobs (contoh: integrasi QRIS Midtrans di roadmap Sprint 4).

3. **Kenapa tidak perlu Node.js di server?**
   Build aset Vite (`npm run build`) menghasilkan file statis (JS/CSS) di `public/build/`. File ini yang di-serve oleh Nginx. Node.js **hanya** dibutuhkan saat proses build, yang bisa dilakukan di komputer lokal.
