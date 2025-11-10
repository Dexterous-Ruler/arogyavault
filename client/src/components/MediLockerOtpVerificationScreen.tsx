import React from 'react';
import { ArrowLeft, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OTPInput, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
type Language = 'en' | 'hi';
type ArogyaVaultOtpVerificationScreenProps = {
  phoneNumber?: string;
  isEmail?: boolean;
  onVerify?: (otp: string) => void;
  onChangeNumber?: () => void;
  onResendOtp?: () => void;
  onGetCall?: () => void;
  onBack?: () => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  onHelpClick?: () => void;
};
const translations = {
  en: {
    title: 'Verify OTP',
    subtitle: 'Sent to',
    changeNumber: 'Change Number',
    button: 'Verify & Continue',
    error: 'Incorrect OTP. Try again.',
    resendTimer: 'Resend OTP in',
    resendLink: 'Resend OTP',
    getCall: 'Get a Call',
    didntGet: "Didn't get OTP?",
    trust: 'Your number is used only for secure login.',
    terms: 'Terms',
    privacy: 'Privacy',
    needHelp: 'Need help?',
    guidedMode: 'Guided Mode'
  },
  hi: {
    title: 'ओटीपी सत्यापित करें',
    subtitle: 'पर भेजा गया',
    changeNumber: 'नंबर बदलें',
    button: 'जारी रखें',
    error: 'गलत ओटीपी। फिर से कोशिश करें।',
    resendTimer: 'में ओटीपी पुनः भेजें',
    resendLink: 'ओटीपी पुनः भेजें',
    getCall: 'कॉल प्राप्त करें',
    didntGet: 'ओटीपी नहीं मिला?',
    trust: 'आपका नंबर केवल सुरक्षित लॉगिन के लिए उपयोग होता है।',
    terms: 'नियम',
    privacy: 'गोपनीयता',
    needHelp: 'मदद चाहिए?',
    guidedMode: 'गाइडेड मोड'
  }
};

// @component: ArogyaVaultOtpVerificationScreen
export const ArogyaVaultOtpVerificationScreen = (props: ArogyaVaultOtpVerificationScreenProps) => {
  const {
    phoneNumber = '+91 98xxxxxx10',
    isEmail = false,
    onVerify,
    onChangeNumber,
    onResendOtp,
    onGetCall,
    onBack,
    onPrivacyClick,
    onTermsClick,
    onHelpClick
  } = props;
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [language, setLanguage] = React.useState<Language>('en');
  const [guidedMode, setGuidedMode] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(28);
  const [canResend, setCanResend] = React.useState(false);
  const t = translations[language];
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(false);
  };
  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    setError(false);
    
    // Call the actual verification handler (which calls the API)
    // The error handling is done in the parent component
    try {
      await onVerify?.(otp);
    } catch (err) {
      // If verification fails, show error
      setError(true);
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };
  const handleResend = () => {
    if (!canResend) return;
    setTimeLeft(28);
    setCanResend(false);
    setOtp('');
    setError(false);
    onResendOtp?.();
  };
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // @return
  return <div className="min-h-screen bg-white flex flex-col w-full max-w-[390px] mx-auto">
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back" data-testid="button-back">
            <ArrowLeft className="w-6 h-6 text-[#0F172A]" />
          </button>

          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2F5BFF] hover:bg-blue-50 rounded-lg transition-colors" data-testid="button-language-toggle">
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : 'हि'}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={guidedMode} onChange={e => setGuidedMode(e.target.checked)} className="sr-only peer" data-testid="toggle-guided-mode" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#2F5BFF] transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-xs text-[#6B7280]">{t.guidedMode}</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center mb-12">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2 text-center" data-testid="text-title">
            {t.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <span data-testid="text-phone-number">
              {t.subtitle} {phoneNumber}
            </span>
          </div>
          <button onClick={onChangeNumber} className="text-sm font-medium text-[#2F5BFF] mt-1 hover:underline" data-testid="button-change-number">
                {isEmail ? 'Change Email' : t.changeNumber}
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <OTPInput maxLength={6} value={otp} onChange={handleOtpChange} autoFocus inputMode="numeric" pattern={REGEXP_ONLY_DIGITS_AND_CHARS} containerClassName="gap-2 flex" render={({
          slots
        }) => <>
                {slots.map((slot, idx) => <div key={idx} className={`w-12 h-14 text-2xl font-semibold border-2 rounded-lg transition-all flex items-center justify-center ${error ? 'border-red-500 bg-red-50' : slot.isActive ? 'border-[#2F5BFF] bg-blue-50' : otp.length > idx ? 'border-[#2F5BFF] bg-blue-50' : 'border-[#E5E7EB] bg-white'} focus:border-[#2F5BFF] focus:ring-2 focus:ring-[#2F5BFF] focus:ring-opacity-20`} data-testid={`input-otp-digit-${idx}`}>
                    {slot.char}
                  </div>)}
              </>} />

          <AnimatePresence>
            {error && <motion.div initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="mt-3 text-sm text-red-600 font-medium" data-testid="text-error">
                {t.error}
              </motion.div>}
          </AnimatePresence>

          <div className="mt-4 flex flex-col items-center gap-2">
            {!canResend ? <div className="text-sm text-[#6B7280]" data-testid="text-resend-timer">
                {t.resendTimer} {formatTime(timeLeft)}
              </div> : <button onClick={handleResend} className="text-sm font-medium text-[#2F5BFF] hover:underline" data-testid="button-resend-otp">
                {t.resendLink}
              </button>}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280]">{t.didntGet}</span>
              <button onClick={onGetCall} className="font-medium text-[#2F5BFF] hover:underline" data-testid="button-get-call">
                {t.getCall}
              </button>
            </div>
          </div>
        </div>

        <motion.button onClick={handleVerify} disabled={otp.length !== 6 || isLoading} whileTap={{
        scale: 0.98
      }} className={`w-full h-12 rounded-lg font-semibold text-white transition-all ${otp.length === 6 && !isLoading ? 'bg-[#2F5BFF] hover:bg-[#2648CC] shadow-sm' : 'bg-[#E5E7EB] cursor-not-allowed'}`} data-testid="button-verify">
          {isLoading ? <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </div> : t.button}
        </motion.button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#6B7280] px-4">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <button onClick={onPrivacyClick} className="text-center leading-relaxed hover:text-[#2F5BFF] transition-colors" data-testid="button-privacy-info">
            {t.trust}
          </button>
        </div>

        <div className="mt-auto pt-8 flex items-center justify-center gap-4 text-xs text-[#6B7280]">
          <button onClick={onTermsClick} className="hover:text-[#2F5BFF] transition-colors" data-testid="button-terms">
            {t.terms}
          </button>
          <span>•</span>
          <button onClick={onPrivacyClick} className="hover:text-[#2F5BFF] transition-colors" data-testid="button-privacy">
            {t.privacy}
          </button>
          <span>•</span>
          <button onClick={onHelpClick} className="hover:text-[#2F5BFF] transition-colors" data-testid="button-help">
            {t.needHelp}
          </button>
        </div>
      </div>
    </div>;
};
