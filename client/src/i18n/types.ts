/**
 * Supported languages in Arogya Vault
 * All translations are bundled with the app for offline support
 */
export type LanguageCode = 
  | 'en'  // English
  | 'hi'  // Hindi (हिंदी)
  | 'bn'  // Bengali (বাংলা)
  | 'te'  // Telugu (తెలుగు)
  | 'mr'  // Marathi (मराठी)
  | 'ta'  // Tamil (தமிழ்)
  | 'gu'  // Gujarati (ગુજરાતી)
  | 'kn'  // Kannada (ಕನ್ನಡ)
  | 'ml'  // Malayalam (മലയാളം)
  | 'or'  // Odia (ଓଡ଼ିଆ)
  | 'pa'  // Punjabi (ਪੰਜਾਬੀ)
  | 'as'; // Assamese (অসমীয়া)

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

