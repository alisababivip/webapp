# Quick Commands Reference - h12368.com

## Server Access

```bash
ssh root@127.0.0.1
# Password: Thuthuthu1u
```

## Navigate to Project

```bash
cd D:\HB88_unbuilt
```

## Python Virtual Environment

```bash
# Activate venv
source .venv/bin/activate

# Deactivate venv
deactivate

# Setup venv (first time)
chmod +x setup-venv.sh
./setup-venv.sh
```

## Git Operations

```bash
# Pull latest code
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -5
```

## Build & Deploy

```bash
# Install dependencies
npm install

# Build web
npx expo export --platform web

# Build Android APK
eas build -p android --profile preview

# Build iOS IPA
npm run ios:build:produc
```

## Nginx Operations

```bash
# Test config
sudo nginx -t

# Start nginx
sudo systemctl start nginx

# Restart nginx
sudo systemctl restart nginx

# Reload nginx (after config change)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Stop nginx
sudo systemctl stop nginx
```

## View Logs

```bash
# Access logs
tail -f D:\HB88_unbuilt.log

# Error logs
tail -f D:\HB88_unbuilt.error.log

# Last 50 lines of error log
tail -50 D:\HB88_unbuilt.error.log

# Nginx error log
tail -f /var/log/nginx/error.log
```

## File Permissions

```bash
# Set ownership
sudo chown -R www:www D:\HB88_unbuilt

# Set directory permissions
sudo find D:\HB88_unbuilt -type d -exec chmod 755 {} \;

# Set file permissions
sudo find D:\HB88_unbuilt -type f -exec chmod 644 {} \;
```

## Test Website

```bash
# Test HTTP response
curl -I http://h12368.com

# Test HTTPS response
curl -I https://h12368.com

# View full response
curl http://h12368.com

# Test with specific header
curl -H "User-Agent: Mozilla/5.0" http://h12368.com
```

## System Info

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep nginx
ps aux | grep node

# Check open ports
sudo netstat -tulpn | grep LISTEN
```

## aaPanel

```bash
# Access aaPanel
# URL: http://157.245.151.67:7800

# Restart aaPanel
sudo /etc/init.d/bt restart

# Check aaPanel status
sudo /etc/init.d/bt status
```

## One-Line Deploy

```bash
cd D:\HB88_unbuilt && git pull origin main && npm install && npx expo export --platform web && sudo systemctl reload nginx && echo "✅ Deploy completed!"
```

## Troubleshooting

```bash
# If nginx won't start
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log
sudo systemctl restart nginx

# If website shows 502
sudo systemctl status nginx
sudo tail -50 D:\HB88_unbuilt.error.log

# If permission denied
sudo chown -R www:www D:\HB88_unbuilt
sudo chmod -R 755 D:\HB88_unbuilt

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

```bash
# Copy example env
cp .env.example .env

# Edit env file
nano .env

# View env file
cat .env
```

## Backup

```bash
# Backup entire project
tar -czf hb88-backup-$(date +%Y%m%d).tar.gz D:\HB88_unbuilt

# Backup dist folder only
tar -czf dist-backup-$(date +%Y%m%d).tar.gz D:\HB88_unbuilt/dist

# Restore from backup
tar -xzf hb88-backup-20260520.tar.gz -C /
```
