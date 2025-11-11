# 📱 Enable Real SMS on Railway

## Current Issue

Your app is currently using **Mock SMS** mode, which means:
- ✅ OTP is generated correctly
- ✅ OTP is logged to Railway logs (not sent as SMS)
- ❌ No actual SMS is sent to your phone

## Why This Happens

In your Railway environment variables, you have:
- `SMS_PROVIDER=mock` ← This uses mock SMS
- `ENABLE_REAL_OTP=false` ← This disables real SMS

## Solution: Enable Real SMS with Twilio

### Step 1: Get Twilio Account (Free Trial Available)

1. **Sign up for Twilio** (if you don't have an account):
   - Go to: https://www.twilio.com/try-twilio
   - Create a free trial account (includes $15 credit)

2. **Get Your Twilio Credentials**:
   - Go to: https://console.twilio.com/
   - Dashboard → **Account Info**
   - Copy:
     - **Account SID**
     - **Auth Token**

3. **Get a Phone Number**:
   - Go to: **Phone Numbers** → **Manage** → **Buy a number**
   - Or use your trial number (if available)
   - Copy the phone number (format: `+1234567890`)

### Step 2: Update Railway Environment Variables

Go to Railway → Your Service → **Variables** tab and update these:

#### Change These Variables:

```
SMS_PROVIDER=twilio
```
(Change from `mock` to `twilio`)

```
ENABLE_REAL_OTP=true
```
(Change from `false` to `true`)

#### Add/Update These Variables:

```
TWILIO_ACCOUNT_SID=<YOUR-ACTUAL-TWILIO-ACCOUNT-SID>
```
(Replace with your actual Account SID from Twilio)

```
TWILIO_AUTH_TOKEN=<YOUR-ACTUAL-TWILIO-AUTH-TOKEN>
```
(Replace with your actual Auth Token from Twilio)

```
TWILIO_FROM_NUMBER=<YOUR-TWILIO-PHONE-NUMBER>
```
(Replace with your Twilio phone number, e.g., `+1234567890`)

### Step 3: Verify Configuration

After updating variables, Railway will automatically redeploy. Check the logs to see:

```
✅ Twilio SMS service created successfully!
```

Instead of:
```
Provider: mock
```

### Step 4: Test SMS

1. Try requesting an OTP on your website
2. Check Railway logs for:
   - `✅ Twilio SMS sent to +91XXXXXXXXXX (SID: SM...)`
3. You should receive SMS on your phone

## Complete Updated Environment Variables

Here's what your SMS-related variables should look like:

```
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
ENABLE_REAL_OTP=true
```

## Troubleshooting

### "Invalid phone number format"
- Make sure phone numbers include country code (e.g., `+91` for India)
- Format: `+91XXXXXXXXXX` (11 digits total with country code)

### "Permission denied" or "Phone number not verified"
- Twilio trial accounts can only send to verified numbers
- Go to Twilio Console → **Phone Numbers** → **Verified Caller IDs**
- Add your phone number for testing

### "Twilio authentication failed"
- Double-check your Account SID and Auth Token
- Make sure there are no extra spaces
- Regenerate Auth Token if needed

### Still not working?
1. Check Railway logs for specific error messages
2. Verify all Twilio variables are set correctly
3. Make sure `ENABLE_REAL_OTP=true` (not `false`)
4. Make sure `SMS_PROVIDER=twilio` (not `mock`)

## Alternative: Use Email OTP Instead

If you don't want to set up Twilio, you can use **Email OTP** instead:
- Your app already supports email OTP
- Just use the email login option on your website
- Email is already configured with Resend

## Cost

- **Twilio Trial**: Free $15 credit (good for ~1000 SMS)
- **Twilio Paid**: ~$0.0075 per SMS (very cheap)
- **Email**: Free with Resend (100 emails/day free tier)

---

**Need help?** Check Railway logs for specific error messages and share them.

