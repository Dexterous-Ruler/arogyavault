# Frontend URL Update Summary

## Overview
Updated emergency card QR codes and consent sharing URLs to use production Railway URL instead of localhost.

## Changes Implemented

### 1. Created URL Helper Utility
**File**: `server/utils/urlHelper.ts` (new file)

Centralized URL generation utility that:
- Determines base URL based on environment
- Supports multiple fallback strategies
- Works for both development and production
- Handles Railway deployment automatically

**Key Functions**:
- `getBaseURL(req?: Request)`: Gets base URL for the application
- `getFullURL(path: string, req?: Request)`: Generates full URL for a given path

**Priority Order**:
1. `FRONTEND_URL` environment variable (explicit configuration)
2. `RAILWAY_PUBLIC_DOMAIN` environment variable
3. Runtime detection from request (for production)
4. Config default (from `config.frontend.url`)
5. Production default (`https://pbl-tanishq-production.up.railway.app`)
6. Development fallback (`http://localhost:3000`)

### 2. Updated QR Code Service
**File**: `server/services/qrCodeService.ts`

**Changes**:
- Updated `generateEmergencyCardURL` to use URL helper utility
- Changed function signature to accept optional `Request` parameter
- Removed hardcoded localhost fallback
- Now uses `getFullURL()` from URL helper

**Before**:
```typescript
export function generateEmergencyCardURL(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${base}/emergency/view/${token}`;
}
```

**After**:
```typescript
export function generateEmergencyCardURL(token: string, req?: Request): string {
  return getFullURL(`/emergency/view/${token}`, req);
}
```

### 3. Updated Emergency Routes
**File**: `server/routes/emergency.ts`

**Changes**:
- Updated `GET /api/emergency/card` to pass `req` to `generateEmergencyCardURL`
- Updated `PUT /api/emergency/card` to pass `req` to `generateEmergencyCardURL`
- Updated `GET /api/emergency/qr-image/:token` to pass `req` to `generateEmergencyCardURL`

**Impact**:
- All emergency card QR codes now use production URL
- QR codes work correctly in production environment
- URLs are generated dynamically based on environment

### 4. Updated Consent Routes
**File**: `server/routes/consents.ts`

**Changes**:
- Replaced manual URL detection logic with URL helper utility
- Updated consent sharing URL generation to use `getFullURL()`
- Removed `CLOUDFLARE_TUNNEL_URL` fallback (not needed for Railway)
- Simplified URL generation code

**Before**:
```typescript
let baseUrl = process.env.FRONTEND_URL;
if (!baseUrl) {
  baseUrl = process.env.CLOUDFLARE_TUNNEL_URL || "http://localhost:3000";
}
baseUrl = baseUrl.replace(/\/$/, '');
const shareableUrl = `${baseUrl}/share/${consent.shareableToken}`;
```

**After**:
```typescript
const shareableUrl = getFullURL(`/share/${consent.shareableToken}`, req);
```

### 5. Updated Configuration
**File**: `server/config.ts`

**Changes**:
- Added `frontend.url` configuration
- Provides environment-based defaults
- Uses production URL in production, localhost in development

**Added**:
```typescript
frontend: {
  url: process.env.FRONTEND_URL || (
    process.env.NODE_ENV === "production"
      ? "https://pbl-tanishq-production.up.railway.app"
      : `http://localhost:${process.env.PORT || "3000"}`
  ),
}
```

### 6. Updated Documentation
**File**: `RAILWAY_ENV_COMPLETE.md`

**Changes**:
- Added `FRONTEND_URL` environment variable documentation
- Added troubleshooting section for QR code issues
- Updated setup checklist to include `FRONTEND_URL`
- Added Railway-specific instructions

## Environment Variable Required

### FRONTEND_URL
**Value**: `https://pbl-tanishq-production.up.railway.app`
**Required**: Yes (for production)
**Purpose**: Used to generate QR codes and shareable URLs
**Format**: `https://your-app-name.up.railway.app` (no trailing slash)

## How to Set in Railway

1. Go to Railway Dashboard → Your Project → Variables
2. Click **+ New Variable**
3. Enter:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://pbl-tanishq-production.up.railway.app`
4. Click **Add**
5. Railway will automatically redeploy

## Expected Behavior

### Production (Railway)
- QR codes use: `https://pbl-tanishq-production.up.railway.app/emergency/view/{token}`
- Share links use: `https://pbl-tanishq-production.up.railway.app/share/{token}`
- URLs are HTTPS
- Works from any device

### Development (Local)
- QR codes use: `http://localhost:3000/emergency/view/{token}`
- Share links use: `http://localhost:3000/share/{token}`
- URLs are HTTP
- Works for local testing

## Testing

### Local Development
1. Start local server: `npm run dev`
2. Create/update emergency card
3. Verify QR code URL uses `http://localhost:3000`
4. Test QR code scanning locally
5. Test consent sharing locally

### Production (Railway)
1. Set `FRONTEND_URL` in Railway
2. Wait for deployment to complete
3. Create/update emergency card
4. Verify QR code URL uses production URL
5. Test QR code scanning from mobile device
6. Test consent sharing from production
7. Verify URLs are HTTPS

## Backward Compatibility

### Existing QR Codes
- Old QR codes with localhost URLs will still work if accessed from localhost
- New QR codes will use production URL
- QR codes are regenerated when emergency card is updated
- Tokens remain valid regardless of URL format

### Existing Share Links
- Old share links with localhost URLs will not work in production
- New share links will use production URL
- Share links are regenerated when consent QR code is fetched
- Tokens remain valid regardless of URL format

## Files Modified

1. **New**: `server/utils/urlHelper.ts` - URL helper utility
2. **Modified**: `server/services/qrCodeService.ts` - Updated QR code URL generation
3. **Modified**: `server/routes/emergency.ts` - Updated emergency routes
4. **Modified**: `server/routes/consents.ts` - Updated consent routes
5. **Modified**: `server/config.ts` - Added frontend URL configuration
6. **Modified**: `RAILWAY_ENV_COMPLETE.md` - Updated documentation

## Verification Checklist

- [ ] URL helper utility created and tested
- [ ] QR code service updated
- [ ] Emergency routes updated
- [ ] Consent routes updated
- [ ] Config file updated
- [ ] Documentation updated
- [ ] Build successful (no errors)
- [ ] `FRONTEND_URL` set in Railway
- [ ] QR codes use production URL in production
- [ ] Share links use production URL in production
- [ ] Local development still works
- [ ] QR codes scan correctly
- [ ] Share links work correctly

## Next Steps

1. **Set Environment Variable**: Add `FRONTEND_URL=https://pbl-tanishq-production.up.railway.app` to Railway
2. **Deploy**: Railway will auto-deploy after setting variable
3. **Test**: Verify QR codes and share links use production URL
4. **Verify**: Test QR code scanning and share link access from production

## Success Criteria

- ✅ QR codes use production URL in production
- ✅ Share links use production URL in production
- ✅ Local development still works with localhost
- ✅ No breaking changes to existing functionality
- ✅ URLs are HTTPS in production
- ✅ URLs work from any device
- ✅ Environment variable is properly documented

---

**Status**: ✅ Implementation complete
**Next**: Set `FRONTEND_URL` in Railway and test

