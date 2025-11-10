import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from './useTranslation';
import { LanguageCode } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function LanguageSelector({ className, variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(lang => lang.code === language);
  
  const handleLanguageChange = (value: string) => {
    console.log('[LanguageSelector] Language changed to:', value);
    setLanguage(value as LanguageCode);
  };

  if (variant === 'compact') {
    return (
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={className}>
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue>
            <span className="text-sm">{currentLanguage?.nativeName || currentLanguage?.name}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center justify-between w-full">
                <span>{lang.nativeName}</span>
                {language === lang.code && <Check className="w-4 h-4 ml-2 text-primary" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={className}>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentLanguage?.name}</span>
              <span className="text-xs text-muted-foreground">{currentLanguage?.nativeName}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4 ml-2 text-primary" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

