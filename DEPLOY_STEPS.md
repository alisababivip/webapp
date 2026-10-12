# Quick Deploy Steps - h12368.com

## Server Information
- **Domain**: h12368.com
- **Server IP**: 157.245.151.67
- **SSH User**: root
- **Project Path**: D:\HB88_unbuilt

## Step-by-Step Deployment

### 1. SSH vào Server

```bash
ssh root@127.0.0.1
```

Password: `Thuthuthu1u`

### 2. Navigate to Project Directory

```bash
cd D:\HB88_unbuilt
```

### 3. Pull Latest Code (nếu dùng Git)

```bash
git pull origin main
```

Hoặc upload code mới qua SFTP/FTP.

### 4. Install Dependencies

```bash
# Chạy install script
chmod +x install.sh
./install.sh
```

Hoặc manual:

```bash
npm install
```

### 5. Build Web Static

```bash
npx expo export --platform web
```

Files sẽ được build vào thư mục `dist/`.

### 6. Configure Nginx in aaPanel

**Option A: Via aaPanel UI**

1. Truy cập aaPanel: `http://157.245.151.67:7800`
2. Vào **Website** → Tìm site `h12368.com`
3. Click **Config**
4. Copy toàn bộ nội dung từ file `nginx.conf` trong project
5. Paste vào config editor
6. Click **Save**
7. Click **Reload** để reload Nginx

**Option B: Via SSH**

```bash
# Backup config cũ
sudo cp /www/server/panel/vhost/nginx/h12368.com.conf /www/server/panel/vhost/nginx/h12368.com.conf.backup

# Copy config mới từ project
sudo cp D:\HB88_unbuilt/nginx.conf /www/server/panel/vhost/nginx/h12368.com.conf

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Set Permissions

```bash
# Set ownership
sudo chown -R www:www D:\HB88_unbuilt

# Set permissions
sudo find D:\HB88_unbuilt -type d -exec chmod 755 {} \;
sudo find D:\HB88_unbuilt -type f -exec chmod 644 {} \;
```

### 8. Configure SSL (Optional but Recommended)

**Via aaPanel:**

1. Vào **Website** → Click `h12368.com`
2. Click tab **SSL**
3. Chọn **Let's Encrypt**
4. Nhập email
5. Click **Apply**
6. Đợi 1-2 phút để certificate được cấp
7. Bật **Force HTTPS**

**Sau khi có SSL, uncomment SSL config trong nginx.conf:**

```bash
# Edit nginx config
sudo nano /www/server/panel/vhost/nginx/h12368.com.conf

# Uncomment các dòng SSL configuration
# Uncomment HTTP to HTTPS redirect

# Reload Nginx
sudo systemctl reload nginx
```

### 9. Test Website

```bash
# Test HTTP
curl -I http://h12368.com

# Test HTTPS (sau khi cấu hình SSL)
curl -I https://h12368.com
```

Hoặc mở browser: `http://h12368.com` hoặc `https://h12368.com`

### 10. Monitor Logs

```bash
# Access logs
tail -f D:\HB88_unbuilt.log

# Error logs
tail -f D:\HB88_unbuilt.error.log
```

## Quick Update Script

Tạo file `deploy.sh` để tự động hóa:

```bash
#!/bin/bash
cd D:\HB88_unbuilt
git pull origin main
npm install
npx expo export --platform web
sudo chown -R www:www D:\HB88_unbuilt
sudo systemctl reload nginx
echo "Deploy completed!"
```

Chạy deploy:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Website không load

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check if dist folder exists
ls -la D:\HB88_unbuilt/dist
```

### Permission errors

```bash
sudo chown -R www:www D:\HB88_unbuilt
sudo chmod -R 755 D:\HB88_unbuilt
```

### 502 Bad Gateway

```bash
# Check Nginx error logs
tail -50 D:\HB88_unbuilt.error.log

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Important Files

- **Nginx Config**: `/www/server/panel/vhost/nginx/h12368.com.conf`
- **Web Files**: `D:\HB88_unbuilt/dist/`
- **Access Log**: `D:\HB88_unbuilt.log`
- **Error Log**: `D:\HB88_unbuilt.error.log`

## Contact

- aaPanel: `http://157.245.151.67:7800`
- Website: `http://h12368.com` (or `https://h12368.com` after SSL)
