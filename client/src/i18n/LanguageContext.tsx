import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './types';

// Import all translation files - they will be bundled with the app for offline support
import enTranslations from './translations/en.json';
import hiTranslations from './translations/hi.json';
import bnTranslations from './translations/bn.json';
import teTranslations from './translations/te.json';
import mrTranslations from './translations/mr.json';
import taTranslations from './translations/ta.json';
import guTranslations from './translations/gu.json';
import knTranslations from './translations/kn.json';
import mlTranslations from './translations/ml.json';
import orTranslations from './translations/or.json';
import paTranslations from './translations/pa.json';
import asTranslations from './translations/as.json';

type Translations = typeof enTranslations;

const translationMap: Partial<Record<LanguageCode, Translations>> = {
  en: enTranslations,
  hi: hiTranslations,
  bn: bnTranslations,
  te: teTranslations,
  mr: mrTranslations,
  ta: taTranslations,
  gu: guTranslations,
  kn: knTranslations,
  ml: mlTranslations,
  or: orTranslations,
  pa: paTranslations,
  as: asTranslations,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'arogya_vault_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Load language from localStorage or default to browser language or English
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (SUPPORTED_LANGUAGES.some(lang => lang.code === saved))) {
      return saved as LanguageCode;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    const matchedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
    if (matchedLang) {
      return matchedLang.code;
    }
    
    return DEFAULT_LANGUAGE;
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    console.log('[LanguageContext] Setting language to:', lang);
    setLanguageState(lang);
  };

  // Get translations with fallback to English
  const translations = translationMap[language] || translationMap[DEFAULT_LANGUAGE] || enTranslations;
  
  // Debug: Log if translation is missing
  if (!translationMap[language] && language !== DEFAULT_LANGUAGE) {
    console.warn(`[LanguageContext] Translation for '${language}' not found, falling back to English`);
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for translations with type safety
export function useTranslation() {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  return { t, language, setLanguage, supportedLanguages };
}

