# 🔐 Session/Authentication Fix Guide

## Problem
After successful OTP verification, users are not staying logged in and are redirected back to auth page.

## Root Cause
This happens when:
1. **Supabase is not configured** - Sessions are stored in memory (MemStorage) which gets cleared on server restart
2. **Session cookie not being set/sent properly** - Cookie configuration issues
3. **Session not persisting** - Sessions are created but not saved to database

## Solution

### Step 1: Verify Supabase Configuration

Check Railway → Variables and ensure these are set:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key
- `SUPABASE_ANON_KEY` - Your anon key
- `USE_DATABASE=true`

**If Supabase is NOT configured:**
- Sessions are stored in memory only
- Sessions are lost when server restarts
- You MUST configure Supabase for production

### Step 2: Check Railway Logs

After deploying the updated code, check logs when you:
1. **Login (OTP verify):**
   - Look for: `[Auth] Session created for user...`
   - Look for: `[Auth] Session saved in req.session:`
   - This confirms session was created

2. **Check auth status:**
   - Look for: `[Auth Status] Checking auth status...`
   - Look for: `[Auth Status] Session token: ...`
   - Look for: `[Auth Status] Cookies received: yes/no`
   - This shows if cookie is being sent

### Step 3: Common Issues & Fixes

#### Issue 1: "Session not found in storage"
**Cause:** Supabase not configured or session not saved
**Fix:** 
- Configure Supabase properly
- Check `USE_DATABASE=true`
- Verify Supabase credentials are correct

#### Issue 2: "No session token found"
**Cause:** Cookie not being set or sent
**Fix:**
- Check browser DevTools → Application → Cookies
- Look for cookie: `arogya_vault_session`
- If missing, check Railway logs for cookie setting errors

#### Issue 3: "Cookies received: no"
**Cause:** Browser not sending cookies
**Fix:**
- Check browser DevTools → Network → Request Headers
- Should see `Cookie: arogya_vault_session=...`
- If missing, check `credentials: "include"` in frontend (already set)

### Step 4: Test Steps

1. **Clear browser cookies** for your Railway domain
2. **Login with OTP**
3. **Check browser DevTools:**
   - Application → Cookies → Your Railway domain
   - Should see `arogya_vault_session` cookie
4. **Check Railway logs:**
   - Should see session creation logs
   - Should see auth status check logs
5. **Try accessing /home directly**
   - Should stay logged in
   - Should NOT redirect to /auth

## Quick Fix Checklist

- [ ] Supabase URL is set in Railway
- [ ] Supabase Service Role Key is set
- [ ] Supabase Anon Key is set
- [ ] `USE_DATABASE=true` is set
- [ ] Deploy latest code (with logging)
- [ ] Clear browser cookies
- [ ] Test login flow
- [ ] Check Railway logs for session creation
- [ ] Check browser cookies for session cookie
- [ ] Test accessing /home directly

## If Still Not Working

1. **Share Railway logs** from:
   - OTP verification
   - Auth status check
2. **Check browser console** for errors
3. **Check Network tab** in DevTools:
   - Look at `/api/auth/otp/verify` response
   - Look at `/api/auth/status` request/response
   - Check if cookies are in request headers

## Expected Log Output

### On Login (OTP Verify):
```
[Auth] Session created for user abc123, token: 1a2b3c4d...
[Auth] Session cookie will be set: arogya_vault_session
[Auth] Session saved in req.session: { userId: 'abc123', token: '1a2b3c4d...' }
```

### On Auth Status Check:
```
[Auth Status] Checking auth status...
[Auth Status] Session ID: xyz789
[Auth Status] Session token: 1a2b3c4d...
[Auth Status] Session userId: abc123
[Auth Status] Cookies received: yes
[Auth Status] User authenticated: abc123
```

If you see different output, share it and we can diagnose further.

