# Troubleshooting Mobile Access Issues

## Server Status ✅
Your servers are running and accessible on the network:
- Frontend: `http://192.168.1.130:3000` ✅
- Backend: `http://192.168.1.130:5002` ✅

## Common Issues & Solutions

### Issue 1: Can't Connect from Phone

**Symptoms:** Phone browser says "Can't connect to server" or times out

**Solutions:**

1. **Check Same WiFi Network**
   - Your phone and computer MUST be on the same WiFi network
   - Open WiFi settings on both devices and verify

2. **Try Different Browsers**
   - Chrome
   - Safari
   - Firefox
   
3. **Check Your Router Settings**
   - Some routers have "AP Isolation" or "Client Isolation" enabled
   - This prevents devices from talking to each other
   - Disable this feature in router settings

4. **Try Mobile Hotspot**
   - Create a hotspot from your phone
   - Connect your computer to the hotspot
   - Then access from phone

### Issue 2: Page Loads But Shows "Loading..." Forever

**Symptoms:** App loads but gets stuck on loading screen

**Possible Causes:**

1. **Firebase Not Configured**
   - Check if you have Firebase credentials in `.env` file
   - The app requires Firebase for authentication

2. **Backend API Not Accessible**
   - Open browser developer tools on phone (if possible)
   - Check for network errors
   - Verify backend is running

3. **CORS Issues**
   - Should be fixed, but check browser console for errors

### Issue 3: Can't Log In

**Symptoms:** Login page appears but authentication fails

**Solutions:**

1. **Check Firebase Configuration**
   ```bash
   # Verify Firebase credentials exist
   cat packages/frontend/.env.local
   ```

2. **Check Browser Console**
   - Most mobile browsers have remote debugging
   - Use Chrome DevTools remote debugging

### Issue 4: Server Shows "0.0.0.0" But Still Can't Connect

**Symptoms:** Server logs show listening on 0.0.0.0 but phone can't connect

**Solutions:**

1. **Firewall Blocking**
   ```bash
   # macOS - Allow Node.js through firewall
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
   ```

2. **Check Firewall Status**
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```

3. **Temporarily Disable Firewall**
   - Go to System Preferences > Security & Privacy > Firewall
   - Click "Turn Off Firewall" (for testing only!)

## Quick Diagnostic Commands

### Test on Your Computer
```bash
# Test frontend
curl http://192.168.1.130:3000

# Test backend
curl http://192.168.1.130:5002/health
```

Both should return content.

### Check Server Logs
```bash
# Frontend logs
# Check the terminal where you ran npm run dev

# Backend logs  
# Check the terminal where backend is running
```

### Test from Phone Browser

1. Open your phone browser
2. Go to: `http://192.168.1.130:3000`
3. If it doesn't load, try: `http://192.168.1.130:5002/health`
4. This will help isolate if it's frontend or backend issue

## Alternative: Use Your Phone's IP

If nothing works, you can also try accessing via your phone's IP:

```bash
# On Mac, find connected devices
arp -a | grep "192.168"

# Or use network scanner app on phone
```

## Still Not Working?

### Option 1: Use Tunnel Service (Quick Fix)
```bash
# Install ngrok
brew install ngrok

# Create tunnel to frontend
ngrok http 3000

# Use the HTTPS URL ngrok provides on your phone
```

### Option 2: Use USB Debugging
- Enable Developer Mode on your phone
- Connect via USB
- Use Chrome DevTools remote debugging
- This allows you to test while connected to localhost

### Option 3: Deploy to Testing Server
Deploy the app to a cloud service for testing:
- Vercel (for frontend)
- Heroku (for backend)
- Or any cloud platform

## Logs to Check

If app loads but features don't work, check these:

1. **Browser Console** (on phone or via remote debugging)
2. **Backend Terminal** (for API errors)
3. **Frontend Terminal** (for compilation errors)

## Your Current Setup

- ✅ Backend listening on 0.0.0.0:5002
- ✅ Frontend listening on 0.0.0.0:3000
- ✅ Servers accessible from network (tested)
- ✅ IP Address: 192.168.1.130

**Next Steps:**
1. Make sure phone is on same WiFi
2. Try accessing: http://192.168.1.130:3000
3. Check if firewall is blocking connections
4. Try ngrok if still having issues

