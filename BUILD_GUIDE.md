# Build Guide


### ✅ Các bước cần làm (trên máy Windows của bạn)

**Bước 1 — Cài Node.js** (mở PowerShell/Terminal với quyền Admin):

Tải và cài từ: **https://nodejs.org** → chọn bản **LTS (20.x trở lên)**  
Hoặc dùng `winget`:
```powershell
winget install OpenJS.NodeJS.LTS
```
Sau đó **đóng PowerShell và mở lại** để PATH được cập nhật.

**Bước 2 — Kiểm tra**:
```powershell
node --version   # phải hiện v20.x.x
npm --version    # phải hiện 10.x.x
```

**Bước 3 — Cài dependencies**:
```powershell
cd D:\HB88_unbuilt
npm install
```

**Bước 4 — Chạy Web trên Expo**:
```powershell
npm run web
```
→ Tự động mở `http://localhost:8081` trên trình duyệt  
→ Quét QR code bằng app **Expo Go** trên điện thoại để xem trên thiết bị

---

build hiện có

- Android APK qua EAS cloud
- iOS IPA qua EAS cloud với local credentials
- Web static export + EAS Deploy

## Yêu cầu chung

- Đã cài `Node.js`
- Đã cài `eas-cli`
- Đã cài `git`
- Đã có tài khoản Expo/EAS

Nếu chưa có `eas-cli`:

**Windows (PowerShell):**

```powershell
npm install -g eas-cli
```

**Ubuntu (bash):**

```bash
sudo npm install -g eas-cli
```

Đăng nhập EAS:

```bash
eas login
```

---

## Hoạt động trên Windows

Project mặc định: `D:\HB88_unbuilt` hoặc `D:\HB88_unbuilt`

### 1. Chuyển đến thư mục project:

```powershell
Set-Location -Path "D:\HB88_unbuilt"
```

### 2. Cài đặt dependencies:

```powershell
npm install
```

### 3. Chạy ứng dụng local (Metro / Expo):

```powershell
npm start
```

### 4. Build Android APK:

```powershell
eas build -p android --profile preview
```

### 5. Build iOS IPA (với local credentials):

**Dùng cert dev:**

```powershell
npm run ios:build:dev
```

**Dùng cert produc:**

```powershell
npm run ios:build:produc
```

### 6. Build Web:

```powershell
npx expo export --platform web
eas deploy
```

Nếu muốn đưa lên production:

```powershell
eas deploy --prod
```

---

## Hoạt động trên Ubuntu

Project mặc định: `D:\HB88_unbuilt`

### 1. Cập nhật hệ thống và cài đặt Node/EAS:

```bash
sudo apt update
sudo apt install -y nodejs npm git curl
sudo npm install -g eas-cli
```

### 2. Chuyển đến thư mục project:

```bash
cd D:\HB88_unbuilt
```

### 3. Cài đặt dependencies:

```bash
npm install
```

### 4. Chạy ứng dụng local:

```bash
npm start
```

Nếu muốn cho phép truy cập từ xa thì sử dụng tunnel:

```bash
expo start --tunnel
```

### 5. Build Android APK:

```bash
eas build -p android --profile preview
```

### 6. Build iOS IPA:

**Dùng cert dev:**

```bash
npm run ios:build:dev
```

**Dùng cert produc:**

```bash
npm run ios:build:produc
```

### 7. Build Web:

```bash
npx expo export --platform web
eas deploy
```

Nếu muốn đưa lên production:

```bash
eas deploy --prod
```

---

## Chi tiết các loại build

### Android APK

Project đang dùng profile `preview` để build Android APK.

**Lệnh build:**

```bash
eas build -p android --profile preview
```

**Kết quả:**

- EAS build trên cloud
- Sau khi xong sẽ trả link tải file APK

**Lưu ý:**

- `preview` trong `eas.json` đã được cấu hình `android.buildType = apk`
- Nếu lỗi dependency, kiểm tra lại `package-lock.json`

---

### iOS IPA

Project đang dùng profile `ios-preview` để build iOS bằng local credentials.

Hiện đang có 2 bộ cert:

- `certdev`
- `certproduc`

**Files liên quan:**

- `credentials.dev.json`
- `credentials.produc.json`
- `credentials.json`

`credentials.json` là file active mà EAS sẽ đọc khi build.

#### Dùng bộ cert dev

```bash
npm run ios:cert:dev
eas build -p ios --profile ios-preview
```

Hoặc chạy 1 lệnh:

```bash
npm run ios:build:dev
```

#### Dùng bộ cert produc

```bash
npm run ios:cert:produc
eas build -p ios --profile ios-preview
```

Hoặc chạy 1 lệnh:

```bash
npm run ios:build:produc
```

**Lưu ý:**

- `bundleIdentifier` trong `app.json` phải khớp provisioning profile của bộ cert đang dùng
- Nếu build báo mismatch app ID thì đổi `ios.bundleIdentifier` hoặc đổi bộ cert
- Build iOS cloud không cần Mac, nhưng credentials phải hợp lệ

---

### Web Export

Build web static ra thư mục `dist`:

```bash
npx expo export --platform web
```

**Kết quả:**

- Thư mục output: `dist`

---

### Web Deploy

Sau khi export web:

```bash
eas deploy
```

Nếu muốn đưa lên production:

```bash
eas deploy --prod
```

**Kết quả:**

- EAS sẽ upload nội dung web static trong `dist`
- CLI trả ra `Deployment URL`

---

### Build local Android native

Chỉ dùng khi bạn muốn tự build bằng Gradle thay vì EAS.

**Tạo native project:**

```bash
npx expo prebuild --platform android
```

**Build release APK:**

Windows:

```powershell
cd android
.\gradlew.bat assembleRelease
```

Ubuntu:

```bash
cd android
./gradlew assembleRelease
```

**File APK:**

- `android/app/build/outputs/apk/release/app-release.apk`

---

## Thứ tự để xài nhanh

### Android APK

```bash
eas build -p android --profile preview
```

### iOS IPA

```bash
npm run ios:build:produc
```

### Web

```bash
npx expo export --platform web
eas deploy
```

---

## Files liên quan

- `eas.json`
- `app.json`
- `credentials.json`
- `credentials.dev.json`
- `credentials.produc.json`
- `package.json`