import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Wifi, WifiOff, Clock, CheckCircle2, Globe, Volume2, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSelector } from '@/i18n/LanguageSelector';
type Language = 'en' | 'hi';
type ArogyaVaultOnboardingProps = {
  onComplete?: () => void;
};
const translations = {
  en: {
    slide1: {
      title: 'Your Health. Your Control.',
      subtitle: 'A secure, offline-first locker for all your medical records.',
      cta: 'Next'
    },
    slide2: {
      title: 'You Own Your Data',
      subtitle: 'You control who accesses your medical records. All actions are logged and revocable.',
      bullets: ['Time-bound, revocable access', 'Fully encrypted', 'Transparent audit logs'],
      cta: 'Next'
    },
    slide3: {
      title: 'Offline-First Access',
      subtitle: 'Your records and emergency card work even without internet. Syncs automatically when online.',
      bullets: ['Works in rural areas', 'Emergency QR access', 'Auto sync'],
      cta: 'Next'
    },
    slide4: {
      title: 'Choose How You Use Arogya Vault',
      subtitle: 'Select your preferred language and accessibility options.',
      languageLabel: 'Language',
      guidedModeLabel: 'Enable Guided Mode',
      guidedModeDesc: 'Voice assistance + larger icons',
      cta: 'Get Started'
    }
  },
  hi: {
    slide1: {
      title: 'आपका स्वास्थ्य, आपका नियंत्रण',
      subtitle: 'आपके सभी मेडिकल रिकॉर्ड के लिए एक सुरक्षित, ऑफ़लाइन-फर्स्ट लॉकर।',
      cta: 'आगे'
    },
    slide2: {
      title: 'आप अपने डेटा के मालिक हैं',
      subtitle: 'आप तय करते हैं कि आपके मेडिकल रिकॉर्ड को कौन एक्सेस कर सकता है। सभी कार्रवाइयां लॉग की जाती हैं और रद्द की जा सकती हैं।',
      bullets: ['समय-सीमित, रद्द करने योग्य एक्सेस', 'पूरी तरह से एन्क्रिप्टेड', 'पारदर्शी ऑडिट लॉग'],
      cta: 'आगे'
    },
    slide3: {
      title: 'ऑफ़लाइन-फर्स्ट एक्सेस',
      subtitle: 'आपके रिकॉर्ड और आपातकालीन कार्ड इंटरनेट के बिना भी काम करते हैं। ऑनलाइन होने पर स्वचालित रूप से सिंक हो जाता है।',
      bullets: ['ग्रामीण क्षेत्रों में काम करता है', 'आपातकालीन QR एक्सेस', 'ऑटो सिंक'],
      cta: 'आगे'
    },
    slide4: {
      title: 'चुनें कि आप Arogya Vault का उपयोग कैसे करते हैं',
      subtitle: 'अपनी पसंदीदा भाषा और सुलभता विकल्प चुनें।',
      languageLabel: 'भाषा',
      guidedModeLabel: 'गाइडेड मोड सक्षम करें',
      guidedModeDesc: 'आवाज सहायता + बड़े आइकन',
      cta: 'शुरू करें'
    }
  }
};

// @component: ArogyaVaultOnboarding
export const ArogyaVaultOnboarding = (props: ArogyaVaultOnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, setLanguage, translations: t } = useTranslation();
  const [guidedMode, setGuidedMode] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // Use centralized translations with fallback to local for onboarding-specific keys
  const onboardingT = translations[language as Language] || translations.en;
  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(currentSlide + 1);
    } else {
      props.onComplete?.();
    }
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNext();
    }
    if (touchStart - touchEnd < -75 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // @return
  return <div className="h-screen w-full max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto bg-white flex flex-col relative overflow-hidden" data-testid="onboarding-container">
      <div className="absolute top-6 right-6 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-1">
        <LanguageSelector variant="compact" className="w-auto min-w-[100px]" />
      </div>

      <div className="flex-1 relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <AnimatePresence initial={false} custom={1}>
          {currentSlide === 0 && <motion.div key="slide1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} className="absolute inset-0 flex flex-col items-center justify-center px-6" data-testid="slide-1">
              <motion.div initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-blue-200 rounded-full opacity-30 animate-pulse" style={{
                animationDelay: '0.5s'
              }}></div>
                  <Shield className="w-24 h-24 text-blue-600" strokeWidth={1.5} />
                </div>
              </motion.div>

              <motion.h1 initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-3xl font-bold text-gray-900 text-center mb-4" data-testid="text-slide-1-title">
                {onboardingT.slide1.title}
              </motion.h1>

              <motion.p initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.4
          }} className="text-base text-gray-600 text-center max-w-sm mb-12" data-testid="text-slide-1-subtitle">
                {onboardingT.slide1.subtitle}
              </motion.p>

              <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.5
          }} className="flex flex-col items-center gap-4">
                <button onClick={handleNext} className="bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center gap-2" style={{
              minWidth: '200px',
              minHeight: '56px'
            }} data-testid="button-next-slide-1">
                  {onboardingT.slide1.cta}
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <span>Swipe left to continue</span>
                </div>
              </motion.div>
            </motion.div>}

          {currentSlide === 1 && <motion.div key="slide2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} className="absolute inset-0 flex flex-col items-center justify-center px-6" data-testid="slide-2">
              <motion.div initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-green-200 rounded-full opacity-30 animate-pulse" style={{
                animationDelay: '0.5s'
              }}></div>
                  <Lock className="w-24 h-24 text-green-600" strokeWidth={1.5} />
                </div>
              </motion.div>

              <motion.h1 initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-3xl font-bold text-gray-900 text-center mb-4" data-testid="text-slide-2-title">
                {onboardingT.slide2.title}
              </motion.h1>

              <motion.p initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.4
          }} className="text-base text-gray-600 text-center max-w-sm mb-8" data-testid="text-slide-2-subtitle">
                {onboardingT.slide2.subtitle}
              </motion.p>

              <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.5
          }} className="flex flex-col gap-4 mb-12 w-full max-w-sm">
                {onboardingT.slide2.bullets.map((bullet: string, index: number) => <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl" data-testid={`bullet-slide-2-${index}`}>
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-base">{bullet}</span>
                  </div>)}
              </motion.div>

              <motion.button initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.6
          }} onClick={handleNext} className="bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center gap-2" style={{
            minWidth: '200px',
            minHeight: '56px'
          }} data-testid="button-next-slide-2">
                {onboardingT.slide2.cta}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>}

          {currentSlide === 2 && <motion.div key="slide3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} className="absolute inset-0 flex flex-col items-center justify-center px-6" data-testid="slide-3">
              <motion.div initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-100 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-purple-200 rounded-full opacity-30 animate-pulse" style={{
                animationDelay: '0.5s'
              }}></div>
                  <div className="relative flex items-center justify-center gap-4">
                    <Wifi className="w-16 h-16 text-purple-600" strokeWidth={1.5} />
                    <WifiOff className="w-16 h-16 text-purple-400" strokeWidth={1.5} />
                  </div>
                </div>
              </motion.div>

              <motion.h1 initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-3xl font-bold text-gray-900 text-center mb-4" data-testid="text-slide-3-title">
                {onboardingT.slide3.title}
              </motion.h1>

              <motion.p initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.4
          }} className="text-base text-gray-600 text-center max-w-sm mb-8" data-testid="text-slide-3-subtitle">
                {onboardingT.slide3.subtitle}
              </motion.p>

              <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.5
          }} className="flex flex-col gap-4 mb-12 w-full max-w-sm">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl" data-testid="bullet-slide-3-0">
                  <Globe className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base">{onboardingT.slide3.bullets[0]}</span>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl" data-testid="bullet-slide-3-1">
                  <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base">{onboardingT.slide3.bullets[1]}</span>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl" data-testid="bullet-slide-3-2">
                  <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base">{onboardingT.slide3.bullets[2]}</span>
                </div>
              </motion.div>

              <motion.button initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.6
          }} onClick={handleNext} className="bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center gap-2" style={{
            minWidth: '200px',
            minHeight: '56px'
          }} data-testid="button-next-slide-3">
                {onboardingT.slide3.cta}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>}

          {currentSlide === 3 && <motion.div key="slide4" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} className="absolute inset-0 flex flex-col items-center justify-center px-6" data-testid="slide-4">
              <motion.h1 initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="text-3xl font-bold text-gray-900 text-center mb-4" data-testid="text-slide-4-title">
                {onboardingT.slide4.title}
              </motion.h1>

              <motion.p initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-base text-gray-600 text-center max-w-sm mb-12" data-testid="text-slide-4-subtitle">
                {onboardingT.slide4.subtitle}
              </motion.p>

              <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.4
          }} className="w-full max-w-sm space-y-6 mb-12">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    {t.onboarding?.languageLabel || onboardingT.slide4.languageLabel}
                  </label>
                  <LanguageSelector variant="default" className="w-full" />
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-5 h-5 text-blue-600" />
                        <label className="text-sm font-semibold text-gray-700">
                          {t.onboarding?.guidedModeLabel || onboardingT.slide4.guidedModeLabel}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t.onboarding?.guidedModeDesc || onboardingT.slide4.guidedModeDesc}
                      </p>
                    </div>
                    <button onClick={() => setGuidedMode(!guidedMode)} className={`ml-4 relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${guidedMode ? 'bg-blue-600' : 'bg-gray-200'}`} style={{
                  minWidth: '56px',
                  minHeight: '28px'
                }} data-testid="toggle-guided-mode-slide-4">
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${guidedMode ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.button initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.5
          }} onClick={handleNext} className="bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center gap-2" style={{
            minWidth: '200px',
            minHeight: '56px'
          }} data-testid="button-complete-onboarding">
                {t.onboarding?.getStarted || onboardingT.slide4.cta}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {[0, 1, 2, 3].map(index => <button key={index} onClick={() => setCurrentSlide(index)} className={`transition-all rounded-full ${currentSlide === index ? 'w-8 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300'}`} style={{
        minWidth: currentSlide === index ? '32px' : '8px',
        minHeight: '8px'
      }} data-testid={`progress-dot-${index}`} />)}
      </div>
    </div>;
};
