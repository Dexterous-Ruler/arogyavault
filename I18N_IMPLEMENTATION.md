# Multi-Language Support Implementation

## Overview
A comprehensive, offline-capable multi-language system has been implemented for Arogya Vault, supporting **12 Indian languages**:

1. **English** (en) - Default
2. **Hindi** (hi) - हिंदी
3. **Bengali** (bn) - বাংলা
4. **Telugu** (te) - తెలుగు
5. **Marathi** (mr) - मराठी
6. **Tamil** (ta) - தமிழ்
7. **Gujarati** (gu) - ગુજરાતી
8. **Kannada** (kn) - ಕನ್ನಡ
9. **Malayalam** (ml) - മലയാളം
10. **Odia** (or) - ଓଡ଼ିଆ
11. **Punjabi** (pa) - ਪੰਜਾਬੀ
12. **Assamese** (as) - অসমীয়া

## Features

✅ **Offline Support**: All translations are bundled with the app - no network required
✅ **Automatic Language Detection**: Detects browser language on first load
✅ **Persistent Storage**: Language preference saved to localStorage
✅ **Type-Safe**: Full TypeScript support with autocomplete
✅ **Fallback System**: Falls back to English if translation is missing
✅ **Easy to Use**: Simple hook-based API

## Architecture

### File Structure
```
client/src/i18n/
├── types.ts                    # Language types and constants
├── LanguageContext.tsx         # React context provider
├── LanguageSelector.tsx        # Language selector component
├── index.ts                    # Public exports
└── translations/
    ├── en.json                 # English (base)
    ├── hi.json                 # Hindi
    ├── bn.json                 # Bengali
    ├── te.json                 # Telugu
    ├── mr.json                 # Marathi
    ├── ta.json                 # Tamil
    ├── gu.json                 # Gujarati
    ├── kn.json                 # Kannada
    ├── ml.json                 # Malayalam
    ├── or.json                 # Odia
    ├── pa.json                 # Punjabi
    └── as.json                 # Assamese
```

### Translation File Structure
Each translation file follows this structure:
```json
{
  "common": {
    "appName": "...",
    "subtitle": "...",
    "back": "...",
    "next": "...",
    ...
  },
  "auth": {
    "signInTitle": "...",
    "signInDesc": "...",
    ...
  },
  "dashboard": { ... },
  "vault": { ... },
  "document": { ... },
  "profile": { ... },
  "onboarding": { ... },
  "emergency": { ... },
  "consent": { ... },
  "nominee": { ... }
}
```

## Usage

### 1. Using Translations in Components

```tsx
import { useTranslation } from '@/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t.common.appName}</h1>
      <p>{t.auth.signInTitle}</p>
      <button>{t.common.save}</button>
    </div>
  );
}
```

### 2. Accessing Current Language

```tsx
import { useTranslation } from '@/i18n';

function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('hi')}>
        Switch to Hindi
      </button>
    </div>
  );
}
```

### 3. Using Language Selector Component

```tsx
import { LanguageSelector } from '@/i18n/LanguageSelector';

function MyComponent() {
  return (
    <div>
      {/* Default variant - shows full language name */}
      <LanguageSelector />
      
      {/* Compact variant - shows only native name */}
      <LanguageSelector variant="compact" />
    </div>
  );
}
```

### 4. Getting All Supported Languages

```tsx
import { useTranslation, SUPPORTED_LANGUAGES } from '@/i18n';

function MyComponent() {
  const { supportedLanguages } = useTranslation();
  
  return (
    <select>
      {supportedLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.nativeName})
        </option>
      ))}
    </select>
  );
}
```

## Migration Guide

### Updating Existing Components

**Before:**
```tsx
const translations = {
  en: {
    title: 'My Title',
    description: 'My Description'
  },
  hi: {
    title: 'मेरा शीर्षक',
    description: 'मेरा विवरण'
  }
};

function MyComponent() {
  const [language, setLanguage] = useState('en');
  const t = translations[language];
  
  return <h1>{t.title}</h1>;
}
```

**After:**
```tsx
import { useTranslation } from '@/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t.mySection.title}</h1>;
}
```

### Steps to Migrate a Component:

1. **Remove local translations object**
2. **Import `useTranslation` hook**
3. **Replace `translations[language]` with `t`**
4. **Update translation keys** to use nested structure (e.g., `t.auth.signInTitle`)
5. **Remove local language state** (handled by context)
6. **Replace language selector** with `<LanguageSelector />` if present

## Adding New Translations

### 1. Add to English Base File

Edit `client/src/i18n/translations/en.json`:
```json
{
  "mySection": {
    "newKey": "New Translation"
  }
}
```

### 2. Add to Other Language Files

Edit the corresponding files (e.g., `hi.json`, `bn.json`, etc.):
```json
{
  "mySection": {
    "newKey": "नया अनुवाद"  // Hindi translation
  }
}
```

### 3. Use in Component

```tsx
const { t } = useTranslation();
return <p>{t.mySection.newKey}</p>;
```

## Language Detection & Persistence

- **First Load**: Detects browser language, falls back to English if not supported
- **Storage**: Language preference saved to `localStorage` with key `arogya_vault_language`
- **Persistence**: Language persists across page reloads and browser sessions
- **Offline**: Works completely offline - all translations bundled with app

## Implementation Status

✅ **Completed:**
- i18n system architecture
- 12 language translation files (structure complete)
- LanguageContext and useTranslation hook
- LanguageSelector component
- Language persistence (localStorage)
- App integration (LanguageProvider in App.tsx)
- Example migration (MediLockerAuthPage.tsx)

🔄 **In Progress:**
- Migrating remaining components to use centralized translations

## Notes

1. **Translation Quality**: Currently, English, Hindi, Bengali, and Telugu have complete translations. Other languages use English as placeholder and should be updated with proper translations.

2. **Adding More Languages**: To add a new language:
   - Add language code to `types.ts`
   - Create new JSON file in `translations/`
   - Import and add to `translationMap` in `LanguageContext.tsx`

3. **Offline Guarantee**: All translation files are imported statically, ensuring they're bundled with the app and available offline.

4. **Performance**: Translations are loaded once at app startup - no runtime fetching required.

## Example: Updated Component

See `client/src/components/MediLockerAuthPage.tsx` for a complete example of a migrated component using the new translation system.

