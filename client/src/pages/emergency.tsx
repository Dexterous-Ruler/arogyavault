import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Users, Phone, FileHeart, Pill, AlertCircle, Calendar } from 'lucide-react';

export default function EmergencyPage() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const handleBack = () => {
    setLocation('/home');
  };

  const handleManageNominee = () => {
    setLocation('/nominee-management');
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col max-w-[390px] mx-auto" data-testid="emergency-page">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm" data-testid="header">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900" data-testid="text-page-title">
          {language === 'hi' ? 'आपातकालीन' : 'Emergency'}
        </h1>
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50"
          data-testid="button-toggle-language"
        >
          {language === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3" data-testid="info-banner">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-900 font-medium mb-1">
              {language === 'hi' ? 'आपातकालीन सूचना' : 'Emergency Information'}
            </p>
            <p className="text-xs text-red-800">
              {language === 'hi'
                ? 'यह जानकारी चिकित्सा आपातस्थिति में प्रदाताओं को आपकी सहायता करने में मदद करती है'
                : 'This information helps providers assist you in medical emergencies'}
            </p>
          </div>
        </div>

        {/* Emergency Card Preview */}
        <div className="mb-6 bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-6 text-white" data-testid="emergency-card-preview">
          <h2 className="text-lg font-bold mb-4">
            {language === 'hi' ? 'आपातकालीन कार्ड' : 'Emergency Card'}
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileHeart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-red-100">{language === 'hi' ? 'रक्त समूह' : 'Blood Group'}</p>
                <p className="font-semibold">O+</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-red-100">{language === 'hi' ? 'एलर्जी' : 'Allergies'}</p>
                <p className="font-semibold">{language === 'hi' ? 'पेनिसिलिन' : 'Penicillin'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-red-100">{language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contact'}</p>
                <p className="font-semibold">+91 98765 43210</p>
              </div>
            </div>
          </div>

          <button
            className="w-full mt-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            data-testid="button-view-full-card"
          >
            {language === 'hi' ? 'पूरा कार्ड देखें' : 'View Full Card'}
          </button>
        </div>

        {/* Emergency Features */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-section-title">
            {language === 'hi' ? 'आपातकालीन विशेषताएं' : 'Emergency Features'}
          </h2>
          
          <div className="space-y-3">
            {/* Manage Nominees */}
            <button
              onClick={handleManageNominee}
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              data-testid="button-manage-nominees"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'hi' ? 'नामांकित व्यक्ति प्रबंधित करें' : 'Manage Nominees'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'hi'
                      ? 'विश्वसनीय परिवार/मित्रों को आपातकालीन पहुंच दें'
                      : 'Give emergency access to trusted family/friends'}
                  </p>
                </div>
              </div>
            </button>

            {/* Emergency Contacts */}
            <button
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              data-testid="button-emergency-contacts"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'hi'
                      ? 'अपने आपातकालीन संपर्क नंबर प्रबंधित करें'
                      : 'Manage your emergency contact numbers'}
                  </p>
                </div>
              </div>
            </button>

            {/* Medical History */}
            <button
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              data-testid="button-medical-history"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileHeart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'hi' ? 'चिकित्सा इतिहास' : 'Medical History'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'hi'
                      ? 'रक्त समूह, एलर्जी, और स्थितियां अपडेट करें'
                      : 'Update blood group, allergies, and conditions'}
                  </p>
                </div>
              </div>
            </button>

            {/* Medication Schedule */}
            <button
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              data-testid="button-medication-schedule"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Pill className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'hi' ? 'दवा अनुसूची' : 'Medication Schedule'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'hi'
                      ? 'अपनी वर्तमान दवाओं को ट्रैक करें'
                      : 'Track your current medications'}
                  </p>
                </div>
              </div>
            </button>

            {/* Appointments */}
            <button
              className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              data-testid="button-appointments"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'hi' ? 'नियुक्तियाँ' : 'Appointments'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'hi'
                      ? 'आगामी चिकित्सा नियुक्तियाँ देखें'
                      : 'View upcoming medical appointments'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
