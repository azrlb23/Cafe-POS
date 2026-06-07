/**
 * PM2 Ecosystem Configuration — Denjavas Cafe POS v2
 * 
 * Jalankan dengan:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup    (auto-start saat server reboot)
 * 
 * Monitor dengan:
 *   pm2 status
 *   pm2 logs cafe-pos-api
 */

module.exports = {
  apps: [
    {
      name: 'cafe-pos-api',
      script: 'dist/index.js',
      cwd: '/var/www/cafe-pos/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/cafe-pos-error.log',
      out_file: '/var/log/pm2/cafe-pos-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
