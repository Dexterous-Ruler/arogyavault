# 🌐 Shareable Link for Arogya Vault

## Public Shareable Link (Works Anywhere)

### Current Active Link:
**https://engine-provide-mariah-dodge.trycloudflare.com**

This link works from:
- ✅ Your mobile phone (any network)
- ✅ Any device (tablets, laptops, etc.)
- ✅ Any location (not just same WiFi)
- ✅ Can be shared with anyone

---

## How to Access

### On Mobile:
1. Open your mobile browser (Chrome, Safari, etc.)
2. Enter the URL: `https://engine-provide-mariah-dodge.trycloudflare.com`
3. The app will load and work just like on desktop!

### Share with Others:
Simply send them the link: `https://engine-provide-mariah-dodge.trycloudflare.com`

---

## Local Network Access (Same WiFi Only)

If you're on the same WiFi network, you can also use:
- **http://192.168.1.47:3000**

This only works when:
- Your mobile is on the same WiFi network
- Your computer is running the server

---

## Managing the Tunnel

### Start Tunnel:
```bash
./start-tunnel.sh
```

Or manually:
```bash
npx --yes cloudflared tunnel --url http://localhost:3000
```

### Stop Tunnel:
Press `Ctrl+C` in the terminal where tunnel is running, or:
```bash
pkill -f cloudflared
```

### Get New Link:
Each time you start the tunnel, you'll get a new random URL. The URL will be displayed in the terminal output.

---

## Important Notes

⚠️ **Tunnel Limitations:**
- Free Cloudflare tunnels are for testing/development
- No uptime guarantee
- URL changes each time you restart (unless you use a named tunnel)
- Subject to Cloudflare's terms of use

💡 **For Production:**
- Consider using a named Cloudflare tunnel
- Or deploy to a hosting service (Vercel, Railway, etc.)
- Or use ngrok with a paid plan for custom domains

---

## Troubleshooting

### Link Not Working?
1. Make sure the server is running: `npm run dev`
2. Make sure the tunnel is running: Check with `ps aux | grep cloudflared`
3. Restart the tunnel: `./start-tunnel.sh`

### Server Not Accessible?
1. Check if server is running on port 3000
2. Verify firewall settings
3. Try restarting the server

---

## Quick Commands

```bash
# Start server
npm run dev

# Start tunnel (in another terminal)
./start-tunnel.sh

# Check if tunnel is running
ps aux | grep cloudflared

# Stop tunnel
pkill -f cloudflared
```

---

*Last Updated: $(date)*

