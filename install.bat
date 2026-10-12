@echo off
REM Install script for Windows
REM Project: HB88 / SHBET

echo ========================================
echo HB88/SHBET Installation Script (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Install EAS CLI globally if not already installed
echo Checking for EAS CLI...
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing EAS CLI globally...
    call npm install -g eas-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install EAS CLI
        pause
        exit /b 1
    )
    echo [OK] EAS CLI installed successfully
) else (
    echo [OK] EAS CLI is already installed
    eas --version
)
echo.

REM Install project dependencies
echo Installing project dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Login to EAS: eas login
echo 2. Start development: npm start
echo 3. Build Android APK: eas build -p android --profile preview
echo 4. Build iOS IPA: npm run ios:build:produc
echo 5. Build Web: npx expo export --platform web
echo.
pause
