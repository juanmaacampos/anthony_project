#!/bin/bash

echo "🔥 Deploying Firebase Storage Rules..."

# Make sure we're in the right directory
cd "/home/juanmaa/Desktop/templates resto-shop/resto-MP"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase if not already logged in
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost

# Deploy storage rules
echo "📋 Deploying storage rules..."
firebase deploy --only storage

echo "✅ Storage rules deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Go to Firebase Console > Storage > Rules"
echo "2. Verify the rules are active"
echo "3. Test read permissions for your images"
echo ""
echo "📱 Your storage rules now allow:"
echo "   ✅ Public read access to all images"
echo "   ✅ Public list access to all directories"
echo "   ✅ Support for both 'businesses' and 'restaurants' structures"
