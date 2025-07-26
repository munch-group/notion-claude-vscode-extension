#!/bin/bash

# VS Code Extension Setup Script
echo "🚀 Setting up Notion Claude Editor VS Code Extension..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

# Install VSCE if not already installed
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing VSCE globally..."
    npm install -g vsce
else
    echo "✅ VSCE already installed"
fi

echo "✅ Setup complete!"
echo ""
echo "🛠️  Development commands:"
echo "  npm run watch    - Watch mode for development"
echo "  npm run compile  - Compile TypeScript"
echo "  npm run package  - Package extension as .vsix"
echo "  npm run lint     - Run ESLint"
echo ""
echo "🔧 To debug:"
echo "  1. Open this folder in VS Code"
echo "  2. Press F5 to launch Extension Development Host"
echo "  3. Test your extension in the new window"
echo ""
echo "📦 To install locally:"
echo "  1. Run: npm run package"
echo "  2. Install: code --install-extension notion-claude-editor-0.1.0.vsix"