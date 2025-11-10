# Arogya Vault Auth Screen - Smoke Test Checklist

## 🎯 Pre-Test Setup

- [ ] Application is running on `http://localhost:5000`
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible for monitoring logs
- [ ] Network tab available for debugging

## 📱 Visual & Layout Tests

### Mobile View (390px)
- [ ] App loads without errors
- [ ] Logo displays with animation (scale + rotate)
- [ ] Logo size: 72x72px with gradient background
- [ ] Shield icon with checkmark visible and animated
- [ ] Gradient background: blue-50/30 overlay present
- [ ] Language toggle (EN/हिं) visible top-right
- [ ] Guided Mode button visible and clickable
- [ ] Main heading "Arogya Vault" centered and bold
- [ ] Subtitle "Your Health. Your Control." below heading
- [ ] White card with rounded corners (rounded-3xl)
- [ ] Card shadow visible and subtle
- [ ] No horizontal scroll at any point

### Tablet View (768px)
- [ ] Container width increases appropriately (max-w-md)
- [ ] Logo scales to 80x80px
- [ ] Typography increases (text sizes scale up)
- [ ] Card padding increases to 32px (p-8)
- [ ] All elements remain centered
- [ ] Touch targets remain ≥44px

### Desktop View (1024px+)
- [ ] Container max-width: lg (512px)
- [ ] All text remains readable
- [ ] Spacing feels comfortable
- [ ] Hover states work on buttons
- [ ] No layout shifts

### TV/Large Display (1920px+)
- [ ] Container max-width: xl (576px)
- [ ] Content doesn't over-stretch
- [ ] Maintains visual balance
- [ ] Text remains legible

## 🎨 Component & Interaction Tests

### Phone Input Field
- [ ] Input field has +91 prefix with phone icon
- [ ] Prefix area has gray background (bg-gray-50)
- [ ] Input accepts numbers only
- [ ] Input limited to 10 digits maximum
- [ ] Placeholder text: "Enter mobile number"
- [ ] Border: gray-200 default
- [ ] Border changes to blue-500 on focus
- [ ] Helper text below: "We'll send a 6-digit OTP"

### Phone Validation
- [ ] Empty input: button disabled (gray)
- [ ] Invalid number (e.g., 1234567890): button disabled
- [ ] Valid number (e.g., 9876543210): button enabled (blue)
- [ ] Error appears for invalid with AlertCircle icon
- [ ] Error: "Invalid number" in red
- [ ] Error animates in smoothly (opacity + y)
- [ ] Error clears when user types

### Continue with OTP Button
- [ ] Disabled state: gray background, gray text
- [ ] Enabled state: blue-600 background, white text
- [ ] Shadow: shadow-lg shadow-blue-200 when enabled
- [ ] Hover: darkens to blue-700
- [ ] Active: scales to 0.98
- [ ] Click triggers loading state
- [ ] Loading: Shows spinner + "Sending OTP..." text
- [ ] Loading lasts ~1.5 seconds
- [ ] Alert appears: "OTP will be sent to {number}"
- [ ] Console log: "📱 Continue with OTP for phone: {number}"

### Alternative Sign-In Buttons

#### ABHA ID Button
- [ ] Full width, rounded-xl
- [ ] Border: 2px solid gray-200
- [ ] Text: "Use ABHA ID"
- [ ] Hover: bg-gray-50, border-gray-300
- [ ] Click shows alert: "ABHA ID authentication (ABHA screen coming soon)"
- [ ] Console log: "🏥 Continue with ABHA ID"

#### Guest & Email Buttons (Side-by-side)
- [ ] Two buttons in flex row with gap-3
- [ ] Each takes 50% width (flex-1)
- [ ] Guest button: "Continue as guest"
- [ ] Email button: Mail icon + "Continue with Email"
- [ ] Both have border, rounded corners
- [ ] Hover: bg-gray-50
- [ ] Guest click: Alert "Guest mode (Guest flow coming soon)"
- [ ] Email click: Alert "Email authentication (Email screen coming soon)"
- [ ] Console logs: "👤 Continue as guest" and "📧 Continue with email"

### Language Switcher
- [ ] Top-right corner button
- [ ] Shows "EN" or "हिं" based on current language
- [ ] ChevronDown icon visible
- [ ] Click opens dropdown menu
- [ ] Dropdown animates in (opacity 0→1, y -10→0)
- [ ] Dropdown positioned below button (right-aligned)
- [ ] White background, rounded-xl, shadow-lg
- [ ] Two options: "English" and "हिंदी"
- [ ] Current language shown in bold blue-600
- [ ] Other language in gray-700
- [ ] Hover: bg-blue-50
- [ ] Click language updates entire UI
- [ ] Dropdown closes after selection
- [ ] Click outside closes dropdown

### Guided Mode Toggle
- [ ] Button top-right (left of language)
- [ ] Text: "Guided Mode" or "गाइडेड मोड"
- [ ] Hover: text-blue-600, bg-blue-50
- [ ] Click toggles mode
- [ ] Mode ON: All text increases by 1-2 sizes
- [ ] Mode ON: Button padding increases (py-5 vs py-4)
- [ ] Mode ON: Headings scale up (3xl vs 2xl)
- [ ] Mode OFF: Returns to normal sizes
- [ ] Works in both languages

### Privacy Information Sheet
- [ ] "Your data is encrypted" button in center
- [ ] Lock icon + Info icon present
- [ ] Click opens bottom sheet
- [ ] Overlay appears (black/40)
- [ ] Click overlay closes sheet
- [ ] Sheet slides up from bottom (spring animation)
- [ ] Sheet has drag handle at top
- [ ] Lock icon in blue circle
- [ ] Heading: "Your Privacy" or "आपकी गोपनीयता"
- [ ] Two privacy statements in correct language
- [ ] "Got it" or "समझ गया" button (blue)
- [ ] Click button closes sheet
- [ ] Sheet slides down on close
- [ ] Overlay fades out

### Footer Links
- [ ] "Terms & Privacy" link left
- [ ] Bullet separator "•"
- [ ] "Need help?" link right
- [ ] Both links: text-gray-500
- [ ] Hover: text-blue-600
- [ ] Positioned at bottom (mt-auto)

## 🌍 Language Tests

### English (EN)
- [ ] App name: "Arogya Vault"
- [ ] Subtitle: "Your Health. Your Control."
- [ ] Sign in title: "Sign in to continue"
- [ ] Phone placeholder: "Enter mobile number"
- [ ] Helper: "We'll send a 6-digit OTP."
- [ ] Button: "Continue with OTP"
- [ ] ABHA: "Use ABHA ID"
- [ ] Guest: "Continue as guest"
- [ ] Email: "Continue with Email"
- [ ] Trust: "Your data is encrypted. You control access."

### Hindi (हिं)
- [ ] App name: "मेडीलॉकर"
- [ ] Subtitle: "आपका स्वास्थ्य। आपका नियंत्रण।"
- [ ] Sign in: "लॉगिन करें"
- [ ] Phone placeholder: "मोबाइल नंबर दर्ज करें"
- [ ] Helper: "हम 6 अंकों का OTP भेजेंगे।"
- [ ] Button: "OTP के साथ जारी रखें"
- [ ] ABHA: "ABHA ID इस्तेमाल करें"
- [ ] Loading: "OTP भेजा जा रहा है..."

## 🎭 Animation Tests

### Page Load Animations
- [ ] Logo: Scale 0.8→1, opacity 0→1, rotate -5→0
- [ ] Logo: Duration 0.7s, spring animation
- [ ] Logo: Pulsing glow (3s infinite loop)
- [ ] Heading: Slides up (y: 20→0), opacity 0→1, delay 0.2s
- [ ] Card: Slides up (y: 30→0), opacity 0→1, delay 0.4s
- [ ] Privacy button: Opacity 0→1, delay 0.6s
- [ ] Shield checkmark path: Animates in (1.5s)

### Interaction Animations
- [ ] Button active: Scale 0.98
- [ ] Language dropdown: Smooth in/out
- [ ] Error message: Smooth in/out
- [ ] Privacy sheet: Spring slide up/down
- [ ] Overlay: Fade in/out

## ♿ Accessibility Tests

### ARIA Labels
- [ ] Guided mode button: aria-label present
- [ ] Language toggle: aria-label + aria-expanded
- [ ] Language menu: role="menu"
- [ ] Menu items: role="menuitem"
- [ ] Phone input: aria-label, aria-invalid, aria-describedby
- [ ] Error: role="alert"
- [ ] Privacy sheet: role="dialog", aria-labelledby
- [ ] All buttons have descriptive aria-labels

### Data Test IDs
- [ ] button-guided-mode
- [ ] button-language-toggle
- [ ] button-language-en
- [ ] button-language-hi
- [ ] input-phone-number
- [ ] button-continue-otp
- [ ] button-continue-abha
- [ ] button-continue-guest
- [ ] button-continue-email
- [ ] button-privacy-info
- [ ] button-terms-privacy
- [ ] button-need-help
- [ ] button-privacy-close
- [ ] overlay-privacy-sheet

### Keyboard Navigation
- [ ] Tab moves through all interactive elements
- [ ] Tab order is logical (top to bottom)
- [ ] Enter activates buttons
- [ ] Escape closes language dropdown
- [ ] Escape closes privacy sheet
- [ ] Focus states visible on all elements

### Screen Reader
- [ ] Logo has alt text (via SVG title)
- [ ] Error messages announce
- [ ] Button states announce (loading, disabled)
- [ ] Language change announces
- [ ] Privacy sheet heading read correctly

## 🔍 Console & Network

### Console Logs (No Errors)
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No dependency warnings
- [ ] Stub handlers log correctly:
  - 📱 Continue with OTP
  - 🏥 Continue with ABHA ID
  - 👤 Continue as guest
  - 📧 Continue with email

### Performance
- [ ] Page loads in <2s
- [ ] Animations run at 60fps
- [ ] No layout shift (CLS)
- [ ] No memory leaks
- [ ] Responsive interactions <100ms

## 📊 Cross-Browser Tests

### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] Layout correct

### Safari
- [ ] Gradient renders correctly
- [ ] Framer Motion works
- [ ] Touch targets work

### Firefox
- [ ] All functionality works
- [ ] Styling matches Chrome
- [ ] No warnings

### Edge
- [ ] Identical to Chrome
- [ ] No compatibility issues

## 🎯 Edge Cases

- [ ] Enter exactly 10 digits: Button enables
- [ ] Enter 9 digits: Button stays disabled
- [ ] Enter 11 digits: Input prevents (max 10)
- [ ] Enter letters: Input rejects (numbers only)
- [ ] Enter 0-5 as first digit: Validation fails
- [ ] Enter 6-9 as first digit: Validation allows
- [ ] Toggle language mid-input: Input persists
- [ ] Toggle guided mode: No layout break
- [ ] Resize window rapidly: No UI glitch
- [ ] Click OTP button repeatedly: Single submit

## ✅ Final Checklist

- [ ] All visual elements render correctly
- [ ] All interactions work as expected
- [ ] Responsive on all screen sizes
- [ ] Accessibility features functional
- [ ] No console errors or warnings
- [ ] Language switching works perfectly
- [ ] Guided mode scales appropriately
- [ ] All stub handlers log correctly
- [ ] Alerts show for "coming soon" features
- [ ] Feature flags documented
- [ ] Code is clean and well-structured
- [ ] Documentation complete

## 🚀 Ready for Review

Once all items checked:
- [ ] Take screenshots at different breakpoints
- [ ] Record video of interactions (optional)
- [ ] Document any issues found
- [ ] Mark task as complete
- [ ] Await user approval for Screen 1
- [ ] Prepare for Screen 2 (OTP) implementation

---

**Test Date**: _____________  
**Tester**: _____________  
**Result**: ⬜ Pass  ⬜ Fail  
**Notes**: _____________
