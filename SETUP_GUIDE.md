# 📱 L2L EPR Mobile App - Setup Guide

## ✅ Phase 1 Complete: Foundation & Authentication

### What's Been Implemented

#### 1.1 ✅ Expo/React Native Project Setup
- Expo project created with blank template
- All dependencies installed
- Project structure organized

#### 1.2 ✅ Navigation Setup (React Navigation)
- **AppNavigator**: Main navigation container with auth flow
- **DashboardNavigator**: Drawer navigation for main app
- **DashboardTabs**: Bottom tab navigation
- Auth-based navigation (Login → Dashboard)

#### 1.3 ✅ State Management (Redux Toolkit)
- Redux store configured
- Auth slice with login/logout/checkAuth actions
- Async thunks for API calls
- Error handling

#### 1.4 ✅ API Configuration (Axios)
- Axios instance with base URL
- Request interceptor for auth tokens
- Response interceptor for error handling
- AsyncStorage integration for token management

#### 1.5 ✅ Theme & Styling System
- React Native Paper theme configuration
- Light theme with brand colors
- Common styles and design system
- Consistent UI components

### Project Structure

```
L2L_EPR_MOBILE_FRONT_V2/
├── src/
│   ├── config/
│   │   ├── api.js              # Axios configuration
│   │   └── theme.js            # Theme & styling
│   ├── store/
│   │   ├── index.js            # Redux store
│   │   └── slices/
│   │       └── authSlice.js    # Auth state management
│   ├── navigation/
│   │   ├── AppNavigator.js     # Main navigation
│   │   └── DashboardNavigator.js # Dashboard navigation
│   └── screens/
│       ├── auth/
│       │   └── LoginScreen.js  # Login screen
│       └── dashboard/
│           ├── HomeScreen.js   # Home dashboard
│           └── ProfileScreen.js # User profile
├── App.js                      # Main app component
└── package.json
```

### Dependencies Installed

```json
{
  "dependencies": {
    "expo": "latest",
    "react": "latest",
    "react-native": "latest",
    "@react-navigation/native": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-navigation/drawer": "^6.x",
    "react-native-paper": "^5.x",
    "react-native-vector-icons": "^10.x",
    "react-native-screens": "^3.x",
    "react-native-safe-area-context": "^4.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "axios": "^1.x",
    "@react-native-async-storage/async-storage": "^1.x"
  }
}
```

## 🚀 How to Run

### Prerequisites
- Node.js installed
- Expo CLI installed: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS/Android)

### Steps

1. **Navigate to project directory:**
   ```bash
   cd L2L_EPR_MOBILE_FRONT_V2
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

3. **Run on device:**
   - Scan QR code with Expo Go app (Android)
   - Scan QR code with Camera app (iOS)
   
   Or press:
   - `a` for Android emulator
   - `i` for iOS simulator
   - `w` for web browser

### Backend Connection

**Important:** Update the API base URL in `src/config/api.js`:

```javascript
// For local development
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5002/api';

// Example:
// const API_BASE_URL = 'http://192.168.1.100:5002/api';
```

**Note:** Use your computer's local IP address, not `localhost`, when testing on a physical device.

To find your local IP:
- **Mac/Linux:** `ifconfig | grep "inet "`
- **Windows:** `ipconfig`

## 🔐 Login Credentials

Use the same credentials as the web app:
- **User ID:** ADMIN002
- **Password:** Admin@123

## 📱 Features Implemented

### Authentication
- ✅ Login screen with form validation
- ✅ Password visibility toggle
- ✅ Time-based greeting (Good Morning/Afternoon/Evening)
- ✅ Loading states
- ✅ Error handling
- ✅ Token management with AsyncStorage
- ✅ Auto-login on app restart
- ✅ Logout functionality

### Navigation
- ✅ Auth flow (Login → Dashboard)
- ✅ Bottom tab navigation (Home, Profile)
- ✅ Drawer navigation (side menu)
- ✅ Protected routes
- ✅ Navigation guards

### Dashboard
- ✅ Home screen with welcome message
- ✅ Quick stats cards (placeholder)
- ✅ Quick actions buttons (placeholder)
- ✅ Profile screen with user info
- ✅ Logout confirmation dialog

### State Management
- ✅ Redux store setup
- ✅ Auth state management
- ✅ Async actions for API calls
- ✅ Error state handling
- ✅ Loading states

### API Integration
- ✅ Axios configuration
- ✅ Auth token interceptor
- ✅ Error response handling
- ✅ Automatic token refresh handling

## 🎨 Design System

### Colors
- **Primary:** #EF4444 (Red-500)
- **Secondary:** #1F2937 (Gray-800)
- **Background:** #FFFFFF
- **Surface:** #F9FAFB
- **Text:** #111827
- **Text Secondary:** #6B7280

### Components
- Using React Native Paper components
- Consistent spacing and padding
- Material Design 3 theme
- Custom brand colors

## 📝 Next Steps (Phase 2)

The following modules are ready to be implemented:

### Phase 2: Dashboard & Navigation
- Enhanced dashboard with real data
- Statistics cards with API integration
- Recent activities list
- Property grid view
- Advanced navigation structure

### Phase 3: Master Data Modules
- Project management screens
- Property/Unit management
- Customer management
- Broker management
- Payment plans
- And more...

## 🔧 Configuration

### Update Backend URL

Edit `src/config/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:5002/api';
```

### Theme Customization

Edit `src/config/theme.js` to customize colors and styles.

### Navigation Structure

Edit `src/navigation/` files to add new screens and navigation flows.

## 🐛 Troubleshooting

### Cannot connect to backend
- Make sure backend is running on port 5002
- Use your computer's local IP, not localhost
- Check firewall settings
- Ensure both devices are on the same network

### Login not working
- Check backend URL in api.js
- Verify credentials
- Check backend logs for errors
- Ensure backend CORS allows mobile app

### App crashes on startup
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for console errors

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## ✅ Testing Checklist

- [ ] App starts without errors
- [ ] Login screen displays correctly
- [ ] Can login with valid credentials
- [ ] Error message shows for invalid credentials
- [ ] Dashboard loads after login
- [ ] Bottom tabs work correctly
- [ ] Profile screen shows user info
- [ ] Logout works and returns to login
- [ ] App remembers login on restart

## 🎉 Success!

Phase 1 is complete! The foundation is solid and ready for building more features.

**Next:** Start implementing Phase 2 modules (Dashboard enhancements and navigation).
