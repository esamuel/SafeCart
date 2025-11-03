# Mobile Testing Guide

This guide will help you test SafeCart on your smartphone while in development.

## Prerequisites

1. Both your computer and phone must be on the **same WiFi network**
2. Make sure your firewall allows incoming connections on ports 3000 (Next.js) and 5002 (Backend)

## Setup Steps

### 1. Find Your Computer's IP Address

**On macOS/Linux:**
```bash
# Get your local IP address
ipconfig getifaddr en0  # or en1, depending on your network interface
# OR
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for IPv4 Address under your active network adapter
```

Example: `192.168.1.100`

### 2. Start the Backend Server

```bash
cd packages/backend
npm run dev
```

The backend will now be accessible at:
- `http://localhost:5002` (from your computer)
- `http://YOUR_IP:5002` (from your phone, e.g., `http://192.168.1.100:5002`)

### 3. Update Environment Variable (if needed)

If you need to hardcode the API URL for mobile testing, create a `.env.local` file in `packages/frontend/`:

```env
NEXT_PUBLIC_API_URL=http://YOUR_IP:5002/api
```

Replace `YOUR_IP` with your computer's IP address.

### 4. Start the Frontend Server

```bash
cd packages/frontend
npm run dev
```

The frontend will now be accessible at:
- `http://localhost:3000` (from your computer)
- `http://YOUR_IP:3000` (from your phone, e.g., `http://192.168.1.100:3000`)

### 5. Access on Your Phone

Open your phone's browser and navigate to:
```
http://YOUR_IP:3000
```

**Important:** Make sure you're using **HTTP**, not HTTPS, during development.

## Troubleshooting

### Can't Connect from Phone

1. **Check Same Network**: Ensure both devices are on the same WiFi network
2. **Check Firewall**: Your computer's firewall might be blocking the ports
   - **macOS**: Go to System Preferences > Security & Privacy > Firewall
   - Allow incoming connections for Node/Next.js
3. **Try Different Network**: Some guest WiFi networks block device-to-device communication

### API Requests Failing

1. **Check Backend**: Make sure the backend is running and accessible
   - Try: `curl http://YOUR_IP:5002/health`
2. **Check CORS**: The backend has CORS enabled for all origins (`*`), but verify in `packages/backend/src/index.js`
3. **Check API URL**: Verify the frontend is using the correct API URL

### Camera Not Working

On mobile, the camera requires HTTPS. For development:
- Use Chrome DevTools device emulation for camera testing
- Or use ngrok/tunneling service to create an HTTPS connection

## Quick Start Command

To quickly test with mobile:

```bash
# In separate terminals:

# Terminal 1 - Backend
cd packages/backend && npm run dev

# Terminal 2 - Frontend
cd packages/frontend && npm run dev
```

Then open on your phone: `http://YOUR_IP:3000`

## Production Deployment

For production deployment on mobile, you'll need:
1. A proper HTTPS certificate
2. Deploy to a hosting service (Vercel, Netlify, etc.)
3. Update Firebase configuration with production URLs

