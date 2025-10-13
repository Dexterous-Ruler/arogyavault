# MediLocker - Health Data Management Platform

## Overview

MediLocker is a responsive health data management web application designed to provide users with secure, encrypted control over their medical records. The platform prioritizes user privacy, accessibility, and a seamless multi-device experience.

**Business Vision & Market Potential:** To empower individuals with complete ownership and secure access to their health data, addressing growing concerns about data privacy and fragmented medical records.

**Key Capabilities:**
- **Secure Storage:** Encrypted medical record management.
- **Responsive Design:** Optimal viewing and interaction across mobile, tablet, PC, and TV screens.
- **Accessibility:** Multi-language support (English/Hindi) and a Guided Mode.
- **UI-First Development:** Focus on pixel-perfect UI implementation based on provided designs.

## User Preferences

- **Communication Style:** I prefer direct and concise communication.
- **Workflow:** I prefer an iterative and incremental development approach, focusing on one screen at a time.
- **Interaction:**
    - Implement exact UI from provided designs; do not redesign or improvise.
    - Create thin screen containers with stubbed handlers.
    - Expose routes for preview.
    - Add accessibility without changing visuals.
    - Use feature flags for controlled navigation and rollouts.
    - Test responsiveness across all defined breakpoints (mobile, tablet, desktop, TV).
    - Verify accessibility (ARIA, keyboard navigation).
    - Obtain user approval before implementing behavior or proceeding to the next screen.

## System Architecture

**UI/UX Decisions:**
-   **Design Approach:** UI-First Development, rendering exact UI from provided designs.
-   **Color Scheme:** Trust-oriented blue palette (Blue 600, gradients), gray for text hierarchy, functional red/green for status.
-   **Typography:** System font stack, scalable for accessibility (Guided Mode increases font size).
-   **Responsive Design:** Mobile-first approach, scaling to 4K displays with breakpoints for mobile (max 390px), tablet (768px+), desktop (1024px+), and large screens/TV (1280px+).
-   **Accessibility:** WCAG AA compliance, multi-language support (English/Hindi), and a Guided Mode.

**Technical Implementations:**
-   **Frontend:** React 18 with TypeScript, using Vite for development.
-   **Routing:** Wouter for lightweight client-side routing.
-   **Styling:** Tailwind CSS with a custom design system.
-   **Animations:** Framer Motion for smooth UI transitions.
-   **State Management:** React Query (TanStack Query v5).
-   **Iconography:** Lucide React.
-   **Feature Flagging:** Implemented via `client/src/config/featureFlags.ts` to control screen availability and authentication methods, ensuring progressive rollout.

**Feature Specifications:**
-   **Authentication Flow:** Phone number input with real-time validation (Indian format), OTP verification with resend timer and call options, ABHA ID/Email/Guest sign-in alternatives.
-   **Onboarding:** Multi-slide carousel introducing features like data ownership, offline-first capabilities, and settings.
-   **Home Dashboard:** Sticky header, quick action cards (Upload, AI Insights, Emergency, Medications), recent documents, AI health insights, nearby clinics/labs, and a fixed bottom navigation.
-   **Vault Document Timeline:** Secure document vault with sticky header, search functionality, type filters (All/Prescriptions/Lab/Imaging/Bills), document timeline with cards showing title/provider/date/tags, floating action button (FAB) with add menu (Camera/File Upload/QR Scan/DICOM Import), offline sync banner, and empty state.
-   **Add Document Wizard:** 4-step wizard modal for adding documents with multiple capture methods (Camera/Upload/QR/DICOM), simulated processing with quality indicators, OCR metadata editing with confidence scores, summary review, and success confirmation. Supports bilingual UI and bidirectional navigation.
-   **Consent Center:** Privacy-focused consent management with three-tab system (Active/Pending/Expired), role-specific consent cards (Doctor/Lab/Family/Insurer), offline sync support, revoke/renew actions, audit log access, and empty states. Accessible via Share button in bottom navigation.
-   **Security:** End-to-end encryption messaging (UI), privacy-first design, planned ABHA ID integration, and secure vault implementation.

**System Design Choices:**
-   **Modular Structure:** `components`, `pages`, `config`, `lib` directories for clear separation of concerns.
-   **Progressive Enhancement:** Screens are built and integrated one by one, enabling a structured development and review process.
-   **In-memory storage (MemStorage)** for MVP, with future plans for a robust backend and persistent storage.

## Recent Changes (October 13, 2025)

**Screen 5 - Vault Document Timeline Implemented:**
-   Created `VaultDocumentTimeline.tsx` component with complete document vault UI
-   Implemented sticky header with back button, page title, and search toggle
-   Added animated search input with live filtering (case-insensitive)
-   Built 5 document type filters: All, Prescriptions, Lab Reports, Imaging, Bills & Insurance
-   Designed document cards with type-specific colored icons, provider info, dates, and tags
-   Integrated floating action button (FAB) with add menu modal (Camera/File Upload/QR Scan/DICOM Import)
-   Added offline sync banner showing pending documents
-   Implemented empty state with call-to-action button
-   Created `pages/vault.tsx` container with all stubbed handlers
-   Enabled `screens.vault` feature flag
-   Added `/vault` route to App.tsx
-   Updated home page bottom navigation to navigate to vault
-   Complete flow now working: Auth → OTP → Onboarding → Home → Vault
-   Full bilingual support (EN/HI) with complete translation keys
-   All data-testid attributes present for comprehensive testing
-   Comprehensive automated testing passed (13 test scenarios covering navigation, filters, search, animations, responsive design)

**Screen 6 - Add Document Wizard Implemented:**
-   Created `MediLockerAddDocumentWizard.tsx` component with complete 4-step wizard flow
-   **Step 1 - Source Selection:** Four capture methods (Camera, Upload, QR/ABHA Import, DICOM) with visual indicators
-   **Step 2 - Capture/Upload:** Method-specific UIs with simulated processing:
    -   Camera: Live capture frame with quality detection (detecting → glare → good quality)
    -   Upload: File upload area with processing indicator and preview
    -   QR: ABHA import interface with processing and success confirmation
    -   DICOM: Medical imaging ZIP import with extraction indicator
-   **Step 3 - Metadata Editing:** OCR field editing with document type selector (Lab/Prescription/Imaging/Bill/Other), provider name, date, title fields, confidence indicators, and tags display
-   **Step 4 - Summary:** Final review showing file info, document metadata, and offline notice if applicable
-   **Success Modal:** Animated checkmark with "Document Added Successfully!" message and options to "Go to Vault" or "Add Another"
-   Integrated as full-screen modal overlay on vault page triggered by FAB menu options
-   Progress indicator showing current step (dots 1/2/3/4) with visual feedback
-   Language toggle (EN/HI) and online/offline mode toggle within wizard
-   Proper state management with completion/cancellation handlers
-   Bidirectional navigation with back buttons on each step
-   Method-specific file naming: captured_document.jpg (Camera), uploaded_document.pdf (Upload), abha_imported_record.pdf (QR), medical_imaging.zip (DICOM)
-   Full bilingual support with all translation keys
-   Comprehensive data-testid attributes for all interactive elements
-   Automated testing passed (7 test scenarios covering all capture methods, navigation, language toggle, responsive design at mobile/tablet/desktop)

**Screen 7 - Consent Center Implemented:**
-   Created `ConsentCenter.tsx` component with complete consent management UI
-   **Header:** Back button (to home), page title, add consent button (Plus icon)
-   **Three-tab System:** Active, Pending, Expired consents with pill-style selection
-   **Offline Sync Banner:** Shows pending offline consents count with tap-to-manage interaction
-   **Consent Cards:** Role-specific colored badges (Doctor/Lab/Family/Insurer), expiry dates, scopes with icons (Docs/Emergency/Time-bound), purpose descriptions
-   **Action Buttons:** Revoke + Audit Log for active/pending consents, Renew for expired consents
-   **Revoke Modal:** Confirmation dialog with warning icon, grantee name, Cancel and "Yes, Revoke" buttons
-   **Empty States:** Shield icon with contextual messages for each tab (Active/Pending/Expired)
-   **FAB:** Floating action button (bottom-right) to grant new consent
-   **Mock Consents:** 4 sample consents (Dr. Sharma, Apollo Lab, Family Member, Star Health Insurance) demonstrating all states
-   Integrated via Share button in home page bottom navigation
-   Sticky header with smooth scrolling content area
-   Stagger animations for consent card list (0.05s delay per card)
-   Full bilingual support (EN/HI) with complete translation keys
-   Comprehensive data-testid attributes for all interactive elements
-   Automated testing passed (11 test scenarios covering navigation, tabs, offline banner, revoke flow, renew, audit log, FAB, empty states, back navigation, card details, responsive design at mobile/tablet/desktop)

## External Dependencies

-   **React:** `react`, `react-dom`
-   **TypeScript:** `typescript`
-   **Build Tool:** `vite`
-   **UI & Animation:**
    -   `framer-motion`
    -   `lucide-react`
    -   `tailwindcss`
-   **Routing:** `wouter`
-   **State Management:** `@tanstack/react-query`
-   **Backend (Planned/Future Integration):**
    -   `express`
    -   `drizzle-orm`