# Twilio SMS Setup Guide

## ✅ Twilio Credentials Configured

Your Twilio credentials have been configured:

- **Account SID**: `YOUR_TWILIO_ACCOUNT_SID`
- **Auth Token**: `YOUR_TWILIO_AUTH_TOKEN`
- **API Key SID**: `YOUR_TWILIO_API_KEY_SID`
- **API Key Secret**: `YOUR_TWILIO_API_KEY_SECRET`

---

## 📋 Setup Instructions

### 1. Create `.env` File

Create a `.env` file in the project root with the following content:

```env
# Twilio Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER=+1234567890  # Replace with your Twilio phone number

# Enable real SMS
ENABLE_REAL_OTP=true

# Session Configuration
SESSION_SECRET=dev-secret-change-in-production

# Feature Flags
USE_DATABASE=false
ENABLE_RATE_LIMIT=true

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Get Your Twilio Phone Number

You need a Twilio phone number to send SMS. You have two options:

#### Option A: Use Twilio Trial Number (Free)
1. Log in to your Twilio Console: https://console.twilio.com/
2. Go to **Phone Numbers** → **Manage** → **Active numbers**
3. If you have a trial account, you'll see a trial number (e.g., +1 555-xxx-xxxx)
4. Copy this number and add it to `.env` as `TWILIO_FROM_NUMBER`

**Note**: Trial numbers can only send SMS to verified phone numbers. To verify:
- Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
- Add your phone number for testing

#### Option B: Purchase a Twilio Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Buy a number**
2. Select your country and area code
3. Purchase the number
4. Add it to `.env` as `TWILIO_FROM_NUMBER`

### 3. Update `.env` File

Add your Twilio phone number to the `.env` file:

```env
TWILIO_FROM_NUMBER=+1234567890  # Your Twilio phone number
```

**Important**: 
- Include the `+` and country code
- Format: `+[country code][number]`
- Example for US: `+15551234567`
- Example for India: `+919876543210`

---

## 🧪 Testing

### 1. Start the Server

```bash
npm run dev
```

### 2. Test OTP Request

```bash
curl -X POST http://localhost:3000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

**Note**: 
- For trial accounts, you can only send to verified numbers
- Phone number should be 10 digits (without country code for India)
- The system will automatically add `+91` for Indian numbers

### 3. Check Console

You should see:
```
✅ Twilio SMS sent to +919876543210 (SID: SMxxxxxxxxxxxxx)
```

### 4. Check Your Phone

You should receive an SMS with the OTP code.

---

## 🔧 Troubleshooting

### Error: "Invalid phone number format"
- Ensure phone numbers include country code
- Format: `+[country code][number]`
- For India: `+91` + 10-digit number

### Error: "Twilio phone number not configured"
- Set `TWILIO_FROM_NUMBER` in `.env`
- Ensure the number is active in your Twilio account

### Error: "Twilio authentication failed"
- Verify Account SID and Auth Token are correct
- Check that credentials are in `.env` file
- Restart the server after updating `.env`

### Trial Account Limitations
- Can only send to verified phone numbers
- Limited number of messages per day
- Upgrade to paid account for production use

---

## 🚀 Production Checklist

Before going to production:

- [ ] Upgrade Twilio account from trial to paid
- [ ] Purchase a dedicated phone number
- [ ] Set `TWILIO_FROM_NUMBER` in production `.env`
- [ ] Set strong `SESSION_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set `NODE_ENV=production`
- [ ] Enable `USE_DATABASE=true` (if using database)
- [ ] Test with real phone numbers
- [ ] Monitor Twilio usage and costs

---

## 📊 Twilio Console

Access your Twilio Console:
- **URL**: https://console.twilio.com/
- **Dashboard**: View usage, messages, and logs
- **Phone Numbers**: Manage your numbers
- **Logs**: View SMS delivery status

---

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Rotate credentials** - Change Auth Token periodically
3. **Use environment variables** - In production, use secure secret management
4. **Monitor usage** - Set up alerts for unusual activity

---

## ✅ Current Status

- ✅ Twilio package installed
- ✅ Twilio SMS service implemented
- ✅ Credentials configured (via `.env`)
- ✅ Error handling implemented
- ✅ Fallback to mock service if Twilio fails

**Next Step**: Create `.env` file with your Twilio phone number and test!

---

**Last Updated**: Twilio Integration Complete

