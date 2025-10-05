#!/bin/bash

echo "🔄 Restarting L2L EPR Mobile App..."
echo ""

# Kill any running Expo processes
echo "1️⃣ Stopping any running Expo processes..."
killall -9 node 2>/dev/null || true

# Clear caches
echo "2️⃣ Clearing caches..."
rm -rf .expo/web-cache 2>/dev/null || true
rm -rf .expo/web 2>/dev/null || true

# Start Expo with clear cache
echo "3️⃣ Starting Expo with clear cache..."
echo ""
echo "✅ Ready! Scan the QR code or press:"
echo "   - 'i' for iOS simulator"
echo "   - 'a' for Android emulator"
echo ""

npx expo start --clear
