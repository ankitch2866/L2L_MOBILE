# Android Setup Guide for Testing Icon Fixes

## Quick Test with Expo Go (Recommended)

### Step 1: Install Expo Go
1. Download **Expo Go** app from:
   - iOS: App Store
   - Android: Google Play Store

### Step 2: Start the Development Server
```bash
cd "/Users/ankitchauhan/Documents/new land/L2L_EPR_MOBILE_FRONT_V2"
npx expo start
```

### Step 3: Connect Your Phone
1. Scan the QR code with Expo Go app
2. The app will load on your phone
3. Test the icon loading and navigation bar

## Full Android SDK Setup (For Production)

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install and run the setup wizard
3. Install Android SDK through SDK Manager

### Step 2: Set Environment Variables
Add to your `~/.zshrc` file:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Step 3: Reload Terminal
```bash
source ~/.zshrc
```

### Step 4: Test the App
```bash
npm run android
```

## What to Test

### Icon Loading
1. ✅ Navigation bar icons (Dashboard, Masters, Transactions, Reports, Utilities, Profile)
2. ✅ Module icons in each screen
3. ✅ All icons should display properly (not as placeholder boxes)

### Safe Zone
1. ✅ Navigation bar should not overlap with Android navigation buttons
2. ✅ Proper spacing on devices with gesture navigation
3. ✅ Proper spacing on devices with traditional navigation buttons

## Troubleshooting

### Icons Still Not Loading
```bash
# Re-run the fix script
npm run fix-android-icons

# Clear cache and restart
npx expo start --clear
```

### Android SDK Issues
```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# If not set, add to ~/.zshrc and reload
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

## Expected Results

### Before Fixes
- ❌ Icons showing as placeholder boxes on Android
- ❌ Navigation bar overlapping with system UI

### After Fixes
- ✅ All icons loading properly on Android
- ✅ Navigation bar respecting safe areas
- ✅ Consistent experience across iOS and Android
