import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown, Info, Phone, Mail, AlertCircle, Loader2 } from 'lucide-react';

type Language = 'en' | 'hi';

type MediLockerAuthPageProps = {
  onContinueWithOTP?: (phoneNumber: string) => void;
  onContinueWithABHA?: () => void;
  onContinueAsGuest?: () => void;
  onContinueWithEmail?: () => void;
};

const translations = {
  en: {
    appName: 'Arogya Vault',
    subtitle: 'Your Health. Your Control.',
    signInTitle: 'Sign in to continue',
    signInDesc: 'Use your mobile number or ABHA ID.',
    phonePlaceholder: 'Enter mobile number',
    phoneHelper: "We'll send a 6-digit OTP.",
    invalidNumber: 'Invalid number',
    continueWithOTP: 'Continue with OTP',
    or: 'or',
    useABHA: 'Use ABHA ID',
    continueAsGuest: 'Continue as guest',
    continueWithEmail: 'Continue with Email',
    trustMessage: 'Your data is encrypted. You control access.',
    needHelp: 'Need help?',
    termsPrivacy: 'Terms & Privacy',
    guidedMode: 'Guided Mode',
    loading: 'Sending OTP...'
  },
  hi: {
    appName: 'आरोग्य वॉल्ट',
    subtitle: 'आपका स्वास्थ्य। आपका नियंत्रण।',
    signInTitle: 'लॉगिन करें',
    signInDesc: 'मोबाइल नंबर या ABHA ID से साइन-इन करें',
    phonePlaceholder: 'मोबाइल नंबर दर्ज करें',
    phoneHelper: 'हम 6 अंकों का OTP भेजेंगे।',
    invalidNumber: 'अमान्य नंबर',
    continueWithOTP: 'OTP के साथ जारी रखें',
    or: 'या',
    useABHA: 'ABHA ID इस्तेमाल करें',
    continueAsGuest: 'गेस्ट के रूप में जारी रखें',
    continueWithEmail: 'ईमेल से जारी रखें',
    trustMessage: 'आपका डेटा सुरक्षित है। एक्सेस का नियंत्रण आपके पास है।',
    needHelp: 'मदद चाहिए?',
    termsPrivacy: 'नियम और गोपनीयता',
    guidedMode: 'गाइडेड मोड',
    loading: 'OTP भेजा जा रहा है...'
  }
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const MediLockerAuthPage = ({
  onContinueWithOTP,
  onContinueWithABHA,
  onContinueAsGuest,
  onContinueWithEmail
}: MediLockerAuthPageProps) => {
  const [language, setLanguage] = useState<Language>('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);

  const t = translations[language];

  const toggleLanguage = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    if (showError) {
      setShowError(false);
    }
  };

  const handleContinue = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setShowError(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onContinueWithOTP?.(phoneNumber);
    }, 1500);
  };

  const isValid = validatePhoneNumber(phoneNumber);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 max-w-[390px] md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto w-full">
        <div className="flex items-start justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-[20px] overflow-hidden shadow-2xl shadow-blue-600/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute inset-[1px] rounded-[19px] bg-gradient-to-br from-white/20 to-transparent opacity-40" />
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.2, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-blue-400/30 to-transparent blur-xl"
              />
              <div className="relative w-full h-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                  <defs>
                    <linearGradient id="shieldGradient" x1="20" y1="4" x2="20" y2="34" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="white" stopOpacity="1" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M20 5L10 9.5V17.5C10 24.5 14.8 30.925 20 32.5C25.2 30.925 30 24.5 30 17.5V9.5L20 5Z" fill="url(#shieldGradient)" filter="url(#glow)" />
                  <circle cx="20" cy="19" r="7" fill="#3B82F6" fillOpacity="0.15" />
                  <path d="M17.5 21.5L16 20L17.025 18.975L17.5 19.45L21.475 15.475L22.5 16.5L17.5 21.5Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                  <motion.circle
                    cx="20"
                    cy="19"
                    r="8"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-indigo-900/30 to-transparent" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuidedMode(!guidedMode)}
              className="px-3 py-2 text-xs md:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              data-testid="button-guided-mode"
              aria-label="Toggle guided mode for accessibility"
            >
              {t.guidedMode}
            </button>
            <div className="relative">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                data-testid="button-language-toggle"
                aria-label="Change language"
                aria-expanded={showLanguageMenu}
              >
                <span className="text-sm font-medium text-gray-700">
                  {language === 'en' ? 'EN' : 'हिं'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                    role="menu"
                  >
                    <button
                      onClick={() => selectLanguage('en')}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors"
                      data-testid="button-language-en"
                      role="menuitem"
                    >
                      <span className={language === 'en' ? 'font-semibold text-blue-600' : 'text-gray-700'}>
                        English
                      </span>
                    </button>
                    <button
                      onClick={() => selectLanguage('hi')}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors"
                      data-testid="button-language-hi"
                      role="menuitem"
                    >
                      <span className={language === 'hi' ? 'font-semibold text-blue-600' : 'text-gray-700'}>
                        हिंदी
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className={`font-bold text-blue-600 mb-2 ${guidedMode ? 'text-3xl md:text-4xl' : 'text-[28px] md:text-3xl'}`}>
            {t.appName}
          </h1>
          <p className={`text-gray-600 ${guidedMode ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6"
        >
          <h2 className={`font-bold text-gray-900 mb-2 ${guidedMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            {t.signInTitle}
          </h2>
          <p className={`text-gray-600 mb-6 ${guidedMode ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
            {t.signInDesc}
          </p>

          <div className="mb-6">
            <div className="relative">
              <div className="flex items-stretch rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors overflow-hidden">
                <div className="flex items-center px-4 bg-gray-50 border-r-2 border-gray-200">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-semibold text-gray-700">+91</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={t.phonePlaceholder}
                  className={`flex-1 px-4 py-4 outline-none bg-white ${guidedMode ? 'text-lg' : 'text-base'}`}
                  data-testid="input-phone-number"
                  aria-label="Phone number"
                  aria-invalid={showError}
                  aria-describedby={showError ? "phone-error" : "phone-helper"}
                />
              </div>
              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1 mt-2 text-red-600"
                    id="phone-error"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.invalidNumber}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!showError && (
              <p className={`mt-2 text-gray-500 ${guidedMode ? 'text-sm' : 'text-xs'}`} id="phone-helper">
                {t.phoneHelper}
              </p>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={!isValid || isLoading}
            className={`w-full rounded-xl font-semibold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${guidedMode ? 'py-5 text-lg' : 'py-4 text-base'} ${
              isValid && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            data-testid="button-continue-otp"
            aria-label="Continue with OTP"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.loading}</span>
              </>
            ) : (
              t.continueWithOTP
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">{t.or}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onContinueWithABHA}
              className={`w-full rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all ${guidedMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
              data-testid="button-continue-abha"
              aria-label="Continue with ABHA ID"
            >
              {t.useABHA}
            </button>
            <div className="flex gap-3">
              <button
                onClick={onContinueAsGuest}
                className={`flex-1 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-all ${guidedMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
                data-testid="button-continue-guest"
                aria-label="Continue as guest"
              >
                {t.continueAsGuest}
              </button>
              <button
                onClick={onContinueWithEmail}
                className={`flex-1 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${guidedMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
                data-testid="button-continue-email"
                aria-label="Continue with email"
              >
                <Mail className="w-4 h-4" />
                <span>{t.continueWithEmail}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowPrivacySheet(true)}
          className={`flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mx-auto mb-6 ${guidedMode ? 'text-base' : 'text-sm'}`}
          data-testid="button-privacy-info"
          aria-label="View privacy information"
        >
          <Lock className="w-4 h-4" />
          <span className="font-medium">{t.trustMessage}</span>
          <Info className="w-4 h-4" />
        </motion.button>

        <div className="mt-auto pt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <button className="hover:text-blue-600 transition-colors" data-testid="button-terms-privacy">
            {t.termsPrivacy}
          </button>
          <span>•</span>
          <button className="hover:text-blue-600 transition-colors" data-testid="button-need-help">
            {t.needHelp}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPrivacySheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacySheet(false)}
              className="fixed inset-0 bg-black/40 z-40"
              data-testid="overlay-privacy-sheet"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 md:p-8 z-50 max-w-[390px] md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto"
              role="dialog"
              aria-labelledby="privacy-title"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900" id="privacy-title">
                  {language === 'en' ? 'Your Privacy' : 'आपकी गोपनीयता'}
                </h3>
              </div>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <p>
                  {language === 'en'
                    ? 'Your health data is encrypted end-to-end and stored securely. Only you have access to your records.'
                    : 'आपका स्वास्थ्य डेटा एंड-टू-एंड एन्क्रिप्टेड है और सुरक्षित रूप से संग्रहीत है। केवल आपके पास अपने रिकॉर्ड तक पहुंच है।'}
                </p>
                <p>
                  {language === 'en'
                    ? 'We never share your data with third parties without your explicit consent.'
                    : 'हम आपकी स्पष्ट सहमति के बिना आपके डेटा को तृतीय पक्षों के साथ कभी साझा नहीं करते हैं।'}
                </p>
              </div>
              <button
                onClick={() => setShowPrivacySheet(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                data-testid="button-privacy-close"
              >
                {language === 'en' ? 'Got it' : 'समझ गया'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
