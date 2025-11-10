# Arogya Vault Responsive Design Guide

## 📱 Responsive Breakpoints

The Arogya Vault Auth page is designed to work seamlessly across all screen types:

### Mobile First Approach
- **Base (Mobile)**: 320px - 767px
  - Max container width: 390px (iPhone-optimized)
  - Touch-optimized buttons: 44px minimum height
  - Compact spacing and typography

### Breakpoint Scale
- **Tablet (md:)**: 768px+
  - Increased max-width: 448px (md)
  - Larger typography scale
  - Enhanced padding: 32px
  
- **Desktop (lg:)**: 1024px+
  - Max-width: 512px (lg)
  - Optimal reading width
  - Comfortable spacing

- **TV/Large Displays (xl:)**: 1280px+
  - Max-width: 576px (xl)
  - Maintains readability on large screens
  - Prevents over-stretching

## 🎨 Responsive Features

### Dynamic Typography
- **Regular Mode**: Scales from text-sm to text-base
- **Guided Mode**: Scales from text-base to text-lg
- Headings scale proportionally across breakpoints

### Touch & Interaction
- Minimum touch target: 44x44px (WCAG AAA)
- Active state: `scale(0.98)` for tactile feedback
- Hover states disabled on touch devices

### Visual Adaptations
- Logo size: 72px → 80px on larger screens
- Card padding: 24px → 32px on tablets+
- Button height: Guided mode increases by 25%

## 🧪 Testing Responsive Design

### Browser DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test these preset devices:
   - iPhone SE (375px)
   - iPhone 12/13 Pro (390px)
   - iPad Air (820px)
   - Desktop (1920px)

### Custom Viewport Testing
Test at these specific widths:
- 320px (Small mobile)
- 390px (iPhone 12/13/14)
- 768px (Tablet breakpoint)
- 1024px (Desktop breakpoint)
- 1440px (Large desktop)
- 1920px+ (TV/4K displays)

### Accessibility Testing
- **Guided Mode**: Toggle to verify 1.5x text scaling
- **Language Switch**: Test with both English and Hindi
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Test with NVDA/VoiceOver

## 📋 Feature Flags

Current screen availability (see `client/src/config/featureFlags.ts`):

✅ **Enabled**
- Auth page (Phone OTP)
- Multi-language (EN/HI)
- Guided mode
- Alternative sign-in methods (stubbed)

🚧 **Coming Soon**
- OTP verification screen
- User onboarding flow
- Home dashboard
- Secure vault
- Dark mode

## 🎯 Smoke Test Checklist

### Visual Regression
- [ ] Logo animation plays smoothly
- [ ] Gradient background renders correctly
- [ ] Cards have proper shadows and borders
- [ ] Language dropdown appears/disappears smoothly
- [ ] Privacy sheet slides up from bottom

### Functionality
- [ ] Phone input accepts only 10 digits
- [ ] Validation shows error for invalid numbers
- [ ] OTP button enables when number is valid
- [ ] Loading state shows spinner animation
- [ ] All alternative buttons trigger alerts (stubbed)
- [ ] Language switches between EN/HI
- [ ] Guided mode increases text size

### Responsive Behavior
- [ ] Container centers on all screen sizes
- [ ] Text remains readable at all breakpoints
- [ ] Buttons maintain minimum touch target
- [ ] Privacy sheet is responsive
- [ ] No horizontal scroll at any width

### Accessibility
- [ ] All buttons have data-testid attributes
- [ ] ARIA labels are present
- [ ] Keyboard navigation works
- [ ] Error messages announce to screen readers
- [ ] Focus states are visible

## 🚀 Next Steps

1. **Implement OTP Screen**: Build verification UI
2. **Onboarding Flow**: User setup and preferences
3. **Home Dashboard**: Health records overview
4. **Vault Screen**: Secure document storage
5. **Backend Integration**: Real authentication APIs
