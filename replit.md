# Arogya Vault - Health Data Management Platform

## Overview

Arogya Vault is a responsive web application for secure, encrypted management of medical records, empowering users with complete ownership and access to their health data. It aims to address privacy concerns and fragmented records, offering a seamless multi-device experience with a focus on UI-first development and accessibility.

## Recent Changes

**October 14, 2025:**
- **Profile Settings Screen:** Implemented comprehensive settings management screen with full navigation integration
  - Created ProfileSettingsScreen component with four main sections: Language & Accessibility, Security, Health & Nominee, Legal & Support
  - Language toggle supports EN/HI with real-time UI updates
  - Guided Mode toggle for accessibility (larger text, icons)
  - Security settings: PIN setup and biometric authentication options
  - Health management: Quick access to Emergency Card and Nominee Management
  - Legal/Support: Help & FAQ, Contact Support, Privacy Policy, Terms of Service (stubbed for backend)
  - Logout button with confirmation flow
  - Fully wired navigation: Home → Profile (via bottom nav), Profile → Emergency/Nominees, Profile → Home (back button)
  - All interactive elements have data-testid attributes for testing
  - Bilingual support throughout with translation keys

- **Emergency Card Edit Functionality:** Added comprehensive edit modal for patient information with proper form validation
  - Implemented using react-hook-form with zodResolver for Zod schema validation
  - All patient fields are editable: Name, Blood Group, Allergies, Chronic Conditions, Current Medications, Age, Address
  - Age validation enforces positive integers (1-150) with appropriate error messages
  - Form validation prevents submission of invalid data (empty fields, invalid age, etc.)
  - Modal includes Save/Cancel functionality with proper state management
  - Uses shadcn Form components for consistent UI/UX

## User Preferences

-   **Communication Style:** I prefer direct and concise communication.
-   **Workflow:** I prefer an iterative and incremental development approach, focusing on one screen at a time.
-   **Interaction:**
    -   Implement exact UI from provided designs; do not redesign or improvise.
    -   Create thin screen containers with stubbed handlers.
    -   Expose routes for preview.
    -   Add accessibility without changing visuals.
    -   Use feature flags for controlled navigation and rollouts.
    -   Test responsiveness across all defined breakpoints (mobile, tablet, desktop, TV).
    -   Verify accessibility (ARIA, keyboard navigation).
    -   Obtain user approval before implementing behavior or proceeding to the next screen.

## System Architecture

**UI/UX Decisions:**
-   **Design Approach:** UI-First Development, pixel-perfect rendering from designs.
-   **Color Scheme:** Trust-oriented blue palette, gray for text, functional red/green for status.
-   **Typography:** System font stack, scalable for accessibility (Guided Mode).
-   **Responsive Design:** Mobile-first approach, scaling to 4K displays with breakpoints for mobile (max 390px), tablet (768px+), desktop (1024px+), and large screens/TV (1280px+).
-   **Accessibility:** WCAG AA compliance, multi-language support (English/Hindi), Guided Mode.

**Technical Implementations:**
-   **Frontend:** React 18 with TypeScript, Vite.
-   **Routing:** Wouter.
-   **Styling:** Tailwind CSS with custom design system.
-   **Animations:** Framer Motion.
-   **State Management:** React Query (TanStack Query v5).
-   **Iconography:** Lucide React.
-   **Feature Flagging:** `client/src/config/featureFlags.ts` for controlled rollouts.

**Feature Specifications:**
-   **Authentication:** Phone number input (Indian format) with OTP, ABHA ID/Email/Guest sign-in.
-   **Onboarding:** Multi-slide carousel introducing features.
-   **Home Dashboard:** Sticky header, quick action cards, recent documents, AI insights, nearby services, bottom navigation.
-   **Vault Document Timeline:** Secure vault with search, type filters, document cards, FAB for adding documents (Camera/File Upload/QR Scan/DICOM), offline sync banner.
-   **Add Document Wizard:** 4-step modal for document addition (capture, processing, OCR metadata editing, review, success). Supports bilingual UI and bidirectional navigation.
-   **Consent Center:** Privacy-focused consent management with Active/Pending/Expired tabs, role-specific consent cards, revoke/renew actions, audit log.
-   **Grant Consent Flow:** 5-step wizard for granting consent (recipient, scope, duration/purpose, confirmation with PIN/biometric, success with QR/share options).
-   **Emergency Card Screen:** Comprehensive emergency card with QR code for offline scanning, patient information (name, blood group, allergies, chronic conditions, medications, age, address), recent medical data (last 3 prescriptions, last 2 lab reports), nominee access section with manage button, and Hindi localization banner with Globe icon. Features edit functionality with validated form (using react-hook-form + Zod) to update patient details.
-   **Nominee Management:** Lists nominees with details, provides a 3-step wizard to add new nominees, and allows revoking access.
-   **Profile Settings Screen:** Comprehensive settings management with Language & Accessibility (EN/HI toggle, Guided Mode), Security (PIN setup, biometric auth), Health & Nominee (Emergency Card access, Manage Nominees), Legal & Support (FAQ, Contact, Privacy, Terms), and Logout functionality. Accessible via bottom navigation Profile tab.
-   **Security:** End-to-end encryption (UI), privacy-first design, planned ABHA ID integration, secure vault.

**System Design Choices:**
-   **Modular Structure:** Clear separation of concerns (`components`, `pages`, `config`, `lib`).
-   **Progressive Enhancement:** Iterative screen development and integration.
-   **Storage:** In-memory (MemStorage) for MVP, with future plans for robust persistent backend.

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