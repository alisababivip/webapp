# setup-android-sdk.ps1
# Chạy với quyền Admin: powershell -ExecutionPolicy Bypass -File setup-android-sdk.ps1

$SDK_ROOT = "$env:USERPROFILE\Android\Sdk"
$CMDLINE_TOOLS_DIR = "$SDK_ROOT\cmdline-tools\latest"
$ZIP = "$env:TEMP\cmdline-tools.zip"
$URL = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "=== Android SDK Setup ===" -ForegroundColor Cyan

# 1. Tìm JAVA_HOME
$javaPath = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.1-hotspot",
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot",
    "C:\Program Files\Microsoft\jdk-17.0.20.8"
) | Where-Object { Test-Path "$_\bin\java.exe" } | Select-Object -First 1

if (-not $javaPath) {
    $javaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match "jdk-17" } |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $javaPath) {
    Write-Host "ERROR: Java JDK 17 not found. Run: winget install EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Red
    exit 1
}
Write-Host "Java found: $javaPath" -ForegroundColor Green

# 2. Tải cmdline-tools
Write-Host "Downloading Android cmdline-tools..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force $SDK_ROOT | Out-Null
Invoke-WebRequest -Uri $URL -OutFile $ZIP -UseBasicParsing
Write-Host "Download complete." -ForegroundColor Green

# 3. Giải nén
Write-Host "Extracting..." -ForegroundColor Yellow
$EXTRACT_TMP = "$env:TEMP\cmdline-tools-extract"
Remove-Item $EXTRACT_TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $ZIP -DestinationPath $EXTRACT_TMP -Force
New-Item -ItemType Directory -Force $CMDLINE_TOOLS_DIR | Out-Null
Copy-Item "$EXTRACT_TMP\cmdline-tools\*" $CMDLINE_TOOLS_DIR -Recurse -Force
Write-Host "Extracted to $CMDLINE_TOOLS_DIR" -ForegroundColor Green

# 4. Set biến môi trường session hiện tại
$env:JAVA_HOME  = $javaPath
$env:ANDROID_HOME = $SDK_ROOT
$env:ANDROID_SDK_ROOT = $SDK_ROOT
$env:PATH = "$javaPath\bin;$SDK_ROOT\cmdline-tools\latest\bin;$SDK_ROOT\platform-tools;$SDK_ROOT\build-tools\36.0.0;$env:PATH"

# 5. Set biến môi trường hệ thống (persistent)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME",         $javaPath,  "Machine")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME",      $SDK_ROOT,  "Machine")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT",  $SDK_ROOT,  "Machine")

$sysPATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPATH = "$javaPath\bin;$SDK_ROOT\cmdline-tools\latest\bin;$SDK_ROOT\platform-tools;$SDK_ROOT\build-tools\36.0.0"
if ($sysPATH -notlike "*$SDK_ROOT*") {
    [System.Environment]::SetEnvironmentVariable("PATH", "$newPATH;$sysPATH", "Machine")
    Write-Host "PATH updated in system environment." -ForegroundColor Green
}

# 6. Cài Android SDK components
Write-Host "Installing SDK components (accept licenses)..." -ForegroundColor Yellow
$sdkmanager = "$CMDLINE_TOOLS_DIR\bin\sdkmanager.bat"

# Accept all licenses
"y`ny`ny`ny`ny`ny`ny`ny" | & $sdkmanager --licenses 2>&1 | Out-Null

# Cài components
& $sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" 2>&1

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "JAVA_HOME     = $env:JAVA_HOME"
Write-Host "ANDROID_HOME  = $env:ANDROID_HOME"
Write-Host ""
Write-Host "Restart PowerShell then run:" -ForegroundColor Yellow
Write-Host "  cd D:\HB88_unbuilt\android"
Write-Host "  .\gradlew.bat assembleRelease"
