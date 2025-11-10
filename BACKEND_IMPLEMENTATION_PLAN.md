# Backend Implementation Plan - Arogya Vault
## Real-time OTP Verification & Backend Features

**Goal**: Implement production-ready backend with real-time OTP verification without disrupting existing code.

---

## 📋 Current State Analysis

### Existing Infrastructure ✅
- Express server with TypeScript
- React Query setup (`queryClient.ts`)
- Session management (express-session, passport)
- Feature flags system
- Database schema (Drizzle ORM)
- In-memory storage (MemStorage)
- API request utilities (`apiRequest`, `getQueryFn`)

### Current Gaps ❌
- No API routes implemented
- No OTP generation/verification
- No SMS service integration
- No session-based authentication
- No database persistence
- Frontend uses console.log/alerts (no real API calls)

---

## 🎯 Implementation Strategy

### Core Principles
1. **Non-Breaking Changes**: All new features behind feature flags
2. **Incremental Rollout**: Phase-by-phase implementation
3. **Backward Compatible**: Existing code continues to work
4. **Feature Flags**: Use existing flag system for gradual enablement
5. **Type Safety**: Full TypeScript coverage
6. **Error Handling**: Comprehensive error handling from day 1

---

## 📦 Phase 1: Foundation & Database Schema (Week 1)

### 1.1 Database Schema Expansion

**File**: `shared/schema.ts`

```typescript
// Add to existing schema:

export const otpSessions = pgTable("otp_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
});

// Extend users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  username: text("username"),
  email: text("email"),
  abhaId: text("abha_id"),
  isGuest: boolean("is_guest").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Remove password field (using OTP-based auth)
});
```

**Migration Strategy**:
- Create new tables alongside existing
- Keep existing `users` table for backward compatibility
- Add migration scripts

### 1.2 Storage Interface Expansion

**File**: `server/storage.ts`

```typescript
export interface IStorage {
  // Existing methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // New OTP methods
  createOTPSession(phoneNumber: string, otp: string, expiresIn: number): Promise<OTPSession>;
  getOTPSession(phoneNumber: string): Promise<OTPSession | undefined>;
  verifyOTP(phoneNumber: string, otp: string): Promise<boolean>;
  incrementOTPAttempts(phoneNumber: string): Promise<void>;
  markOTPVerified(phoneNumber: string): Promise<void>;
  deleteOTPSession(phoneNumber: string): Promise<void>;
  
  // New session methods
  createSession(userId: string, token: string, expiresIn: number): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  updateSessionActivity(token: string): Promise<void>;
  
  // New user methods
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createOrUpdateUser(phoneNumber: string, data?: Partial<User>): Promise<User>;
}
```

**Implementation**:
- Extend `MemStorage` class with new methods
- Keep in-memory for development
- Add database-backed implementation later

### 1.3 Environment Configuration

**File**: `server/config.ts` (NEW)

```typescript
export const config = {
  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 5,
    resendCooldownSeconds: 60,
  },
  
  // SMS Service (choose one)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio', // 'twilio', 'msg91', 'mock'
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY,
      templateId: process.env.MSG91_TEMPLATE_ID,
    },
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    cookieName: 'arogya_vault_session',
  },
  
  // Rate Limiting
  rateLimit: {
    otpRequest: { windowMs: 15 * 60 * 1000, max: 3 }, // 3 per 15 min
    otpVerify: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 per 15 min
  },
};
```

**File**: `.env.example` (NEW)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arogya_vault

# OTP & SMS
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Session
SESSION_SECRET=your-secret-key-here

# Server
PORT=3000
NODE_ENV=development
```

---

## 📦 Phase 2: OTP Service Implementation (Week 1-2)

### 2.1 OTP Generation Service

**File**: `server/services/otpService.ts` (NEW)

```typescript
import { randomInt } from 'crypto';
import { config } from '../config';
import { storage } from '../storage';

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Create and store OTP session
   */
  static async createOTPSession(phoneNumber: string): Promise<string> {
    // Check rate limiting
    const existingSession = await storage.getOTPSession(phoneNumber);
    if (existingSession && !existingSession.verified) {
      const timeSinceCreation = Date.now() - existingSession.createdAt.getTime();
      if (timeSinceCreation < config.otp.resendCooldownSeconds * 1000) {
        throw new Error('Please wait before requesting a new OTP');
      }
    }

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    await storage.createOTPSession(phoneNumber, otp, expiresAt.getTime());

    return otp;
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const session = await storage.getOTPSession(phoneNumber);
    
    if (!session) {
      return false;
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      await storage.deleteOTPSession(phoneNumber);
      return false;
    }

    // Check attempts
    if (session.attempts >= config.otp.maxAttempts) {
      await storage.deleteOTPSession(phoneNumber);
      throw new Error('Maximum verification attempts exceeded');
    }

    // Increment attempts
    await storage.incrementOTPAttempts(phoneNumber);

    // Verify OTP
    if (session.otp === otp) {
      await storage.markOTPVerified(phoneNumber);
      return true;
    }

    return false;
  }

  /**
   * Clean up expired OTP sessions (cron job)
   */
  static async cleanupExpiredSessions(): Promise<void> {
    // Implementation for cleanup
  }
}
```

### 2.2 SMS Service Abstraction

**File**: `server/services/smsService.ts` (NEW)

```typescript
import { config } from '../config';

export interface ISMSService {
  sendOTP(phoneNumber: string, otp: string): Promise<void>;
}

// Mock SMS Service (for development)
export class MockSMSService implements ISMSService {
  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
    // In development, log OTP to console
    // In production, this would be replaced with real SMS service
  }
}

// Twilio SMS Service
export class TwilioSMSService implements ISMSService {
  private client: any; // Twilio client

  constructor() {
    if (config.sms.provider === 'twilio' && config.sms.twilio.accountSid) {
      // Initialize Twilio client
      // const twilio = require('twilio');
      // this.client = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    // Twilio implementation
    // await this.client.messages.create({
    //   body: `Your Arogya Vault OTP is ${otp}. Valid for 10 minutes.`,
    //   from: config.sms.twilio.fromNumber,
    //   to: phoneNumber,
    // });
  }
}

// Factory pattern
export function createSMSService(): ISMSService {
  switch (config.sms.provider) {
    case 'twilio':
      return new TwilioSMSService();
    case 'msg91':
      // return new MSG91SMSService();
      return new MockSMSService();
    default:
      return new MockSMSService();
  }
}

export const smsService = createSMSService();
```

### 2.3 API Routes - OTP Endpoints

**File**: `server/routes/auth.ts` (NEW)

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { OTPService } from '../services/otpService';
import { smsService } from '../services/smsService';
import { storage } from '../storage';
import { config } from '../config';

const router = Router();

// Validation schemas
const requestOTPSchema = z.object({
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

const verifyOTPSchema = z.object({
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

/**
 * POST /api/auth/otp/request
 * Request OTP for phone number
 */
router.post('/otp/request', async (req, res, next) => {
  try {
    const { phoneNumber } = requestOTPSchema.parse(req.body);

    // Generate and store OTP
    const otp = await OTPService.createOTPSession(phoneNumber);

    // Send SMS (in production)
    if (config.sms.provider !== 'mock') {
      await smsService.sendOTP(`+91${phoneNumber}`, otp);
    } else {
      // In development, return OTP in response (remove in production)
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development only:
      ...(config.sms.provider === 'mock' && { otp }), // REMOVE IN PRODUCTION
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/otp/verify
 * Verify OTP and create session
 */
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { phoneNumber, otp } = verifyOTPSchema.parse(req.body);

    // Verify OTP
    const isValid = await OTPService.verifyOTP(phoneNumber, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Get or create user
    let user = await storage.getUserByPhoneNumber(phoneNumber);
    if (!user) {
      user = await storage.createOrUpdateUser(phoneNumber);
    }

    // Create session
    const sessionToken = await createUserSession(user.id, req);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: sessionToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/otp/resend
 * Resend OTP
 */
router.post('/otp/resend', async (req, res, next) => {
  try {
    const { phoneNumber } = requestOTPSchema.parse(req.body);

    // Delete existing session
    await storage.deleteOTPSession(phoneNumber);

    // Create new OTP session
    const otp = await OTPService.createOTPSession(phoneNumber);

    // Send SMS
    if (config.sms.provider !== 'mock') {
      await smsService.sendOTP(`+91${phoneNumber}`, otp);
    } else {
      console.log(`[DEV] Resent OTP for ${phoneNumber}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP resent successfully',
      ...(config.sms.provider === 'mock' && { otp }), // REMOVE IN PRODUCTION
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 📦 Phase 3: Session Management (Week 2)

### 3.1 Session Service

**File**: `server/services/sessionService.ts` (NEW)

```typescript
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { storage } from '../storage';
import { config } from '../config';

export async function createUserSession(userId: string, req: Request): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.session.maxAge);

  await storage.createSession(userId, token, expiresAt.getTime());

  // Set session cookie
  req.session.userId = userId;
  req.session.token = token;

  return token;
}

export async function getSessionUser(req: Request): Promise<string | null> {
  const token = req.session.token;
  if (!token) return null;

  const session = await storage.getSession(token);
  if (!session || new Date() > session.expiresAt) {
    return null;
  }

  // Update last activity
  await storage.updateSessionActivity(token);

  return session.userId;
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const token = req.session.token;
  if (token) {
    await storage.deleteSession(token);
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
  });

  res.clearCookie(config.session.cookieName);
}
```

### 3.2 Authentication Middleware

**File**: `server/middleware/auth.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { getSessionUser } from '../services/sessionService';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = await getSessionUser(req);

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  req.userId = userId;
  next();
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = await getSessionUser(req);
  req.userId = userId || null;
  next();
}
```

### 3.3 Session Configuration

**File**: `server/index.ts` (UPDATE)

```typescript
import session from 'express-session';
import { config } from './config';

// Add after express.json() middleware
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: config.session.cookieName,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: config.session.maxAge,
      sameSite: 'lax',
    },
  })
);
```

---

## 📦 Phase 4: Frontend Integration (Week 2-3)

### 4.1 API Client Functions

**File**: `client/src/lib/api/auth.ts` (NEW)

```typescript
import { apiRequest } from '../queryClient';

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    phoneNumber: string;
  };
}

export async function requestOTP(phoneNumber: string): Promise<RequestOTPResponse> {
  const res = await apiRequest('POST', '/api/auth/otp/request', {
    phoneNumber,
  });
  return res.json();
}

export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<VerifyOTPResponse> {
  const res = await apiRequest('POST', '/api/auth/otp/verify', {
    phoneNumber,
    otp,
  });
  return res.json();
}

export async function resendOTP(phoneNumber: string): Promise<RequestOTPResponse> {
  const res = await apiRequest('POST', '/api/auth/otp/resend', {
    phoneNumber,
  });
  return res.json();
}
```

### 4.2 React Query Hooks

**File**: `client/src/hooks/useAuth.ts` (NEW)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { requestOTP, verifyOTP, resendOTP } from '@/lib/api/auth';
import { useToast } from '@/hooks/use-toast';

export function useRequestOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: requestOTP,
    onSuccess: (data) => {
      toast({
        title: 'OTP Sent',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyOTP() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
      verifyOTP(phoneNumber, otp),
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Store token in localStorage or cookie
        localStorage.setItem('auth_token', data.token);
        
        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        toast({
          title: 'Success',
          description: 'OTP verified successfully',
        });
        
        // Navigate to onboarding or home
        setLocation('/onboarding');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useResendOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: resendOTP,
    onSuccess: (data) => {
      toast({
        title: 'OTP Resent',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
```

### 4.3 Update Auth Page

**File**: `client/src/pages/auth.tsx` (UPDATE)

```typescript
import { useRequestOTP } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const requestOTPMutation = useRequestOTP();

  const handleContinueWithOTP = async (phoneNumber: string) => {
    if (!featureFlags.auth.phoneOTP) {
      alert('Phone OTP authentication is currently disabled');
      return;
    }

    try {
      // Call API to request OTP
      const response = await requestOTPMutation.mutateAsync(phoneNumber);
      
      if (response.success) {
        // Navigate to OTP screen with phone number
        setLocation(`/otp?phone=${phoneNumber}`);
      }
    } catch (error) {
      // Error handled by mutation
      console.error('OTP request failed:', error);
    }
  };

  // ... rest of the component
}
```

### 4.4 Update OTP Page

**File**: `client/src/pages/otp.tsx` (UPDATE)

```typescript
import { useVerifyOTP, useResendOTP } from '@/hooks/useAuth';
import { useLocation, useSearchParams } from 'wouter';
import { featureFlags } from '@/config/featureFlags';

export default function OTPPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  const handleVerify = async (otp: string) => {
    try {
      await verifyOTPMutation.mutateAsync({ phoneNumber, otp });
      // Navigation handled in mutation success
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOTPMutation.mutateAsync(phoneNumber);
    } catch (error) {
      // Error handled by mutation
    }
  };

  // ... rest of the component
}
```

---

## 📦 Phase 5: Rate Limiting & Security (Week 3)

### 5.1 Rate Limiting Middleware

**File**: `server/middleware/rateLimit.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: { [key: string]: RateLimitStore } = {};

export function rateLimit(
  key: string,
  windowMs: number,
  max: number
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const storeKey = `${key}:${identifier}`;

    if (!stores[key]) {
      stores[key] = {};
    }

    const store = stores[key];
    const now = Date.now();

    // Clean up expired entries
    if (store[storeKey] && store[storeKey].resetTime < now) {
      delete store[storeKey];
    }

    // Check limit
    if (!store[storeKey]) {
      store[storeKey] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[storeKey].count >= max) {
      const resetIn = Math.ceil((store[storeKey].resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
      });
    }

    store[storeKey].count++;
    next();
  };
}
```

### 5.2 Apply Rate Limiting

**File**: `server/routes/auth.ts` (UPDATE)

```typescript
import { rateLimit } from '../middleware/rateLimit';
import { config } from '../config';

// Apply rate limiting
router.post(
  '/otp/request',
  rateLimit('otp-request', config.rateLimit.otpRequest.windowMs, config.rateLimit.otpRequest.max),
  async (req, res, next) => {
    // ... existing handler
  }
);

router.post(
  '/otp/verify',
  rateLimit('otp-verify', config.rateLimit.otpVerify.windowMs, config.rateLimit.otpVerify.max),
  async (req, res, next) => {
    // ... existing handler
  }
);
```

### 5.3 Input Validation & Sanitization

**File**: `server/middleware/validation.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
}
```

---

## 📦 Phase 6: Error Handling & Logging (Week 3)

### 6.1 Error Handler

**File**: `server/middleware/errorHandler.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

### 6.2 Update Server Error Handling

**File**: `server/index.ts` (UPDATE)

```typescript
import { errorHandler } from './middleware/errorHandler';

// Replace existing error handler
app.use(errorHandler);
```

---

## 📦 Phase 7: Database Migration (Week 4)

### 7.1 Update Storage to Use Database

**File**: `server/storage/databaseStorage.ts` (NEW)

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { IStorage } from '../storage';
import * as schema from '@shared/schema';

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool, { schema });
  }

  // Implement all IStorage methods using database
  // ...
}
```

### 7.2 Feature Flag for Storage

**File**: `server/storage.ts` (UPDATE)

```typescript
import { config } from './config';

export const storage = config.useDatabase
  ? new DatabaseStorage()
  : new MemStorage();
```

---

## 📦 Phase 8: Testing & Documentation (Week 4)

### 8.1 API Documentation

**File**: `API_DOCUMENTATION.md` (NEW)

Document all endpoints with:
- Request/response examples
- Error codes
- Rate limits
- Authentication requirements

### 8.2 Testing Strategy

- Unit tests for OTP service
- Integration tests for API endpoints
- E2E tests for auth flow
- Load testing for rate limits

---

## 🚀 Implementation Timeline

### Week 1
- ✅ Day 1-2: Database schema expansion
- ✅ Day 3-4: OTP service implementation
- ✅ Day 5: SMS service integration (mock first)

### Week 2
- ✅ Day 1-2: Session management
- ✅ Day 3-4: Frontend API integration
- ✅ Day 5: Testing & bug fixes

### Week 3
- ✅ Day 1-2: Rate limiting & security
- ✅ Day 3-4: Error handling
- ✅ Day 5: Integration testing

### Week 4
- ✅ Day 1-2: Database migration
- ✅ Day 3-4: Production SMS service
- ✅ Day 5: Documentation & deployment prep

---

## 🔒 Security Considerations

1. **OTP Security**
   - 6-digit random OTP
   - 10-minute expiry
   - Max 5 verification attempts
   - Rate limiting on requests

2. **Session Security**
   - HTTP-only cookies
   - Secure flag in production
   - Session expiry (30 days)
   - Token rotation on activity

3. **Input Validation**
   - Zod schemas for all inputs
   - Phone number format validation
   - OTP format validation

4. **Rate Limiting**
   - Per IP address
   - Configurable windows
   - Different limits for request vs verify

---

## 🧪 Testing Strategy

### Development Testing
- Mock SMS service (logs to console)
- In-memory storage
- OTP returned in response (dev only)

### Production Testing
- Real SMS service
- Database storage
- OTP never returned in response
- Comprehensive error handling

---

## 📝 Feature Flags Integration

**File**: `server/config.ts` (UPDATE)

```typescript
export const config = {
  // Feature flags
  features: {
    realOTP: process.env.ENABLE_REAL_OTP === 'true',
    databaseStorage: process.env.USE_DATABASE === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMIT !== 'false',
  },
  // ... rest of config
};
```

---

## 🎯 Success Criteria

1. ✅ OTP generation and verification working
2. ✅ SMS delivery (mock in dev, real in prod)
3. ✅ Session management functional
4. ✅ Frontend integrated with backend
5. ✅ Rate limiting active
6. ✅ Error handling comprehensive
7. ✅ No breaking changes to existing code
8. ✅ Feature flags control all new features

---

## 📋 Checklist

### Phase 1: Foundation
- [ ] Expand database schema
- [ ] Update storage interface
- [ ] Create config file
- [ ] Set up environment variables

### Phase 2: OTP Service
- [ ] Implement OTP generation
- [ ] Create OTP service
- [ ] Implement SMS service (mock)
- [ ] Create API routes

### Phase 3: Session Management
- [ ] Implement session service
- [ ] Create auth middleware
- [ ] Configure express-session

### Phase 4: Frontend Integration
- [ ] Create API client functions
- [ ] Create React Query hooks
- [ ] Update auth page
- [ ] Update OTP page

### Phase 5: Security
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Security headers

### Phase 6: Error Handling
- [ ] Create error handler
- [ ] Update server error handling
- [ ] Add logging

### Phase 7: Database
- [ ] Create database storage
- [ ] Migrate from in-memory
- [ ] Test database operations

### Phase 8: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create API documentation

---

## 🔄 Rollback Plan

If issues arise:
1. Disable feature flags
2. Revert to in-memory storage
3. Use mock SMS service
4. Keep existing frontend code intact

---

**This plan ensures zero disruption to existing code while building production-ready backend features incrementally.**

