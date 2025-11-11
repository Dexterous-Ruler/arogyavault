/**
 * Hook for text-to-speech using Web Speech API
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

export function useTextToSpeech(
  language: string = 'en-US',
  rate: number = 1.0,
  pitch: number = 1.0,
  volume: number = 1.0
): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupportedRef = useRef<boolean>(false);

  // Check if Speech Synthesis is supported
  useEffect(() => {
    isSupportedRef.current = 'speechSynthesis' in window;
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupportedRef.current) {
      console.warn('[TextToSpeech] Speech synthesis is not supported');
      return;
    }

    // Stop any ongoing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

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

