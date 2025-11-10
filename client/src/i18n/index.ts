/**
 * Centralized i18n exports
 * All translations are loaded dynamically via HTTP backend
 */

export { useTranslation } from './useTranslation';
export { LanguageSelector } from './LanguageSelector';
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode, type Language } from './types';
export { default as i18n } from './i18n';
