# aaPanel Deployment Guide - HB88/SHBET Web App

Hướng dẫn deploy ứng dụng web HB88/SHBET lên server Ubuntu sử dụng aaPanel.

## Yêu cầu

- Server Ubuntu 18.04+ hoặc Debian 10+
- aaPanel đã được cài đặt
- Domain đã trỏ về IP server
- Node.js và npm đã được cài đặt (xem `install.sh`)

## Bước 1: Cài đặt aaPanel (nếu chưa có)

```bash
# Ubuntu/Debian
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && sudo bash install.sh aapanel
```

Sau khi cài đặt xong, truy cập aaPanel qua:
- URL: `http://YOUR_SERVER_IP:7800`
- Username và password sẽ hiển thị sau khi cài đặt

## Bước 2: Cài đặt Nginx trong aaPanel

1. Đăng nhập vào aaPanel
2. Vào **App Store**
3. Tìm và cài đặt **Nginx** (khuyến nghị phiên bản 1.20+)
4. Đợi quá trình cài đặt hoàn tất

## Bước 3: Tạo Website trong aaPanel

1. Vào **Website** → **Add site**
2. Điền thông tin:
   - **Domain**: `yourdomain.com` (và `www.yourdomain.com` nếu cần)
   - **Root directory**: `/www/wwwroot/yourdomain.com`
   - **PHP Version**: Chọn **Pure static** (không cần PHP)
   - **Create FTP**: Không cần (optional)
   - **Create database**: Không cần
3. Click **Submit**

## Bước 4: Upload Code lên Server

### Cách 1: Sử dụng Git (Khuyến nghị)

```bash
# SSH vào server
cd /www/wwwroot/yourdomain.com

# Clone repository
git clone https://github.com/your-repo/hb88.git .

# Hoặc nếu đã có code, pull latest
git pull origin main
```

### Cách 2: Upload qua FTP/SFTP

1. Sử dụng FileZilla hoặc WinSCP
2. Kết nối đến server qua SFTP
3. Upload toàn bộ project vào `/www/wwwroot/yourdomain.com`

### Cách 3: Upload qua aaPanel File Manager

1. Vào **Files** trong aaPanel
2. Navigate đến `/www/wwwroot/yourdomain.com`
3. Upload file zip và extract

## Bước 5: Cài đặt Dependencies và Build

```bash
# SSH vào server
cd /www/wwwroot/yourdomain.com

# Chạy install script
chmod +x install.sh
./install.sh

# Build web static
npx expo export --platform web
```

Sau khi build xong, các file static sẽ nằm trong thư mục `dist/`.

## Bước 6: Cấu hình Nginx

### Cách 1: Sử dụng aaPanel UI (Dễ dàng)

1. Vào **Website** → Click vào domain của bạn
2. Click tab **Config**
3. Thay thế toàn bộ nội dung bằng file `nginx.conf` trong project
4. **Quan trọng**: Sửa các dòng sau:
   ```nginx
   server_name example.com www.example.com;  # → Đổi thành domain của bạn
   root /www/wwwroot/example.com/dist;       # → Đổi thành path của bạn
   access_log /www/wwwlogs/example.com.log;  # → Đổi thành domain của bạn
   ```
5. Click **Save**
6. Reload Nginx: **Website** → **Nginx** → **Reload**

### Cách 2: Sử dụng SSH (Nâng cao)

```bash
# Backup config cũ
sudo cp /www/server/panel/vhost/nginx/yourdomain.com.conf /www/server/panel/vhost/nginx/yourdomain.com.conf.backup

# Copy config mới
sudo cp nginx.conf /www/server/panel/vhost/nginx/yourdomain.com.conf

# Sửa domain và paths trong file
sudo nano /www/server/panel/vhost/nginx/yourdomain.com.conf

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Bước 7: Cấu hình SSL (HTTPS)

1. Vào **Website** → Click domain
2. Click tab **SSL**
3. Chọn **Let's Encrypt**
4. Nhập email và click **Apply**
5. Đợi SSL certificate được cấp (1-2 phút)
6. Bật **Force HTTPS** để redirect HTTP → HTTPS

Hoặc sử dụng SSL certificate có sẵn:
1. Click **Other Certificate**
2. Paste certificate và private key
3. Click **Save**

## Bước 8: Cấu hình Permissions

```bash
# Set ownership
sudo chown -R www:www /www/wwwroot/yourdomain.com

# Set permissions
sudo find /www/wwwroot/yourdomain.com -type d -exec chmod 755 {} \;
sudo find /www/wwwroot/yourdomain.com -type f -exec chmod 644 {} \;
```

## Bước 9: Kiểm tra Website

1. Truy cập `http://yourdomain.com` hoặc `https://yourdomain.com`
2. Kiểm tra console browser (F12) xem có lỗi không
3. Test các tính năng chính của app

## Cập nhật Code (CI/CD)

### Cập nhật thủ công

```bash
cd /www/wwwroot/yourdomain.com

# Pull code mới
git pull origin main

# Rebuild
npx expo export --platform web

# Clear cache (optional)
sudo systemctl reload nginx
```

### Tự động hóa với Git Webhook

1. Vào **Website** → Click domain → **Git**
2. Nhập Git repository URL
3. Chọn branch (main/master)
4. Thêm deploy script:
   ```bash
   #!/bin/bash
   cd /www/wwwroot/yourdomain.com
   git pull origin main
   npm install
   npx expo export --platform web
   sudo systemctl reload nginx
   ```
5. Copy webhook URL và thêm vào GitHub/GitLab repository settings

## Tối ưu hóa Performance

### 1. Bật Gzip Compression

Đã được cấu hình trong `nginx.conf`. Kiểm tra:

```bash
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com
```

Phải thấy header: `Content-Encoding: gzip`

### 2. Cấu hình Cache

Cache đã được cấu hình trong `nginx.conf`:
- Static assets (JS, CSS, images): 1 year
- HTML, JSON: No cache

### 3. Bật HTTP/2

HTTP/2 tự động bật khi có SSL. Kiểm tra:

```bash
curl -I --http2 https://yourdomain.com
```

### 4. Cấu hình CDN (Optional)

Sử dụng Cloudflare hoặc CDN khác:
1. Trỏ domain về Cloudflare nameservers
2. Bật Proxy (orange cloud)
3. Cấu hình cache rules trong Cloudflare

## Monitoring và Logs

### Xem Access Logs

```bash
tail -f /www/wwwlogs/yourdomain.com.log
```

### Xem Error Logs

```bash
tail -f /www/wwwlogs/yourdomain.com.error.log
```

### Monitoring trong aaPanel

1. Vào **Monitor**
2. Xem CPU, RAM, Disk usage
3. Xem Network traffic

## Troubleshooting

### Lỗi 502 Bad Gateway

```bash
# Kiểm tra Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Lỗi 404 Not Found

- Kiểm tra `root` path trong nginx config
- Kiểm tra file `index.html` có tồn tại trong `dist/`
- Kiểm tra permissions

### Lỗi Permission Denied

```bash
# Fix permissions
sudo chown -R www:www /www/wwwroot/yourdomain.com
sudo chmod -R 755 /www/wwwroot/yourdomain.com
```

### Website không load CSS/JS

- Kiểm tra browser console (F12)
- Kiểm tra paths trong `index.html`
- Clear browser cache
- Reload Nginx

## Security Best Practices

1. **Firewall**: Chỉ mở port 80, 443, 22, 7800
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw allow 7800/tcp
   sudo ufw enable
   ```

2. **Đổi port aaPanel**: Vào **Panel** → **Settings** → đổi port mặc định 7800

3. **Bật 2FA**: Vào **Panel** → **Settings** → **Two-Factor Authentication**

4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Backup**: Vào **Cron** → Tạo backup tự động hàng ngày

## Files quan trọng

- `/www/wwwroot/yourdomain.com/dist/` - Web static files
- `/www/server/panel/vhost/nginx/yourdomain.com.conf` - Nginx config
- `/www/wwwlogs/yourdomain.com.log` - Access logs
- `/www/wwwlogs/yourdomain.com.error.log` - Error logs

## Liên hệ & Hỗ trợ

- aaPanel Documentation: https://doc.aapanel.com/
- aaPanel Forum: https://forum.aapanel.com/
- Expo Documentation: https://docs.expo.dev/

---

**Lưu ý**: Thay thế `yourdomain.com` và `example.com` bằng domain thực tế của bạn trong tất cả các lệnh và file config.
