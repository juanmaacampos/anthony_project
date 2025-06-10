#!/bin/bash

# 🍽️ CMS Menu Integration - Test Script
# Run this script to verify your installation

echo "🔍 Testing CMS Menu Integration..."
echo "================================="

# Check if Firebase is installed
echo "📦 Checking Firebase installation..."
if npm list firebase &> /dev/null; then
    echo "✅ Firebase is installed"
else
    echo "❌ Firebase not found - run: npm install firebase"
    exit 1
fi

# Check if required files exist
echo "📁 Checking required files..."

files=(
    "src/cms-menu/menu-sdk.js"
    "src/cms-menu/useMenu.js" 
    "src/cms-menu/MenuComponents.jsx"
    "src/cms-menu/MenuComponents.css"
    "src/cms-menu/config.js"
    "src/cms-menu/index.js"
    "src/pages/MenuPage.jsx"
)

all_files_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - missing!"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo "❌ Some required files are missing!"
    exit 1
fi

# Check configuration
echo "⚙️ Checking configuration..."
if grep -q "tu-api-key\|YOUR_RESTAURANT_UID_HERE" src/cms-menu/config.js; then
    echo "⚠️ Configuration needs to be updated in src/cms-menu/config.js"
    echo "   - Update Firebase config"
    echo "   - Set your restaurant UID"
else
    echo "✅ Configuration appears to be updated"
fi

# Check if project can build
echo "🔨 Testing build..."
if npm run build &> /dev/null; then
    echo "✅ Project builds successfully"
else
    echo "⚠️ Build issues detected - check for syntax errors"
fi

echo ""
echo "🎉 CMS Menu Integration Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update src/cms-menu/config.js with your Firebase settings"
echo "   2. Get your restaurant UID from the CMS admin panel"
echo "   3. Test the integration by running: npm run dev"
echo "   4. Visit /pages/MenuPage.jsx for examples"
echo ""
echo "📖 See CMS_INTEGRATION_GUIDE.md for detailed instructions"
