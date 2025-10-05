# 📱 L2L EPR Mobile App

React Native mobile application for L2L EPR System built with Expo.

## 🚀 Quick Start

```bash
# Navigate to project
cd L2L_EPR_MOBILE_FRONT_V2

# Start development server
npm start

# Or
npx expo start
```

Then scan the QR code with:
- **Android:** Expo Go app
- **iOS:** Camera app

## ⚙️ Configuration

**Important:** Update backend URL in `src/config/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5002/api';
```

Replace `YOUR_LOCAL_IP` with your computer's IP address (not localhost).

## 🔐 Login

- **User ID:** ADMIN002
- **Password:** Admin@123

## ✅ Phase 1 Complete

- ✅ Authentication
- ✅ Navigation
- ✅ State Management
- ✅ API Configuration
- ✅ Theme System

## 📚 Documentation

See `SETUP_GUIDE.md` for detailed setup instructions and features.

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
├── store/           # Redux store
├── navigation/      # Navigation setup
└── screens/         # App screens
```

## 🛠️ Tech Stack

- React Native
- Expo
- React Navigation
- Redux Toolkit
- React Native Paper
- Axios

## 📱 Screens Implemented

1. **Login Screen** - Authentication
2. **Home Screen** - Dashboard
3. **Profile Screen** - User profile & logout

## 🔜 Next Phase

Phase 2: Enhanced Dashboard & Navigation
- Real-time statistics
- Quick actions
- Advanced navigation

---

**Version:** 1.0.0  
**Phase:** 1 of 10 Complete
