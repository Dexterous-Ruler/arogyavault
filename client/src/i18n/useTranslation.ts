/**
 * Custom useTranslation hook
 * Wraps react-i18next's useTranslation with our custom types
 * Provides nested access like t.common.appName for backward compatibility
 */

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './i18n';
import type { LanguageCode } from './types';

export function useTranslation() {
  const { t: translate, i18n } = useI18nextTranslation();
  
  const language = (i18n.language || 'en') as LanguageCode;
  
  const setLanguage = (lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('arogya_vault_language', lang);
  };
  
  // Create a proxy object that supports nested access like t.common.appName
  // This allows backward compatibility with existing code
  const createNestedProxy = (prefix: string) => {
    return new Proxy({} as any, {
      get: (_target, prop: string) => {
        const key = prefix ? `${prefix}.${prop}` : prop;
        const value = translate(key);
        // If the value is the same as the key, it means translation is missing
        // Return undefined to allow fallback behavior
        if (value === key) {
          return undefined;
        }
        return value;
      }
    });
  };
  
  // Provide nested access to translations
  const translations = {
    get common() { return createNestedProxy('common'); },
    get auth() { return createNestedProxy('auth'); },
    get dashboard() { return createNestedProxy('dashboard'); },
    get vault() { return createNestedProxy('vault'); },
    get profile() { return createNestedProxy('profile'); },
    get onboarding() { return createNestedProxy('onboarding'); },
    get otpVerification() { return createNestedProxy('otpVerification'); },
    get addDocument() { return createNestedProxy('addDocument'); },
    get documentDetail() { return createNestedProxy('documentDetail'); },
    get consentCenter() { return createNestedProxy('consentCenter'); },
    get emergencyCard() { return createNestedProxy('emergencyCard'); },
    get nomineeManagement() { return createNestedProxy('nomineeManagement'); },
  };
  
  return {
    t: translate, // Direct translation function: t('common.appName')
    translations, // Nested access: t.common.appName (for backward compatibility)
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading: !i18n.isInitialized,
  };
}
