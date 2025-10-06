# Data Fetching Troubleshooting Guide

## Issue
Data is not fetching from the backend API.

## Quick Checklist

### 1. Backend Server Status
```bash
# Check if backend is running
cd L2L_EPR_BACK_V2
npm start
# Should be running on port 5002
```

### 2. Network Configuration

#### Current API Configuration
**File**: `src/config/api.js`
```javascript
export const API_BASE_URL = 'http://192.168.1.27:5002';
```

#### Update IP Address
Find your computer's local IP:

**Mac/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows**:
```bash
ipconfig
```

Look for IPv4 Address (e.g., 192.168.1.27)

#### Update api.js
```javascript
export const API_BASE_URL = 'http://YOUR_IP_HERE:5002';
```

### 3. Android Network Security

We've already configured HTTP traffic to be allowed:

**File**: `android/app/src/main/AndroidManifest.xml`
- Added `android:usesCleartextTraffic="true"`
- Added `android:networkSecurityConfig="@xml/network_security_config"`

**File**: `android/app/src/main/res/xml/network_security_config.xml`
- Allows cleartext traffic for local IPs

### 4. Same WiFi Network
Ensure both devices are on the same WiFi network:
- Computer running backend: Connected to WiFi
- Mobile device/emulator: Connected to same WiFi

### 5. Firewall Settings
Temporarily disable firewall on your computer to test:

**Mac**:
```bash
System Preferences > Security & Privacy > Firewall > Turn Off Firewall
```

**Windows**:
```bash
Control Panel > Windows Defender Firewall > Turn Windows Defender Firewall on or off
```

### 6. Test API Connection

Use the API Debug Screen we created:

**File**: `src/screens/debug/APIDebugScreen.js`

Add to navigation temporarily to test:
```javascript
// In DashboardNavigator.js
import APIDebugScreen from '../screens/debug/APIDebugScreen';

// Add to stack
<Stack.Screen name="APIDebug" component={APIDebugScreen} />
```

Navigate to it and run tests.

## Common Issues & Solutions

### Issue 1: "Network request failed"
**Cause**: Cannot reach backend server
**Solutions**:
- Check backend is running
- Verify IP address is correct
- Ensure same WiFi network
- Check firewall settings

### Issue 2: "Timeout"
**Cause**: Request taking too long
**Solutions**:
- Check backend server logs for errors
- Increase timeout in api.js (currently 30000ms)
- Check database connection

### Issue 3: "401 Unauthorized"
**Cause**: Authentication token expired or invalid
**Solutions**:
- Logout and login again
- Check token in AsyncStorage
- Verify backend JWT configuration

### Issue 4: "404 Not Found"
**Cause**: Endpoint doesn't exist
**Solutions**:
- Check API endpoint path
- Verify backend routes are registered
- Check for typos in URL

### Issue 5: Android Emulator Can't Connect
**Cause**: Emulator network configuration
**Solutions**:
- Use `10.0.2.2` instead of `localhost` for Android emulator
- Or use your computer's actual IP address
- Restart emulator after changing network config

## Testing Endpoints

### Test with cURL
```bash
# Test if backend is accessible
curl http://192.168.1.27:5002/api/master/projects

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://192.168.1.27:5002/api/master/projects
```

### Test with Browser
Open in browser:
```
http://192.168.1.27:5002/api/master/projects
```

Should return JSON data or authentication error.

## Backend Endpoints

All endpoints are prefixed with `/api/master/`

### Available Endpoints:
- `/projects` - Projects list
- `/customers` - Customers list
- `/co-applicants` - Co-applicants list
- `/brokers` - Brokers list
- `/plans` - Payment plans list
- `/units` - Units list
- `/banks` - Banks list
- `/stocks` - Stocks list

## Redux Store Debugging

### Check Redux State
Add to any screen:
```javascript
import { useSelector } from 'react-redux';

const MyScreen = () => {
  const state = useSelector(state => state);
  console.log('Redux State:', state);
  
  // Check specific slice
  const projects = useSelector(state => state.projects);
  console.log('Projects:', projects);
};
```

### Check Loading State
```javascript
const { list, loading, error } = useSelector(state => state.projects);

console.log('Loading:', loading);
console.log('Error:', error);
console.log('Data:', list);
```

## Network Logs

### Enable Network Logging
In `src/config/api.js`, add:
```javascript
// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    console.log('📦 Data:', config.data);
    // ... rest of code
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url);
    console.log('📦 Data:', response.data);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.config?.url);
    console.log('📦 Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

## Production Configuration

For production, use HTTPS:
```javascript
export const API_BASE_URL = 'https://your-domain.com';
```

And remove cleartext traffic permission from AndroidManifest.xml.

## Support

If issues persist:
1. Check backend logs for errors
2. Verify database connection
3. Test API with Postman/Insomnia
4. Check React Native debugger network tab
5. Review Redux DevTools (if configured)
