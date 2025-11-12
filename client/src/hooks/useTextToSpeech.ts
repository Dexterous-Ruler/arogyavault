/**
 * Hook for text-to-speech using Web Speech API
 * Automatically selects a feminine voice for better user experience
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseTextToSpeechResult {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
}

/**
 * Find a feminine voice from available voices
 * Prefers voices with names containing 'female', 'woman', 'samantha', 'karen', 'susan', etc.
 */
function findFeminineVoice(lang: string = 'en-US'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Preferred feminine voice names (case-insensitive)
  const preferredNames = [
    'samantha', 'karen', 'susan', 'victoria', 'sarah', 'emily',
    'anna', 'zira', 'hazel', 'linda', 'female', 'woman'
  ];

  // First, try to find a preferred feminine voice matching the language
  for (const preferred of preferredNames) {
    const voice = voices.find(v => 
      v.lang.startsWith(lang.split('-')[0]) && 
      v.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (voice) {
      console.log(`[TextToSpeech] Selected preferred feminine voice: ${voice.name}`);
      return voice;
    }
  }

  // If no preferred voice found, look for any voice with 'female' in the name
  const femaleVoice = voices.find(v => 
    v.lang.startsWith(lang.split('-')[0]) && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
  );
  if (femaleVoice) {
    console.log(`[TextToSpeech] Selected feminine voice: ${femaleVoice.name}`);
    return femaleVoice;
  }

  // For Hindi, try to find a Hindi female voice
  if (lang.startsWith('hi')) {
    const hindiVoice = voices.find(v => 
      v.lang.startsWith('hi') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
    if (hindiVoice) {
      console.log(`[TextToSpeech] Selected Hindi feminine voice: ${hindiVoice.name}`);
      return hindiVoice;
    }
  }

  // Fallback: find any voice matching the language
  const langVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (langVoice) {
    console.log(`[TextToSpeech] Selected fallback voice: ${langVoice.name}`);
    return langVoice;
  }

  // Last resort: use default voice
  console.warn('[TextToSpeech] No suitable voice found, using default');
  return voices[0] || null;
}

export function useTextToSpeech(
  language: string = 'en-US',
  rate: number = 0.95, // Slightly slower for clearer speech
  pitch: number = 1.1, // Slightly higher pitch for feminine sound
  volume: number = 1.0
): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupportedRef = useRef<boolean>(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Check if Speech Synthesis is supported and load voices
  useEffect(() => {
    isSupportedRef.current = 'speechSynthesis' in window;
    
    // Load voices (they may not be available immediately)
    const loadVoices = () => {
      if (isSupportedRef.current) {
        const voice = findFeminineVoice(language);
        voiceRef.current = voice;
      }
    };

    // Try to load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (voices load asynchronously)
    if (isSupportedRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (isSupportedRef.current && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);

  const speak = useCallback((text: string) => {
    if (!isSupportedRef.current) {
      console.warn('[TextToSpeech] Speech synthesis is not supported');
      return;
    }

    // Stop any ongoing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    // Reload voices in case they weren't available before
    if (!voiceRef.current) {
      const voice = findFeminineVoice(language);
      voiceRef.current = voice;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Set the feminine voice if available
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('[TextToSpeech] Error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (isSupportedRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (isSupportedRef.current && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (isSupportedRef.current && isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupportedRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    isSupported: isSupportedRef.current,
  };
}

