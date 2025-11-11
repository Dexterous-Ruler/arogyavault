# 🚂 Railway Environment Variables Setup

Your app is deployed and running! Now you need to add environment variables to enable all features.

## ✅ Current Status

Your app is running on Railway, but these features need configuration:

- ⚠️ Supabase Storage (database) - **REQUIRED**
- ⚠️ Email Service (SMTP) - **Recommended**
- ⚠️ Session Storage (MemoryStore warning) - **Will be fixed with Supabase**
- ℹ️ Push Notifications (VAPID) - Optional
- ℹ️ OpenAI API - Optional

---

## 🔐 Step-by-Step: Add Environment Variables in Railway

### 1. Open Railway Dashboard

1. Go to https://railway.app
2. Click on your project
3. Click on your service
4. Click **"Variables"** tab

### 2. Add Essential Variables (REQUIRED)

Click **"+ New Variable"** for each:

#### A. Supabase Configuration (REQUIRED for database)

```
SUPABASE_URL
```
**Value:** Your Supabase project URL
- Go to https://supabase.com/dashboard
- Select your project
- Settings → API
- Copy **Project URL**

```
SUPABASE_SERVICE_ROLE_KEY
```
**Value:** Your Supabase service role key
- Same page (Settings → API)
- Copy **service_role** key (secret key)
- ⚠️ This is sensitive - keep it secret!

```
SUPABASE_ANON_KEY
```
**Value:** Your Supabase anon key
- Same page
- Copy **anon public** key

```
USE_DATABASE
```
**Value:** `true`

#### B. Session Configuration (REQUIRED)

```
SESSION_SECRET
```
**Value:** Generate a random secret
- Run locally: `openssl rand -base64 32`
- Or use: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new
- Copy the generated string

```
NODE_ENV
```
**Value:** `production`

---

### 3. Add Email Configuration (RECOMMENDED)

#### Option A: Using Resend SMTP (Recommended)

```
EMAIL_PROVIDER
```
**Value:** `smtp`

```
SMTP_HOST
```
**Value:** `smtp.resend.com`

```
SMTP_PORT
```
**Value:** `465`

```
SMTP_SECURE
```
**Value:** `true`

```
SMTP_USERNAME
```
**Value:** `resend`

```
SMTP_PASSWORD
```
**Value:** Your Resend API key
- Get from: https://resend.com/api-keys
- Create an API key if you don't have one

```
EMAIL_FROM
```
**Value:** `team@arogyavault.me` (or your verified email)

```
EMAIL_FROM_NAME
```
**Value:** `Arogya Vault`

---

### 4. Add Optional Variables

#### Push Notifications (Optional)

```
VAPID_PUBLIC_KEY
```
**Value:** Your VAPID public key
- Generate locally: `npx tsx server/scripts/generateVAPIDKeys.ts`
- Copy the public key

```
VAPID_PRIVATE_KEY
```
**Value:** Your VAPID private key
- From same generation
- Copy the private key

```
VAPID_SUBJECT
```
**Value:** `mailto:team@arogyavault.me`

#### OpenAI (Optional - for AI features)

```
OPENAI_API_KEY
```
**Value:** Your OpenAI API key
- Get from: https://platform.openai.com/api-keys

#### SMS/Twilio (Optional - for real SMS OTP)

```
SMS_PROVIDER
```
**Value:** `twilio` (or `mock` to disable)

```
TWILIO_ACCOUNT_SID
```
**Value:** Your Twilio Account SID

```
TWILIO_AUTH_TOKEN
```
**Value:** Your Twilio Auth Token

```
TWILIO_FROM_NUMBER
```
**Value:** Your Twilio phone number (e.g., `+1234567890`)

```
ENABLE_REAL_OTP
```
**Value:** `true` (to enable real SMS)

---

## 📋 Complete Variable Checklist

### Required (App won't work properly without these):
- [ ] `NODE_ENV=production`
- [ ] `SESSION_SECRET=<generated-secret>`
- [ ] `USE_DATABASE=true`
- [ ] `SUPABASE_URL=<your-supabase-url>`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
- [ ] `SUPABASE_ANON_KEY=<your-anon-key>`

### Recommended (For full functionality):
- [ ] `EMAIL_PROVIDER=smtp`
- [ ] `SMTP_HOST=smtp.resend.com`
- [ ] `SMTP_PORT=465`
- [ ] `SMTP_SECURE=true`
- [ ] `SMTP_USERNAME=resend`
- [ ] `SMTP_PASSWORD=<your-resend-api-key>`
- [ ] `EMAIL_FROM=team@arogyavault.me`
- [ ] `EMAIL_FROM_NAME=Arogya Vault`

### Optional (Nice to have):
- [ ] `VAPID_PUBLIC_KEY=<your-vapid-public-key>`
- [ ] `VAPID_PRIVATE_KEY=<your-vapid-private-key>`
- [ ] `VAPID_SUBJECT=mailto:team@arogyavault.me`
- [ ] `OPENAI_API_KEY=<your-openai-key>`
- [ ] `TWILIO_ACCOUNT_SID=<your-twilio-sid>`
- [ ] `TWILIO_AUTH_TOKEN=<your-twilio-token>`
- [ ] `TWILIO_FROM_NUMBER=<your-twilio-number>`
- [ ] `ENABLE_REAL_OTP=true`

---

## 🔄 After Adding Variables

1. **Redeploy:** Railway will automatically redeploy when you add variables
2. **Check Logs:** Go to **Deployments** → Latest → **View Logs**
3. **Verify:** Warnings should disappear once variables are set

---

## 🐛 Troubleshooting

### "MemoryStore warning"
- **Fix:** Add `USE_DATABASE=true` and Supabase variables
- This enables database-backed sessions instead of memory

### "Supabase Storage will be disabled"
- **Fix:** Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify keys are correct (no extra spaces)

### "SMTP_PASSWORD not set"
- **Fix:** Add `SMTP_PASSWORD` with your Resend API key
- Or use `EMAIL_PROVIDER=mock` for development

### Variables not working?
- Check for typos (case-sensitive)
- Remove extra spaces
- Redeploy after adding variables
- Check logs for specific errors

---

## 🎉 Success Indicators

When everything is configured correctly, you should see in logs:

```
✅ Supabase Storage initialized
✅ Email service configured (SMTP)
✅ Session store: Database (not MemoryStore)
✅ Push notifications configured (if added)
```

---

## 📚 Quick Links

- **Railway Dashboard:** https://railway.app
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Resend API Keys:** https://resend.com/api-keys
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Twilio Console:** https://console.twilio.com

---

**Your app URL:** Check Railway → Settings → Networking → Your domain

