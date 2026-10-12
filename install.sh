#!/bin/bash
# Install script for Ubuntu
# Project: HB88 / SHBET

echo "========================================"
echo "HB88/SHBET Installation Script (Ubuntu)"
echo "========================================"
echo ""

# Check if running as root for system packages
if [ "$EUID" -ne 0 ]; then 
    echo "[WARNING] This script requires sudo privileges for system packages"
    echo "You may be prompted for your password"
    echo ""
fi

# Update system packages
echo "[INFO] Updating system packages..."
sudo apt update
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to update system packages"
    exit 1
fi
echo "[OK] System packages updated"
echo ""

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo "[INFO] Installing Node.js..."
    sudo apt install -y nodejs
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install Node.js"
        exit 1
    fi
    echo "[OK] Node.js installed successfully"
else
    echo "[OK] Node.js is already installed"
    node --version
fi
echo ""

# Check and install npm
if ! command -v npm &> /dev/null; then
    echo "[INFO] Installing npm..."
    sudo apt install -y npm
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install npm"
        exit 1
    fi
    echo "[OK] npm installed successfully"
else
    echo "[OK] npm is already installed"
    npm --version
fi
echo ""

# Check and install git
if ! command -v git &> /dev/null; then
    echo "[INFO] Installing git..."
    sudo apt install -y git
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install git"
        exit 1
    fi
    echo "[OK] git installed successfully"
else
    echo "[OK] git is already installed"
    git --version
fi
echo ""

# Check and install curl
if ! command -v curl &> /dev/null; then
    echo "[INFO] Installing curl..."
    sudo apt install -y curl
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install curl"
        exit 1
    fi
    echo "[OK] curl installed successfully"
else
    echo "[OK] curl is already installed"
    curl --version | head -n 1
fi
echo ""

# Install EAS CLI globally if not already installed
echo "Checking for EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "[INFO] Installing EAS CLI globally..."
    sudo npm install -g eas-cli
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install EAS CLI"
        exit 1
    fi
    echo "[OK] EAS CLI installed successfully"
else
    echo "[OK] EAS CLI is already installed"
    eas --version
fi
echo ""

# Install project dependencies
echo "Installing project dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo ""
echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Login to EAS: eas login"
echo "2. Start development: npm start"
echo "3. Start with tunnel: expo start --tunnel"
echo "4. Build Android APK: eas build -p android --profile preview"
echo "5. Build iOS IPA: npm run ios:build:produc"
echo "6. Build Web: npx expo export --platform web"
echo "7. Deploy Web: eas deploy"
echo ""
