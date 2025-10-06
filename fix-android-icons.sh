#!/bin/bash

echo "🔧 Fixing Android icon loading issues..."

# Create fonts directory if it doesn't exist
mkdir -p android/app/src/main/assets/fonts

# Copy MaterialCommunityIcons font to Android assets
echo "📁 Copying MaterialCommunityIcons font..."
cp node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf android/app/src/main/assets/fonts/

# Clean and rebuild Android
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo "✅ Android icon fixes applied!"
echo "📱 You can now run: npm run android"
echo "🔄 If icons still don't show, try: npx expo run:android --clear"
