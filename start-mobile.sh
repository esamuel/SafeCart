#!/bin/bash

# SafeCart Mobile Development Startup Script

# Get local IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$IP" ]; then
  echo "❌ Could not determine local IP address"
  exit 1
fi

echo "================================================"
echo "🚀 SafeCart Mobile Development"
echo "================================================"
echo ""
echo "📱 Access from your phone:"
echo "   Frontend: http://$IP:3000"
echo "   Backend:  http://$IP:5002"
echo ""
echo "🖥️  Access from your computer:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5002"
echo ""
echo "⚠️  Make sure your phone is on the same WiFi network!"
echo ""
echo "================================================"
echo "Starting servers..."
echo "================================================"
echo ""

# Start backend and frontend in the background
(cd packages/backend && npm run dev) &
BACKEND_PID=$!

(cd packages/frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait

