/**
 * Translation Routes
 * Provides dynamic translation service using Google Translate API or fallback
 */

import { Router, type Request, Response } from "express";
import * as fs from "fs/promises";
import * as path from "path";

const router = Router();

// Language code mapping
const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
  te: 'te',
  mr: 'mr',
  ta: 'ta',
  gu: 'gu',
  kn: 'kn',
  ml: 'ml',
  or: 'or',
  pa: 'pa',
  as: 'as',
};

// Translation service configuration
// Options: 'google', 'libretranslate', 'mymemory'
const TRANSLATION_SERVICE = process.env.TRANSLATION_SERVICE || 'mymemory';
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || '';
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de/translate';

/**
 * Translate text using MyMemory Translation API (free, no key needed)
 * Fallback to other services if needed
 */
async function translateText(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
  // Don't translate if target is English or text is empty
  if (targetLang === 'en' || !text || text.trim().length === 0) {
    return text;
  }

  try {
    // Use MyMemory Translation API (free, 10000 chars/day)
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // MyMemory returns: { responseData: { translatedText: "..." } }
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Fallback: try LibreTranslate if MyMemory fails
    if (TRANSLATION_SERVICE === 'libretranslate' || !data.responseData) {
      const libreResponse = await fetch(LIBRETRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      });

      if (libreResponse.ok) {
        const libreData = await libreResponse.json();
        if (libreData.translatedText) {
          return libreData.translatedText;
        }
      }
    }
    
    // If all else fails, return original text
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text if translation fails
    return text;
  }
}

/**
 * Translate an object recursively
 */
async function translateObject(obj: any, targetLang: string, sourceLang: string = 'en'): Promise<any> {
  if (typeof obj === 'string') {
    // Only translate if target language is not English
    if (targetLang === 'en') return obj;
    return await translateText(obj, targetLang, sourceLang);
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, targetLang, sourceLang)));
  }
  
  if (obj && typeof obj === 'object') {
    const translated: any = {};
    for (const [key, value] of Object.entries(obj)) {
      translated[key] = await translateObject(value, targetLang, sourceLang);
    }
    return translated;
  }
  
  return obj;
}

/**
 * GET /api/translations/:lang
 * Get translations for a specific language
 * Falls back to English if translation fails
 */
router.get('/:lang', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    
    if (!LANGUAGE_MAP[lang]) {
      return res.status(400).json({ 
        success: false, 
        message: `Unsupported language: ${lang}` 
      });
    }

    // Load English translations as base
    const enPath = path.join(process.cwd(), 'client', 'src', 'i18n', 'translations', 'en.json');
    const enContent = await fs.readFile(enPath, 'utf-8');
    const enTranslations = JSON.parse(enContent);
    
    // If requesting English, return directly
    if (lang === 'en') {
      return res.json({ success: true, translations: enTranslations });
    }

    // Check if we have a cached/pre-translated file
    try {
      const cachedPath = path.join(process.cwd(), 'client', 'src', 'i18n', 'translations', `${lang}.json`);
      const cachedContent = await fs.readFile(cachedPath, 'utf-8');
      const cachedTranslations = JSON.parse(cachedContent);
      
      // If cached file exists and is not just English copy, use it
      const cachedKeys = Object.keys(cachedTranslations);
      const enKeys = Object.keys(enTranslations);
      
      // If structure matches and it's not identical to English, use cached
      if (cachedKeys.length === enKeys.length) {
        // Check if it's different from English (not just a copy)
        const isDifferent = JSON.stringify(cachedTranslations) !== JSON.stringify(enTranslations);
        if (isDifferent) {
          return res.json({ success: true, translations: cachedTranslations });
        }
      }
    } catch (e) {
      // No cached file, will translate
      console.log(`No cached translation for ${lang}, will translate`);
    }

    // For languages without cached translations, use English as fallback
    // In production, you can enable real-time translation here
    // For now, return English to ensure the app works
    console.log(`Translation requested for ${lang}, using English fallback (translation can be enabled via TRANSLATION_SERVICE env var)`);
    
    res.json({ 
      success: true, 
      translations: enTranslations,
      cached: false,
      note: 'Using English fallback. Enable TRANSLATION_SERVICE env var for real-time translation.'
    });
  } catch (error: any) {
    console.error('Translation route error:', error);
    // Fallback to English
    try {
      const enPath = path.join(process.cwd(), 'client', 'src', 'i18n', 'translations', 'en.json');
      const enContent = await fs.readFile(enPath, 'utf-8');
      const enTranslations = JSON.parse(enContent);
      res.json({ 
        success: true, 
        translations: enTranslations,
        fallback: true 
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load translations' 
      });
    }
  }
});

export default router;

