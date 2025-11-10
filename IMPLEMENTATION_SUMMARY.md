# Backend Implementation - Quick Reference

## 🎯 Goal
Implement real-time OTP verification and backend features without breaking existing code.

## 📊 Implementation Phases

### Phase 1: Foundation (Week 1)
**Files to Create/Modify:**
- `shared/schema.ts` - Add `otpSessions`, `sessions` tables
- `server/storage.ts` - Extend `IStorage` interface
- `server/config.ts` - NEW: Configuration file
- `.env.example` - NEW: Environment variables template

**Key Changes:**
- Database schema expansion
- Storage interface expansion
- Configuration management

---

### Phase 2: OTP Service (Week 1-2)
**Files to Create:**
- `server/services/otpService.ts` - OTP generation & verification
- `server/services/smsService.ts` - SMS abstraction (mock/Twilio)
- `server/routes/auth.ts` - API endpoints for OTP

**API Endpoints:**
```
POST /api/auth/otp/request   - Request OTP
POST /api/auth/otp/verify    - Verify OTP
POST /api/auth/otp/resend   - Resend OTP
```

**Key Features:**
- 6-digit OTP generation
- 10-minute expiry
- Max 5 verification attempts
- Mock SMS for development

---

### Phase 3: Session Management (Week 2)
**Files to Create:**
- `server/services/sessionService.ts` - Session creation/management
- `server/middleware/auth.ts` - Auth middleware

**Files to Modify:**
- `server/index.ts` - Add express-session configuration

**Key Features:**
- Token-based sessions
- 30-day expiry
- Activity tracking
- HTTP-only cookies

---

### Phase 4: Frontend Integration (Week 2-3)
**Files to Create:**
- `client/src/lib/api/auth.ts` - API client functions
- `client/src/hooks/useAuth.ts` - React Query hooks

**Files to Modify:**
- `client/src/pages/auth.tsx` - Integrate API calls
- `client/src/pages/otp.tsx` - Integrate API calls

**Key Changes:**
- Replace console.log with API calls
- Add React Query mutations
- Error handling with toasts
- Phone number passing via URL params

---

### Phase 5: Security (Week 3)
**Files to Create:**
- `server/middleware/rateLimit.ts` - Rate limiting
- `server/middleware/validation.ts` - Input validation
- `server/middleware/errorHandler.ts` - Error handling

**Key Features:**
- Rate limiting (3 requests per 15 min)
- Input validation with Zod
- Comprehensive error handling
- Security headers

---

### Phase 6: Database Migration (Week 4)
**Files to Create:**
- `server/storage/databaseStorage.ts` - Database-backed storage

**Files to Modify:**
- `server/storage.ts` - Feature flag for storage type

**Key Features:**
- Migrate from in-memory to database
- Feature flag controlled
- Backward compatible

---

## 🔐 Security Features

1. **OTP Security**
   - Random 6-digit generation
   - Time-based expiry
   - Attempt limiting
   - Rate limiting

2. **Session Security**
   - Secure HTTP-only cookies
   - Token rotation
   - Activity tracking
   - Automatic expiry

3. **Input Validation**
   - Zod schema validation
   - Phone number format check
   - OTP format validation

---

## 🧪 Development vs Production

### Development
- Mock SMS service (logs to console)
- OTP returned in API response (for testing)
- In-memory storage
- Detailed error messages

### Production
- Real SMS service (Twilio/MSG91)
- OTP never in response
- Database storage
- Generic error messages

---

## 📋 Quick Start Checklist

### Immediate Next Steps:
1. [ ] Create `server/config.ts` with configuration
2. [ ] Expand `shared/schema.ts` with new tables
3. [ ] Create `server/services/otpService.ts`
4. [ ] Create `server/services/smsService.ts` (mock first)
5. [ ] Create `server/routes/auth.ts` with endpoints
6. [ ] Update `server/routes.ts` to register auth routes
7. [ ] Test OTP flow with mock SMS
8. [ ] Create frontend API client
9. [ ] Update auth page to use API
10. [ ] Update OTP page to use API

---

## 🔄 Feature Flag Strategy

All new features controlled by:
- `ENABLE_REAL_OTP` - Enable real SMS (default: false)
- `USE_DATABASE` - Use database storage (default: false)
- `ENABLE_RATE_LIMIT` - Enable rate limiting (default: true)

Existing feature flags in `client/src/config/featureFlags.ts` remain unchanged.

---

## 🚨 Important Notes

1. **No Breaking Changes**: All new code is additive
2. **Backward Compatible**: Existing code continues to work
3. **Feature Flags**: New features can be toggled on/off
4. **Incremental Rollout**: Implement phase by phase
5. **Testing First**: Mock services for development

---

## 📞 API Endpoints Summary

### Authentication
```
POST /api/auth/otp/request
Body: { phoneNumber: string }
Response: { success: boolean, message: string, otp?: string }

POST /api/auth/otp/verify
Body: { phoneNumber: string, otp: string }
Response: { success: boolean, message: string, token?: string, user?: object }

POST /api/auth/otp/resend
Body: { phoneNumber: string }
Response: { success: boolean, message: string, otp?: string }
```

---

## 🎯 Success Metrics

- ✅ OTP sent successfully
- ✅ OTP verified correctly
- ✅ Session created after verification
- ✅ Rate limiting working
- ✅ Error handling comprehensive
- ✅ Frontend integrated seamlessly
- ✅ No existing features broken

---

**See `BACKEND_IMPLEMENTATION_PLAN.md` for complete detailed implementation guide.**

