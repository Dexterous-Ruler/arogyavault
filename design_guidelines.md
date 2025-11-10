# Arogya Vault Design Guidelines

## Design Approach
**Reference-Based Healthcare Design** - Drawing inspiration from health-tech leaders like Apollo 24/7, Practo, and government health platforms (ABHA), combined with consumer app polish similar to payment apps (PhonePe, Paytm) for trust and accessibility.

## Core Design Principles
1. **Trust & Security First** - Visual elements must reinforce data security and medical credibility
2. **Accessibility & Inclusivity** - Guided Mode support with scalable UI, multi-language (English/Hindi)
3. **Simplicity in Healthcare** - Remove complexity from medical data management through clean, intuitive interfaces

## Color Palette

**Primary Colors (Light Mode)**
- Primary Blue: 217 91% 60% (Blue 500) - Trust, medical professionalism
- Deep Blue: 239 84% 67% (Blue 600) - Primary actions, emphasis
- Indigo Accent: 239 84% 67% (Indigo 700) - Depth in gradients

**Neutral Colors**
- Background: 0 0% 100% (Pure White) - Clean, clinical
- Surface: 0 0% 98% (Gray 50) - Subtle card backgrounds
- Border: 0 0% 89% (Gray 200) - Soft divisions
- Text Primary: 0 0% 13% (Gray 900)
- Text Secondary: 0 0% 45% (Gray 600)

**Functional Colors**
- Error: 0 84% 60% (Red 600)
- Success: 142 71% 45% (Green 600)
- Warning: 38 92% 50% (Amber 500)

**Gradients** - Use sparingly for emphasis:
- Hero/Logo: from-blue-500 via-blue-600 to-indigo-700
- Subtle background: from-blue-50/30 to-transparent

## Typography

**Font Family**: System font stack for optimal performance and native feel
- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Use Google Fonts "Inter" if enhanced typography needed

**Scale (Default Mode)**
- Display/Hero: text-3xl (28px) font-bold
- H1: text-2xl (24px) font-bold  
- H2: text-xl (20px) font-bold
- Body Large: text-base (16px) font-medium
- Body: text-sm (14px) font-normal
- Caption: text-xs (12px) font-medium

**Guided Mode Scaling** (Accessibility)
- Increase all sizes by 1-2 steps (e.g., text-sm → text-base)
- Minimum touch targets: 44px (py-5 for buttons)

## Layout System

**Spacing Primitives** - Tailwind units: 2, 3, 4, 6, 8, 12
- Component padding: p-6 (24px)
- Section spacing: mb-6, mb-12 (24px, 48px)
- Element gaps: gap-2, gap-3 (8px, 12px)
- Input padding: px-4 py-4 (16px vertical)

**Container Widths**
- Mobile max-width: max-w-[390px] mx-auto (iPhone-optimized)
- Tablet: max-w-2xl
- Desktop: max-w-4xl
- Content padding: px-6 (mobile), px-8 (tablet+)

**Responsive Breakpoints**
- Mobile: base (default)
- Tablet: md: (768px)
- Desktop: lg: (1024px)
- TV/Large: xl: (1280px)

## Component Library

### Buttons
- Primary: rounded-xl bg-blue-600 text-white py-4 px-6, shadow-lg shadow-blue-200
- Secondary: rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200
- Disabled: bg-gray-200 text-gray-400 cursor-not-allowed
- Active state: transform active:scale-[0.98]

### Input Fields
- Container: rounded-xl border-2 border-gray-200 focus-within:border-blue-500
- Prefix area: bg-gray-50 border-r-2 px-4
- Input: px-4 py-4 bg-white outline-none
- Error state: border-red-500 with error icon + message

### Cards/Surfaces
- Background: bg-white
- Border radius: rounded-3xl (large cards), rounded-xl (inputs/buttons)
- Shadow: shadow-xl shadow-gray-200/50
- Border: border border-gray-100

### Icons
- Size: w-4 h-4 (standard), w-5 h-5 (emphasized)
- Library: Lucide React
- Colors: text-gray-500 (inactive), text-blue-600 (active)

### Logo/Branding
- Size: 72x72px rounded-[20px]
- Multi-layer gradient with glow effects
- Shield + checkmark icon in white
- Gradient overlay and glass-morphism effect

## Animations

**Principles**: Use sparingly, prioritize performance
- Page entrance: y: 20→0, opacity: 0→1, delay: 0.2-0.4s
- Micro-interactions: scale, opacity transitions (150-300ms)
- Loading states: Spinner with "animate-spin"
- Modal/Sheet: AnimatePresence with slide-up (y: 10→0)

**Avoid**: Continuous background animations, parallax on mobile

## Accessibility Features

**Guided Mode Toggle**
- Increases all text by 1-2 sizes
- Larger touch targets (py-5 vs py-4)
- Enhanced spacing between elements
- Maintains color contrast ratios (WCAG AA minimum)

**Multi-Language Support**
- Language switcher (EN/हिं) top-right
- RTL-ready layout structure
- Locale-aware number formatting

**Form Accessibility**
- Real-time validation feedback
- Error messages with icons
- Disabled state clearly indicated
- Focus states visible (border color change)

## Images & Media

**Logo/Branding**: Custom SVG with gradient fills (provided in code)
**Illustrations**: Use minimal line-art medical illustrations if needed
**No Stock Photos**: Medical apps should avoid generic stock imagery
**Icons Only**: Lucide React icon set for all UI elements

## Mobile-First Considerations

**Touch Optimization**
- Minimum tap target: 44x44px
- Adequate spacing between interactive elements (gap-3 minimum)
- Bottom-sheet modals for mobile (vs centered on desktop)

**Performance**
- Minimize animation complexity on mobile
- Use CSS transforms over layout properties
- Lazy load non-critical components

**Responsive Patterns**
- Stack vertically on mobile
- Side-by-side on tablet/desktop where appropriate
- Hide secondary actions in mobile menus if needed

## Trust & Security Visual Language

- Shield iconography for security features
- Lock icons for encrypted data
- Gradient overlays suggest depth/protection
- Soft shadows (not harsh) for elevation
- Clean white backgrounds = clinical/trustworthy
- Blue color psychology = healthcare, trust, calm

## Key UI Patterns

1. **Authentication Flow**: Card-based with clear CTAs, prefix phone input, alternative methods separated by dividers
2. **Language Toggle**: Dropdown menu (top-right) with current language indicator
3. **Privacy/Help**: Bottom-sheet modals with smooth slide-up animation
4. **Loading States**: Inline spinners + descriptive text, disabled button states
5. **Error Handling**: Inline validation with icon + message (AnimatePresence)