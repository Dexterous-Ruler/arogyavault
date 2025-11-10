# Arogya Vault - Complete Project Index

## 📋 Project Overview

**Arogya Vault** is a healthcare data management platform that allows users to securely store, manage, and share their medical records. The application emphasizes user control, privacy, and accessibility.

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React

---

## 📁 Project Structure

```
PBL-TANISHQ/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page-level components (routing)
│   │   ├── config/           # Configuration files
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   └── index.css         # Global styles
│   └── index.html            # HTML entry point
├── server/                   # Backend Express server
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data storage interface
│   └── vite.ts              # Vite dev server setup
├── shared/                   # Shared code between client/server
│   └── schema.ts            # Database schema (Drizzle)
└── [config files]           # TypeScript, Vite, Tailwind, etc.
```

---

## 🎯 Core Features

### 1. Authentication System
- **Phone OTP**: Primary authentication method
- **ABHA ID**: Government health ID integration (stubbed)
- **Email**: Alternative authentication (stubbed)
- **Guest Mode**: Limited access without authentication (stubbed)

**Components**:
- `MediLockerAuthPage.tsx` (ArogyaVaultAuthPage) - Main authentication UI
- `MediLockerOtpVerificationScreen.tsx` (ArogyaVaultOtpVerificationScreen) - OTP verification
- `pages/auth.tsx` - Auth page wrapper with routing logic

### 2. User Onboarding
- Multi-step onboarding flow
- User preferences setup
- Initial data collection

**Components**:
- `MediLockerOnboarding.tsx` (ArogyaVaultOnboarding) - Onboarding wizard
- `pages/onboarding.tsx` - Onboarding page wrapper

### 3. Dashboard (Home)
- Quick actions for common tasks
- Recent documents preview
- AI health insights
- Nearby clinics/labs
- Bottom navigation

**Components**:
- `MediLockerDashboard.tsx` (ArogyaVaultDashboard) - Main dashboard UI
- `pages/home.tsx` - Home page wrapper

### 4. Document Vault
- Secure document storage
- Multiple document types (prescriptions, lab reports, imaging, billing)
- Search and filtering
- Multiple upload methods (camera, file, QR, DICOM)
- Offline sync support

**Components**:
- `VaultDocumentTimeline.tsx` - Document list/timeline view
- `MediLockerAddDocumentWizard.tsx` (ArogyaVaultAddDocumentWizard) - Document upload wizard
- `DocumentDetailScreen.tsx` - Individual document viewer
- `pages/vault.tsx` - Vault page wrapper
- `pages/document-detail.tsx` - Document detail page

### 5. Consent Management
- Grant/revoke access to healthcare providers
- Role-based access (doctor, lab, family, insurer)
- Scope-based permissions (docs, emergency, timebound)
- Audit logging
- Offline consent queue

**Components**:
- `ConsentCenter.tsx` - Main consent management UI
- `GrantConsentFlow.tsx` - Grant consent wizard
- `pages/consent.tsx` - Consent page wrapper

### 6. Emergency Card
- Critical health information display
- QR code for emergency access
- Nominee management integration
- Print/share functionality

**Components**:
- `EmergencyCardScreen.tsx` - Emergency card UI
- `pages/emergency.tsx` - Emergency page wrapper

### 7. Nominee Management
- Add/manage emergency contacts
- Access control for nominees

**Components**:
- `NomineeManagementScreen.tsx` - Nominee management UI
- `pages/nominee-management.tsx` - Nominee page wrapper

### 8. Profile Settings
- User profile management
- Preferences and settings

**Components**:
- `ProfileSettingsScreen.tsx` - Profile settings UI
- `pages/profile.tsx` - Profile page wrapper

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: `hsl(217, 91%, 60%)` - Trust, medical professionalism
- **Deep Blue**: `hsl(239, 84%, 67%)` - Primary actions
- **Indigo Accent**: `hsl(239, 84%, 67%)` - Gradients
- **Neutrals**: White backgrounds, gray text hierarchy
- **Functional**: Red (error), Green (success), Amber (warning)

### Typography
- **Font Stack**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Scale**: text-xs (12px) → text-3xl (28px)
- **Guided Mode**: Increases all sizes by 1-2 steps

### Layout
- **Mobile-First**: Max-width 390px (iPhone-optimized)
- **Responsive Breakpoints**:
  - Mobile: base (default)
  - Tablet: md: (768px)
  - Desktop: lg: (1024px)
  - Large: xl: (1280px)

### Components
- **Buttons**: Rounded-xl, shadow-lg, active:scale-[0.98]
- **Cards**: Rounded-3xl, shadow-xl, border-gray-100
- **Inputs**: Rounded-xl, border-2, focus-within:border-blue-500
- **Icons**: Lucide React, w-4 h-4 (standard), w-5 h-5 (emphasized)

---

## 🔧 Configuration

### Feature Flags (`client/src/config/featureFlags.ts`)
Compile-time feature flags controlling:
- **Screens**: Which pages are accessible
- **Auth Methods**: Which authentication methods are enabled
- **Features**: Multi-language, guided mode, dark mode

**Current State**:
- ✅ All screens enabled
- ✅ All auth methods enabled
- ✅ Multi-language & guided mode enabled
- ❌ Dark mode disabled

### Routing (`client/src/App.tsx`)
Uses Wouter for client-side routing:
- `/` or `/auth` - Authentication
- `/otp` - OTP verification
- `/onboarding` - User onboarding
- `/home` - Dashboard
- `/vault` - Document vault
- `/consent` - Consent center
- `/emergency` - Emergency card
- `/nominee-management` - Nominee management
- `/profile` - Profile settings
- `/document/:id` - Document detail

### Database Schema (`shared/schema.ts`)
Currently minimal:
- **users** table: id, username, password
- Uses Drizzle ORM with PostgreSQL
- UUID primary keys

### Storage (`server/storage.ts`)
In-memory storage implementation:
- `MemStorage` class for development
- Interface: `IStorage` for abstraction
- Methods: getUser, getUserByUsername, createUser

---

## 🧩 Component Architecture

### Page Components (`client/src/pages/`)
Page-level components that:
- Handle routing logic
- Manage feature flags
- Coordinate between UI components and navigation
- Handle business logic

**Files**:
- `auth.tsx` - Authentication page
- `otp.tsx` - OTP verification page
- `onboarding.tsx` - Onboarding page
- `home.tsx` - Dashboard page
- `vault.tsx` - Vault page
- `consent.tsx` - Consent page
- `emergency.tsx` - Emergency page
- `nominee-management.tsx` - Nominee page
- `profile.tsx` - Profile page
- `document-detail.tsx` - Document detail page
- `not-found.tsx` - 404 page

### UI Components (`client/src/components/`)
Reusable, presentational components:
- Screen-level components (ArogyaVault*)
- Feature components (ConsentCenter, VaultDocumentTimeline)
- UI primitives in `ui/` folder (Radix UI based)

**Key Components**:
- `MediLockerAuthPage.tsx` (ArogyaVaultAuthPage) - Auth screen
- `MediLockerOtpVerificationScreen.tsx` (ArogyaVaultOtpVerificationScreen) - OTP screen
- `MediLockerOnboarding.tsx` (ArogyaVaultOnboarding) - Onboarding wizard
- `MediLockerDashboard.tsx` (ArogyaVaultDashboard) - Dashboard
- `MediLockerAddDocumentWizard.tsx` (ArogyaVaultAddDocumentWizard) - Document upload
- `VaultDocumentTimeline.tsx` - Document timeline
- `ConsentCenter.tsx` - Consent management
- `GrantConsentFlow.tsx` - Grant consent wizard
- `EmergencyCardScreen.tsx` - Emergency card
- `NomineeManagementScreen.tsx` - Nominee management
- `ProfileSettingsScreen.tsx` - Profile settings
- `DocumentDetailScreen.tsx` - Document viewer

### UI Primitives (`client/src/components/ui/`)
47 Radix UI-based components:
- Form controls (input, button, select, checkbox, etc.)
- Layout (card, separator, tabs, etc.)
- Overlays (dialog, sheet, popover, tooltip, etc.)
- Data display (table, badge, avatar, etc.)
- Navigation (breadcrumb, navigation-menu, etc.)

---

## 🔐 Security & Privacy

### Design Principles
1. **Trust & Security First** - Visual elements reinforce data security
2. **User Control** - Users control all data access
3. **Encryption** - End-to-end encryption messaging
4. **Consent-Based** - All sharing requires explicit consent

### Features
- Privacy sheet with security information
- Consent management with audit logs
- Offline-first architecture for sensitive data
- Role-based access control

---

## ♿ Accessibility

### Guided Mode
- Increases text sizes by 1-2 steps
- Larger touch targets (44px minimum)
- Enhanced spacing
- Maintains WCAG AA contrast ratios

### Multi-Language
- English (EN) and Hindi (हिं)
- Language switcher in header
- RTL-ready layout structure
- Locale-aware formatting

### Form Accessibility
- Real-time validation feedback
- Error messages with icons
- Clear focus states
- ARIA labels and roles

---

## 🚀 Development

### Scripts (`package.json`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Development Server
- Express server on port 5000 (or PORT env var)
- Vite HMR in development
- Static file serving in production
- API routes prefixed with `/api`

### Build Process
1. Vite builds client to `dist/public`
2. esbuild bundles server to `dist/index.js`
3. Static files served from `dist/public`
4. Server handles API routes and SPA routing

---

## 📦 Dependencies

### Core
- **react** ^18.3.1 - UI framework
- **react-dom** ^18.3.1 - React DOM renderer
- **typescript** 5.6.3 - Type safety
- **vite** ^5.4.20 - Build tool

### UI & Styling
- **tailwindcss** ^3.4.17 - Utility-first CSS
- **@radix-ui/** - Accessible component primitives (47 packages)
- **framer-motion** ^11.18.2 - Animations
- **lucide-react** ^0.453.0 - Icons

### State & Data
- **@tanstack/react-query** ^5.60.5 - Server state management
- **react-hook-form** ^7.55.0 - Form handling
- **zod** ^3.24.2 - Schema validation

### Routing & Navigation
- **wouter** ^3.3.5 - Lightweight router

### Backend
- **express** ^4.21.2 - Web framework
- **drizzle-orm** ^0.39.1 - Type-safe ORM
- **@neondatabase/serverless** ^0.10.4 - PostgreSQL client
- **express-session** ^1.18.1 - Session management
- **passport** ^0.7.0 - Authentication middleware

---

## 🗂️ Data Models

### User
```typescript
{
  id: string (UUID)
  username: string (unique)
  password: string (hashed)
}
```

### Document (conceptual)
```typescript
{
  id: string
  title: string
  provider?: string
  date: string
  type: 'prescription' | 'lab' | 'imaging' | 'billing'
  tags: string[]
  thumbnail?: string
  isOffline?: boolean
}
```

### Consent (conceptual)
```typescript
{
  id: string
  granteeName: string
  role: 'doctor' | 'lab' | 'family' | 'insurer'
  expiryDate: string
  scopes: ('docs' | 'emergency' | 'timebound')[]
  purpose: string
  status: 'active' | 'pending' | 'expired'
  isOffline?: boolean
}
```

---

## 🧪 Testing & Quality

### Feature Flag Testing
See `FEATURE_FLAGS_TEST.md` for comprehensive testing guide.

### Smoke Test Checklist
See `SMOKE_TEST_CHECKLIST.md` for regression testing.

### Responsive Testing
See `RESPONSIVE_GUIDE.md` for breakpoint testing.

---

## 📚 Documentation Files

- `ARCHITECTURE_DECISIONS.md` - Feature flags architecture & trade-offs
- `design_guidelines.md` - Complete design system documentation
- `RESPONSIVE_GUIDE.md` - Responsive design testing guide
- `FEATURE_FLAGS_TEST.md` - Feature flag testing procedures
- `SMOKE_TEST_CHECKLIST.md` - Smoke test checklist

---

## 🔄 Application Flow

### Authentication Flow
1. User lands on `/auth`
2. Enters phone number
3. Clicks "Continue with OTP"
4. Navigates to `/otp`
5. Enters 6-digit OTP
6. Verifies and navigates to `/onboarding`
7. Completes onboarding
8. Lands on `/home` dashboard

### Document Management Flow
1. User navigates to `/vault`
2. Views document timeline
3. Clicks "+" FAB
4. Selects upload method (camera/file/QR/DICOM)
5. Opens document wizard
6. Fills document metadata
7. Uploads document
8. Document appears in timeline
9. Can click to view detail at `/document/:id`

### Consent Flow
1. User navigates to `/consent`
2. Views active/pending/expired consents
3. Clicks "+" FAB to grant new consent
4. Opens grant consent wizard
5. Selects grantee (doctor/lab/family/insurer)
6. Sets scopes and expiry
7. Grants consent
8. Consent appears in active tab
9. Can revoke or view audit log

---

## 🎯 Key Design Patterns

### 1. Feature Flags Pattern
- Compile-time flags in `featureFlags.ts`
- Controls route registration and handler availability
- Requires browser reload for changes
- Preserves exact UI (no visual disabled states)

### 2. Page-Component Separation
- Pages handle routing/business logic
- Components are presentational
- Clear separation of concerns

### 3. Prop-Based Communication
- Components receive callbacks via props
- No global state management (except React Query for server state)
- Easy to test and reason about

### 4. Mobile-First Responsive
- Base styles for mobile (390px max-width)
- Progressive enhancement for larger screens
- Touch-optimized interactions

### 5. Accessibility-First
- Guided mode for accessibility
- Multi-language support
- ARIA labels and semantic HTML
- Keyboard navigation support

---

## 🚧 Known Limitations & TODOs

### Current Limitations
- In-memory storage (not persistent)
- Stubbed authentication methods (ABHA, email, guest)
- Mock data for documents and consents
- No real backend API integration
- No actual OTP sending/receiving
- No file upload implementation
- No offline sync implementation

### Future Enhancements
- Real database persistence
- Complete authentication flows
- File upload and storage
- Offline sync mechanism
- Dark mode support
- More document types
- Advanced search and filtering
- AI insights integration
- Real-time notifications

---

## 📝 Code Style & Conventions

### TypeScript
- Strict mode enabled
- No implicit any
- Type inference where possible
- Explicit types for props and interfaces

### React
- Functional components only
- Hooks for state management
- Props destructuring
- Conditional rendering with early returns

### Naming
- Components: PascalCase (e.g., `ArogyaVaultAuthPage`)
- Files: Match component name
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE or camelCase for objects

### File Organization
- One component per file
- Co-located types and interfaces
- Translations object within component file
- Utility functions in `lib/`

---

## 🔍 Key Files Reference

### Entry Points
- `client/src/main.tsx` - React app entry
- `client/src/App.tsx` - Root component with routing
- `server/index.ts` - Express server entry

### Configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database configuration

### Shared
- `shared/schema.ts` - Database schema definitions

### Utilities
- `client/src/lib/queryClient.ts` - React Query setup
- `client/src/lib/utils.ts` - Utility functions (cn helper)

---

## 🎨 Design Tokens

### Spacing
- Component padding: `p-6` (24px)
- Section spacing: `mb-6`, `mb-12` (24px, 48px)
- Element gaps: `gap-2`, `gap-3` (8px, 12px)

### Border Radius
- Large cards: `rounded-3xl` (24px)
- Inputs/buttons: `rounded-xl` (12px)
- Small elements: `rounded-lg` (8px)

### Shadows
- Cards: `shadow-xl shadow-gray-200/50`
- Buttons: `shadow-lg shadow-blue-200`
- Hover: `hover:shadow-2xl`

### Transitions
- Standard: `transition-colors`, `transition-all`
- Duration: 150-300ms
- Easing: Default (ease-in-out)

---

## 📊 Component Dependency Graph

```
App.tsx
├── Router (Wouter)
│   ├── AuthPage → ArogyaVaultAuthPage
│   ├── OTPPage → ArogyaVaultOtpVerificationScreen
│   ├── OnboardingPage → ArogyaVaultOnboarding
│   ├── HomePage → ArogyaVaultDashboard
│   ├── VaultPage → VaultDocumentTimeline + ArogyaVaultAddDocumentWizard
│   ├── ConsentPage → ConsentCenter + GrantConsentFlow
│   ├── EmergencyPage → EmergencyCardScreen
│   ├── NomineeManagementPage → NomineeManagementScreen
│   ├── ProfilePage → ProfileSettingsScreen
│   └── DocumentDetailPage → DocumentDetailScreen
└── QueryClientProvider (TanStack Query)
    └── TooltipProvider (Radix UI)
        └── Toaster (Toast notifications)
```

---

## 🎓 Learning Resources

### Technologies Used
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle ORM](https://orm.drizzle.team)
- [Wouter](https://github.com/molefrog/wouter)

---

## 📞 Support & Contribution

### Project Structure
- Follow existing patterns for new features
- Use feature flags for new screens
- Maintain mobile-first responsive design
- Include accessibility features
- Add translations for multi-language support

### Code Quality
- TypeScript strict mode
- Component prop types
- Error handling
- Loading states
- Empty states

---

**Last Updated**: Generated from codebase analysis
**Project**: Arogya Vault
**Version**: 1.0.0

