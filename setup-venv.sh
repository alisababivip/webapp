#!/bin/bash
# Python Virtual Environment Setup Script
# For: D:\HB88_unbuilt

echo "========================================"
echo "Python Virtual Environment Setup"
echo "========================================"
echo ""

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "[INFO] Installing Python3..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install Python3"
        exit 1
    fi
    echo "[OK] Python3 installed successfully"
else
    echo "[OK] Python3 is already installed"
    python3 --version
fi
echo ""

# Navigate to project directory
PROJECT_DIR="D:\HB88_unbuilt"
cd "$PROJECT_DIR" || exit 1
echo "[INFO] Working directory: $PROJECT_DIR"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv .venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment"
        exit 1
    fi
    echo "[OK] Virtual environment created successfully"
else
    echo "[OK] Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "[INFO] Activating virtual environment..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate virtual environment"
    exit 1
fi
echo "[OK] Virtual environment activated"
echo ""

# Upgrade pip
echo "[INFO] Upgrading pip..."
pip install --upgrade pip
echo ""

# Install common Python packages (if requirements.txt exists)
if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing packages from requirements.txt..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install packages"
        exit 1
    fi
    echo "[OK] Packages installed successfully"
else
    echo "[INFO] No requirements.txt found, skipping package installation"
fi
echo ""

echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "To activate the virtual environment manually:"
echo "  cd $PROJECT_DIR"
echo "  source .venv/bin/activate"
echo ""
echo "To deactivate:"
echo "  deactivate"
echo ""
