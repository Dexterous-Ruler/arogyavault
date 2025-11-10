import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Shield, Globe, Users, FileText, HelpCircle, LogOut, CheckCircle, XCircle, Edit2, Lock, Fingerprint, Heart, AlertCircle, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSelector } from '@/i18n/LanguageSelector';

type ProfileSettingsScreenProps = {
  userName?: string;
  abhaId?: string;
  isAbhaLinked?: boolean;
  phone?: string;
  email?: string;
  language?: 'english' | 'hindi';
  isGuidedModeEnabled?: boolean;
  isBiometricEnabled?: boolean;
  onBack?: () => void;
  onEditProfile?: () => void;
  onGuidedModeToggle?: () => void;
  onSetPin?: () => void;
  onBiometricToggle?: () => void;
  onManageNominee?: () => void;
  onEmergencyCard?: () => void;
  onFaq?: () => void;
  onSupport?: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  onLogout?: () => void;
};

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

export const ProfileSettingsScreen = ({
  userName = 'Tanishq Aryan',
  abhaId = '22-XXXX-XXXX',
  isAbhaLinked = true,
  phone = '+91 98765 43210',
  email = 'tanishq.aryan@example.com',
  language = 'english',
  isGuidedModeEnabled = false,
  isBiometricEnabled = false,
  onBack,
  onEditProfile,
  onGuidedModeToggle,
  onSetPin,
  onBiometricToggle,
  onManageNominee,
  onEmergencyCard,
  onFaq,
  onSupport,
  onTerms,
  onPrivacy,
  onLogout
}: ProfileSettingsScreenProps) => {
  const { translations: t, language: currentLanguage } = useTranslation();
  const [guidedMode, setGuidedMode] = useState(isGuidedModeEnabled);
  const [biometric, setBiometric] = useState(isBiometricEnabled);

  // LanguageSelector handles language changes directly via i18next context
  // No need for useEffect - language changes are handled automatically

  const handleGuidedModeToggle = () => {
    setGuidedMode(!guidedMode);
    onGuidedModeToggle?.();
  };

  const handleBiometricToggle = () => {
    setBiometric(!biometric);
    onBiometricToggle?.();
  };

  const isHindi = currentLanguage === 'hi';

  const getInitials = (nameOrPhone: string) => {
    // If it's a phone number (contains 'x'), use first and last digit
    if (nameOrPhone.includes('x') || nameOrPhone.includes('X')) {
      const digits = nameOrPhone.replace(/[^\d]/g, '');
      if (digits.length >= 2) {
        return digits.slice(0, 1) + digits.slice(-1);
      }
      return 'U';
    }
    // Otherwise, treat as name
    return nameOrPhone.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto" data-testid="profile-settings-screen">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col h-full">
        {/* Top Bar */}
        <motion.div variants={itemVariants} className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <button 
            onClick={onBack} 
            className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label={isHindi ? 'वापस जाएं' : 'Go back'}
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-700" />
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900" data-testid="text-page-title">
            {isHindi ? 'प्रोफ़ाइल और सेटिंग्स' : 'Profile & Settings'}
          </h1>
          <div className="w-10 md:w-12 lg:w-14" />
        </motion.div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Profile Header Section */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mt-6 md:mt-8 lg:mt-10 mb-4 md:mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 lg:p-10 border border-blue-100" data-testid="profile-header">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-4 md:space-x-5 lg:space-x-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl lg:text-4xl font-bold shadow-lg" data-testid="avatar-initials">
                    {getInitials(userName)}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900" data-testid="text-user-name">{userName}</h2>
                    <div className="flex items-center mt-1 md:mt-2 space-x-2">
                      <span className="text-sm md:text-base lg:text-lg text-gray-600">ABHA ID:</span>
                      <span className="text-sm md:text-base lg:text-lg font-medium text-gray-800" data-testid="text-abha-id">{abhaId}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-1">
                      {isAbhaLinked ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700" data-testid="text-abha-status">
                            {isHindi ? 'लिंक किया गया' : 'Linked'}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700" data-testid="text-abha-status">
                            {isHindi ? 'लिंक नहीं किया गया' : 'Not Linked'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onEditProfile} 
                  className="p-2 bg-white hover:bg-gray-50 rounded-full transition-colors shadow-sm" 
                  aria-label={isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit profile'}
                  data-testid="button-edit-profile"
                >
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              <div className="space-y-2 pt-3 border-t border-blue-200">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-phone">{phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-email">{email}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Language & Accessibility Section */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-500 uppercase tracking-wide mb-3 md:mb-4 px-1">
              {t.profile.language || 'Language & Accessibility'}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Language Selector */}
              <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 md:p-2.5 lg:p-3 bg-purple-50 rounded-lg">
                      <Globe className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                        {t.profile.language || 'Language'}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500">
                        {t.profile.selectLanguage || 'Select app language'}
                      </p>
                    </div>
                  </div>
                </div>
                <LanguageSelector 
                  variant="default"
                  className="w-full"
                />
              </div>

              {/* Guided Mode Toggle */}
              <div className="p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                    <div className="p-2 md:p-2.5 lg:p-3 bg-orange-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                        {isHindi ? 'गाइडेड मोड' : 'Guided Mode'}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500 mt-0.5">
                        {isHindi ? 'आवाज सहायता और बड़े आइकन सक्षम करें' : 'Enable voice assistance and larger icons'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGuidedModeToggle} 
                    className={`relative inline-flex h-7 w-12 md:h-8 md:w-14 lg:h-9 lg:w-16 items-center rounded-full transition-colors ${guidedMode ? 'bg-green-600' : 'bg-gray-300'}`} 
                    role="switch" 
                    aria-checked={guidedMode}
                    data-testid="toggle-guided-mode"
                  >
                    <span className={`inline-block h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 transform rounded-full bg-white transition-transform ${guidedMode ? 'md:translate-x-7 lg:translate-x-8 translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-500 uppercase tracking-wide mb-3 md:mb-4 px-1">
              {isHindi ? 'सुरक्षा' : 'Security'}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={onSetPin} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="button-set-pin"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-blue-50 rounded-lg">
                    <Lock className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                      {isHindi ? 'पिन सेट करें / बदलें' : 'Set / Change PIN'}
                    </p>
                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                      {isHindi ? 'अपनी सुरक्षा पिन प्रबंधित करें' : 'Manage your security PIN'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>

              <div className="p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                    <div className="p-2 md:p-2.5 lg:p-3 bg-green-50 rounded-lg">
                      <Fingerprint className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                        {isHindi ? 'बायोमेट्रिक अनलॉक' : 'Biometric Unlock'}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500 mt-0.5">
                        {isHindi ? 'फिंगरप्रिंट / फेस अनलॉक' : 'Fingerprint / Face unlock'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleBiometricToggle} 
                    className={`relative inline-flex h-7 w-12 md:h-8 md:w-14 lg:h-9 lg:w-16 items-center rounded-full transition-colors ${biometric ? 'bg-green-600' : 'bg-gray-300'}`} 
                    role="switch" 
                    aria-checked={biometric}
                    data-testid="toggle-biometric"
                  >
                    <span className={`inline-block h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 transform rounded-full bg-white transition-transform ${biometric ? 'md:translate-x-7 lg:translate-x-8 translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Health & Nominee Section */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-500 uppercase tracking-wide mb-3 md:mb-4 px-1">
              {isHindi ? 'स्वास्थ्य और नामांकित' : 'Health & Nominee'}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={onManageNominee} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="button-manage-nominee"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-pink-50 rounded-lg">
                    <Users className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                      {isHindi ? 'नामांकित व्यक्ति प्रबंधन' : 'Nominee Management'}
                    </p>
                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                      {isHindi ? 'अपने नामांकित व्यक्ति जोड़ें या प्रबंधित करें' : 'Add or manage your nominees'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>

              <button 
                onClick={onEmergencyCard} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                data-testid="button-emergency-card"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-red-50 rounded-lg">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                      {isHindi ? 'आपातकालीन कार्ड सेटिंग्स' : 'Emergency Card Settings'}
                    </p>
                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                      {isHindi ? 'अपना आपातकालीन जानकारी अपडेट करें' : 'Update your emergency info'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Legal & Support Section */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-500 uppercase tracking-wide mb-3 md:mb-4 px-1">
              {isHindi ? 'सहायता और गोपनीयता' : 'Legal & Support'}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={onFaq} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="button-faq"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-indigo-50 rounded-lg">
                    <HelpCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-indigo-600" />
                  </div>
                  <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                    {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'FAQ / Help Center'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>

              <button 
                onClick={onSupport} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="button-support"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-teal-50 rounded-lg">
                    <Phone className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-teal-600" />
                  </div>
                  <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                    {isHindi ? 'सहायता से संपर्क करें' : 'Contact Support'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>

              <button 
                onClick={onTerms} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                data-testid="button-terms"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600" />
                  </div>
                  <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                    {isHindi ? 'नियम और शर्तें' : 'Terms & Conditions'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>

              <button 
                onClick={onPrivacy} 
                className="w-full p-4 md:p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                data-testid="button-privacy"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-2.5 lg:p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600" />
                  </div>
                  <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                    {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div variants={itemVariants} className="mx-4 md:mx-6 lg:mx-8 mb-6 md:mb-8">
            <button 
              onClick={onLogout} 
              className="w-full py-4 md:py-5 lg:py-6 px-6 md:px-8 lg:px-10 bg-white border-2 border-red-500 text-red-600 rounded-2xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 md:space-x-3 shadow-sm text-base md:text-lg lg:text-xl"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <span>{isHindi ? 'लॉगआउट / खाता बदलें' : 'Logout / Switch Account'}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
