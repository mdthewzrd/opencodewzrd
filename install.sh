#!/bin/bash

# WZRD.dev OpenCode Extension Installer
# One-line installer: curl -s https://raw.githubusercontent.com/wzrddev/opencodewzrd/main/install.sh | bash

set -e

echo "🚀 Installing WZRD.dev OpenCode Extension..."
echo "=========================================="

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "   Please install npm (comes with Node.js)"
    exit 1
fi

echo "✅ Prerequisites checked: Node.js $(node -v), npm $(npm -v)"

# Install package
echo "📦 Installing @wzrddev/opencode-remi..."

# Method 1: Try from GitHub (when published)
echo "🔄 Attempting to install from GitHub..."

# First check if we have a local tarball
if [ -f "wzrddev-opencode-remi-0.1.0.tgz" ]; then
    echo "📦 Found local package tarball"
    if npm install -g ./wzrddev-opencode-remi-0.1.0.tgz; then
        echo "✅ Package installed from local tarball"
    else
        echo "❌ Failed to install from local tarball"
        echo "🚧 Using development installation method..."
        
        # Development method: symlink
        mkdir -p ~/.npm-global/bin
        ln -sf $(pwd)/dist/cli.js ~/.npm-global/bin/wzrd
        echo "✅ Created symlink: ~/.npm-global/bin/wzrd"
        
        # Add to PATH if not already
        if [[ ":$PATH:" != *":$HOME/.npm-global/bin:"* ]]; then
            echo "export PATH=\$HOME/.npm-global/bin:\$PATH" >> ~/.bashrc
            echo "✅ Added ~/.npm-global/bin to PATH in ~/.bashrc"
            echo "📝 Run 'source ~/.bashrc' or restart terminal"
        fi
    fi
elif npm install -g @wzrddev/opencode-remi@latest; then
    echo "✅ Package installed successfully from npm"
else
    echo "⚠️  Package not found on npm. Using development installation..."
    
    # Development method: clone repo and build
    if [ -d ".git" ]; then
        # Already in repo, build it
        echo "📦 Building from current directory..."
        npm run build
        mkdir -p ~/.npm-global/bin
        ln -sf $(pwd)/dist/cli.js ~/.npm-global/bin/wzrd
        echo "✅ Created symlink: ~/.npm-global/bin/wzrd"
    else
        echo "🔧 Please download package from GitHub first"
        echo "   git clone https://github.com/wzrddev/opencodewzrd.git"
        exit 1
    fi
fi

# Setup configuration
echo "⚙️  Setting up configuration..."
mkdir -p ~/.wzrd
CONFIG_FILE="$HOME/.wzrd/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    cat > "$CONFIG_FILE" << EOF
{
  "autoModeDetection": true,
  "skillDirectory": "./skills",
  "logLevel": "info",
  "maxResponseLength": 5000,
  "enableSkills": true
}
EOF
    echo "✅ Created configuration file: $CONFIG_FILE"
else
    echo "⚠️  Configuration file already exists: $CONFIG_FILE"
fi

# Verify installation
echo "🔍 Verifying installation..."
if command -v wzrd &> /dev/null; then
    echo "✅ 'wzrd' command available"
    
    # Test basic functionality
    echo "🧪 Testing basic functionality..."
    if wzrd modes &> /dev/null; then
        echo "✅ Basic functionality working"
    else
        echo "⚠️  Basic test failed, but installation completed"
    fi
else
    echo "⚠️  'wzrd' command not in PATH"
    echo "   Try: npx wzrd modes"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Quick Start:"
echo "  wzrd setup           # Setup configuration"
echo "  wzrd modes           # List available modes"
echo "  wzrd chat \"Your message\"  # Start chat session"
echo ""
echo "OpenCode Integration:"
echo "  1. Open OpenCode"
echo "  2. Use command palette (Cmd/Ctrl+Shift+P)"
echo "  3. Type 'Remi' to access WZRD.dev commands"
echo ""
echo "Documentation: https://github.com/wzrddev/opencodewzrd"
echo "Report issues: https://github.com/wzrddev/opencodewzrd/issues"
echo ""
echo "✨ Happy coding with Remi from WZRD.dev!"