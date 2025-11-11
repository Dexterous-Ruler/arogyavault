# 🚀 Complete Railway Environment Variables Guide

## Required Environment Variables for Session Fix

### 1. Database Configuration (CRITICAL for Sessions)

```
DATABASE_URL
```
**Value**: Your Supabase PostgreSQL connection string
- Go to: https://supabase.com/dashboard
- Select your project
- Settings → Database
- Scroll down to **Connection string**
- Select **URI** tab
- Copy the connection string
- **Format**: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
- ⚠️ **IMPORTANT**: Use the **Transaction Pooler** connection string (port 6543)
- ⚠️ This contains your database password - keep it secret!

```
USE_DATABASE
```
**Value**: `true` (exactly as shown, as a string)
- Must be exactly `true` (not `True` or `TRUE`)
- This enables PostgreSQL session storage
- Without this, sessions will use MemoryStore (not persistent)

### 2. Session Configuration

```
SESSION_SECRET
```
**Value**: Generate a random secret (at least 32 characters)
- Generate locally: `openssl rand -base64 32`
- Or use: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new
- ⚠️ **CRITICAL**: This must be a strong, random secret
- ⚠️ Changing this will invalidate all existing sessions

```
NODE_ENV
```
**Value**: `production`
- Must be exactly `production` (lowercase)
- This enables:
  - Secure cookies (HTTPS only)
  - Production optimizations
  - Proper protocol detection

### 3. Supabase Configuration

```
SUPABASE_URL
```
**Value**: Your Supabase project URL
- Go to: https://supabase.com/dashboard
- Select your project
- Settings → API
- Copy **Project URL**

```
SUPABASE_SERVICE_ROLE_KEY
```
**Value**: Your Supabase service role key
- Same page (Settings → API)
- Copy **service_role** key (secret key)
- ⚠️ This is sensitive - keep it secret!
- Used for server-side operations

```
SUPABASE_ANON_KEY
```
**Value**: Your Supabase anon key
- Same page (Settings → API)
- Copy **anon public** key
- Used for client-side operations

### 4. Railway-Specific Configuration

```
PORT
```
**Value**: `3000` (or leave Railway to set it automatically)
- Railway automatically sets this
- You can set it explicitly if needed
- Default: `3000`

```
FRONTEND_URL
```
**Value**: `https://pbl-tanishq-production.up.railway.app` (your Railway public URL)
- **CRITICAL**: Required for emergency card QR codes and consent sharing
- Used to generate shareable URLs and QR codes
- Must be your production Railway URL
- **Format**: `https://your-app-name.up.railway.app` (no trailing slash)
- If not set, defaults to production URL or localhost (development)
- **Important**: This ensures QR codes and share links work in production

```
TRUST_PROXY
```
**Value**: `true` (optional, defaults to true in production)
- Trusts Railway's proxy for secure cookies
- Defaults to `true` if not set in production
- Only set to `false` if you have issues

### 5. SMS Configuration (If using Twilio)

```
TWILIO_ACCOUNT_SID
```
**Value**: Your Twilio Account SID
- Get from: https://console.twilio.com/

```
TWILIO_AUTH_TOKEN
```
**Value**: Your Twilio Auth Token
- Get from: https://console.twilio.com/
- ⚠️ Keep it secret!

```
TWILIO_PHONE_NUMBER
```
**Value**: Your Twilio phone number (E.164 format)
- Format: `+1234567890`
- Get from: https://console.twilio.com/phone-numbers

```
SMS_PROVIDER
```
**Value**: `twilio`
- Use `twilio` for real SMS
- Use `mock` for testing (no real SMS sent)

```
ENABLE_REAL_OTP
```
**Value**: `true`
- Set to `true` to enable real SMS
- Set to `false` for testing (mock SMS)

### 6. Email Configuration (If using Resend)

```
RESEND_API_KEY
```
**Value**: Your Resend API key
- Get from: https://resend.com/api-keys
- ⚠️ Keep it secret!

```
SMTP_FROM
```
**Value**: Your email address (verified in Resend)
- Format: `noreply@yourdomain.com`
- Must be verified in Resend dashboard

### 7. OpenAI Configuration (If using AI features)

```
OPENAI_API_KEY
```
**Value**: Your OpenAI API key
- Get from: https://platform.openai.com/api-keys
- ⚠️ Keep it secret!

## Quick Setup Checklist

### Step 1: Set Database Variables (CRITICAL)
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `USE_DATABASE=true` - Enable database storage

### Step 2: Set Session Variables (CRITICAL)
- [ ] `SESSION_SECRET` - Random secret (32+ characters)
- [ ] `NODE_ENV=production` - Production mode

### Step 3: Set Supabase Variables (REQUIRED)
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- [ ] `SUPABASE_ANON_KEY` - Anon key

### Step 4: Set Railway Variables (Optional but Recommended)
- [ ] `FRONTEND_URL=https://pbl-tanishq-production.up.railway.app` - Frontend URL (REQUIRED for QR codes and sharing)
- [ ] `PORT=3000` - Port (Railway sets this automatically)
- [ ] `TRUST_PROXY=true` - Trust proxy (defaults to true)

### Step 5: Set SMS Variables (If using Twilio)
- [ ] `TWILIO_ACCOUNT_SID` - Twilio Account SID
- [ ] `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- [ ] `TWILIO_PHONE_NUMBER` - Twilio phone number
- [ ] `SMS_PROVIDER=twilio` - Use Twilio
- [ ] `ENABLE_REAL_OTP=true` - Enable real SMS

### Step 6: Set Email Variables (If using Resend)
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `SMTP_FROM` - Verified email address

### Step 7: Set OpenAI Variables (If using AI)
- [ ] `OPENAI_API_KEY` - OpenAI API key

## How to Set Variables in Railway

1. Go to: https://railway.app/dashboard
2. Select your project
3. Click on your service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Enter variable name and value
7. Click **Add**
8. Repeat for all variables
9. Railway will automatically redeploy

## Verification

After setting variables, check Railway logs for:

### ✅ Success Indicators:
```
✅ Using PostgreSQL session store (Supabase) - Sessions will persist across restarts
✅ PostgreSQL session store connection verified
[Protocol Debug] X-Forwarded-Proto: https
[Cookie Debug] Set-Cookie: present
[Cookie Debug] Cookie flags: Secure=true, HttpOnly=true, SameSite=Lax
```

### ❌ Failure Indicators:
```
⚠️ WARNING: DATABASE_URL not set - Using MemoryStore for sessions
⚠️ WARNING: USE_DATABASE is not 'true' - Using MemoryStore for sessions
[Protocol Debug] X-Forwarded-Proto: not set
[Cookie Debug] Set-Cookie: missing
```

## Important Notes

1. **DATABASE_URL is CRITICAL**: Without it, sessions won't persist across restarts
2. **USE_DATABASE must be 'true'**: Must be exactly the string `true`, not a boolean
3. **SESSION_SECRET must be strong**: Use a random 32+ character string
4. **NODE_ENV must be 'production'**: This enables secure cookies
5. **FRONTEND_URL is REQUIRED**: Without it, QR codes and share links will use localhost (broken in production)
6. **All sensitive keys must be kept secret**: Never commit them to Git

## Troubleshooting

### Issue: "DATABASE_URL not set"
**Solution**: Add `DATABASE_URL` environment variable in Railway

### Issue: "USE_DATABASE is not 'true'"
**Solution**: Set `USE_DATABASE=true` (exactly as shown)

### Issue: "Set-Cookie: missing"
**Solution**: 
1. Check `NODE_ENV=production`
2. Check `TRUST_PROXY=true` (or leave unset, defaults to true)
3. Check Railway logs for protocol detection

### Issue: "Cookies received: no"
**Solution**:
1. Check browser DevTools → Application → Cookies
2. Verify cookie domain matches Railway domain
3. Check if cookie is blocked by browser

---

**Status**: ✅ Complete guide ready
**Next**: Set all variables in Railway and verify in logs

