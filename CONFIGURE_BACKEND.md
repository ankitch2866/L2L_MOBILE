# ⚙️ Configure Backend Connection

## 🎯 Quick Setup (2 Steps)

### Step 1: Find Your Computer's IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for something like: `192.168.1.100` or `10.0.0.5`

### Step 2: Update API Configuration

Edit: **`src/config/api.js`**

Change line 5:
```javascript
const API_BASE_URL = 'http://localhost:5002/api';
```

To:
```javascript
const API_BASE_URL = 'http://YOUR_IP_HERE:5002/api';
```

**Example:**
```javascript
const API_BASE_URL = 'http://192.168.1.100:5002/api';
```

## ✅ That's It!

Save the file and the app will reload automatically.

## 🧪 Test Connection

1. **Test in mobile browser:**
   - Open browser on your phone
   - Go to: `http://YOUR_IP:5002/health`
   - Should see JSON response

2. **Test login in app:**
   - User ID: ADMIN002
   - Password: Admin@123

## ⚠️ Common Issues

### "Network Error" or "Cannot connect"

**Check:**
- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Used correct IP (not localhost)
- [ ] Both devices on same WiFi
- [ ] Firewall not blocking port 5002

### "Connection Refused"

**Fix:**
```bash
# Make sure backend is running
cd L2L_EPR_BACK_V2
npm run dev

# Should see: "Local URL: http://localhost:5002"
```

### "Timeout"

**Check:**
- Network connection
- Backend logs for errors
- Try restarting backend

## 📱 Quick Test

After updating the IP, try this in the app:
1. Open app
2. Enter credentials
3. Tap Submit
4. Should navigate to dashboard

If you see "Invalid credentials" instead of "Network error", the connection works! ✅

## 🔄 Need to Change IP?

If your IP changes (different WiFi, etc.):
1. Find new IP address
2. Update `src/config/api.js`
3. Save and reload app

## 💡 Pro Tip

Add your IP as a comment for easy reference:
```javascript
// My computer IP: 192.168.1.100
const API_BASE_URL = 'http://192.168.1.100:5002/api';
```

---

**Next:** Test login and explore the app! 🚀
