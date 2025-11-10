#!/bin/bash

# Script to start Cloudflare Tunnel for shareable link
# Usage: ./start-tunnel.sh

echo "🌐 Starting Cloudflare Tunnel..."
echo ""
echo "This will create a public shareable link for your app."
echo "Press Ctrl+C to stop the tunnel."
echo ""

# Kill any existing cloudflared processes
pkill -f cloudflared 2>/dev/null

# Start tunnel
npx --yes cloudflared tunnel --url http://localhost:3000

