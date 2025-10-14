# MediLocker - Health Data Management Platform

## Overview

MediLocker is a responsive web application for secure, encrypted management of medical records, empowering users with complete ownership and access to their health data. It aims to address privacy concerns and fragmented records, offering a seamless multi-device experience with a focus on UI-first development and accessibility.

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
-   **Emergency Page:** Displays emergency info (blood group, allergies, contacts) and features like nominee management.
-   **Nominee Management:** Lists nominees with details, provides a 3-step wizard to add new nominees, and allows revoking access.
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