import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, UserPlus, AlertCircle, Clock, Calendar, Infinity, Shield, FileText, Phone, User, X, Check } from 'lucide-react';

type Relationship = 'Parent' | 'Sibling' | 'Spouse' | 'Friend' | 'Other';
type AccessScope = 'emergency-only' | 'emergency-limited';
type NomineeStatus = 'active' | 'expiring-soon' | 'pending';

type Nominee = {
  id: string;
  name: string;
  nameHi?: string;
  relationship: Relationship;
  phone: string;
  scope: AccessScope;
  expiry: string | 'lifetime';
  status: NomineeStatus;
};

type AddNomineeStep = 'basic' | 'scope' | 'confirm' | null;

type NomineeManagementScreenProps = {
  onBack?: () => void;
};

export const NomineeManagementScreen = ({ onBack }: NomineeManagementScreenProps) => {
  const [nominees, setNominees] = useState<Nominee[]>([
    {
      id: '1',
      name: 'Rishabh Singh',
      nameHi: 'ऋषभ सिंह',
      relationship: 'Sibling',
      phone: '+91 98765 43210',
      scope: 'emergency-only',
      expiry: 'lifetime',
      status: 'active'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      nameHi: 'प्रिया शर्मा',
      relationship: 'Spouse',
      phone: '+91 87654 32109',
      scope: 'emergency-limited',
      expiry: '2024-12-31',
      status: 'expiring-soon'
    }
  ]);

  const [addFlowStep, setAddFlowStep] = useState<AddNomineeStep>(null);
  const [editingNominee, setEditingNominee] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [newNominee, setNewNominee] = useState({
    name: '',
    relationship: 'Friend' as Relationship,
    phone: '',
    scope: 'emergency-only' as AccessScope,
    expiry: 'lifetime' as string
  });

  const handleAddNominee = () => {
    setAddFlowStep('basic');
  };

  const handleNextStep = () => {
    if (addFlowStep === 'basic') setAddFlowStep('scope');
    else if (addFlowStep === 'scope') setAddFlowStep('confirm');
  };

  const handleConfirmAdd = () => {
    const nominee: Nominee = {
      id: Date.now().toString(),
      name: newNominee.name,
      relationship: newNominee.relationship,
      phone: newNominee.phone,
      scope: newNominee.scope,
      expiry: newNominee.expiry,
      status: 'pending'
    };
    setNominees([...nominees, nominee]);
    setAddFlowStep(null);
    setNewNominee({
      name: '',
      relationship: 'Friend',
      phone: '',
      scope: 'emergency-only',
      expiry: 'lifetime'
    });
  };

  const handleRevoke = (id: string) => {
    setNominees(nominees.filter(n => n.id !== id));
    setRevokeConfirm(null);
  };

  const getScopeLabel = (scope: AccessScope) => {
    if (language === 'hi') {
      return scope === 'emergency-only' ? 'केवल आपातकालीन कार्ड' : 'आपातकालीन + सीमित दस्तावेज़';
    }
    return scope === 'emergency-only' ? 'Emergency Only' : 'Emergency + Limited Docs';
  };

  const getRelationshipLabel = (rel: Relationship) => {
    if (language === 'hi') {
      const map: Record<Relationship, string> = {
        Parent: 'माता-पिता',
        Sibling: 'भाई-बहन',
        Spouse: 'जीवनसाथी',
        Friend: 'मित्र',
        Other: 'अन्य'
      };
      return map[rel];
    }
    return rel;
  };

  const getStatusBadge = (status: NomineeStatus) => {
    if (status === 'active') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1" data-testid="badge-status-active">
          <Check className="w-3 h-3" />
          {language === 'hi' ? 'सक्रिय' : 'Active'}
        </span>
      );
    } else if (status === 'expiring-soon') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1" data-testid="badge-status-expiring">
          <AlertCircle className="w-3 h-3" />
          {language === 'hi' ? 'शीघ्र समाप्त' : 'Expiring Soon'}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 flex items-center gap-1" data-testid="badge-status-pending">
          <Clock className="w-3 h-3" />
          {language === 'hi' ? 'लंबित' : 'Pending'}
        </span>
      );
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col max-w-[390px] mx-auto overflow-hidden" data-testid="nominee-management-screen">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm" data-testid="header">
        <button
          onClick={onBack || (() => window.history.back())}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900" data-testid="text-page-title">
          {language === 'hi' ? 'नामांकित व्यक्ति प्रबंधन' : 'Nominee Management'}
        </h1>
        <button
          onClick={handleAddNominee}
          className="p-2 hover:bg-blue-50 rounded-full transition-colors"
          aria-label="Add nominee"
          data-testid="button-add-nominee"
        >
          <Plus className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200" data-testid="info-banner">
          <p className="text-sm text-blue-900">
            {language === 'hi'
              ? 'नामांकित व्यक्ति आपके आपातकालीन कार्ड को तब एक्सेस कर सकते हैं जब आप नहीं कर सकते। आप किसी भी समय नामांकित व्यक्ति की पहुंच रद्द कर सकते हैं।'
              : 'Nominees can access your emergency card when you cannot. You can revoke nominee access at any time.'}
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900" data-testid="text-section-title">
            {language === 'hi' ? 'मौजूदा नामांकित व्यक्ति' : 'Existing Nominees'}
          </h2>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50"
            data-testid="button-toggle-language"
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <div className="space-y-4">
          {nominees.map(nominee => (
            <motion.div
              key={nominee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`nominee-card-${nominee.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900" data-testid={`text-nominee-name-${nominee.id}`}>
                      {nominee.name}
                    </h3>
                    {language === 'hi' && nominee.nameHi && (
                      <p className="text-sm text-gray-600">{nominee.nameHi}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700" data-testid={`badge-relationship-${nominee.id}`}>
                        {getRelationshipLabel(nominee.relationship)}
                      </span>
                      {getStatusBadge(nominee.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span data-testid={`text-nominee-phone-${nominee.id}`}>{nominee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  {nominee.scope === 'emergency-only' ? (
                    <Shield className="w-4 h-4 text-orange-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-sm text-gray-700" data-testid={`text-nominee-scope-${nominee.id}`}>
                    {getScopeLabel(nominee.scope)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {nominee.expiry === 'lifetime' ? (
                    <>
                      <Infinity className="w-4 h-4" />
                      <span data-testid={`text-nominee-expiry-${nominee.id}`}>
                        {language === 'hi' ? 'आजीवन' : 'Lifetime'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`text-nominee-expiry-${nominee.id}`}>
                        {language === 'hi' ? 'समाप्ति:' : 'Expires:'} {nominee.expiry}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setEditingNominee(nominee.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  data-testid={`button-edit-${nominee.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                  {language === 'hi' ? 'संपादित करें' : 'Edit'}
                </button>
                <button
                  onClick={() => setRevokeConfirm(nominee.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  data-testid={`button-revoke-${nominee.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {language === 'hi' ? 'रद्द करें' : 'Revoke'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {nominees.length === 0 && (
          <div className="text-center py-12" data-testid="empty-state">
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {language === 'hi' ? 'कोई नामांकित व्यक्ति नहीं' : 'No nominees added yet'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'hi'
                ? 'विश्वसनीय परिवार के सदस्यों या मित्रों को नामांकित व्यक्ति के रूप में जोड़ें'
                : 'Add trusted family members or friends as nominees'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {addFlowStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
            onClick={() => setAddFlowStep(null)}
            data-testid="add-nominee-modal"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-[390px] mx-auto rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900" data-testid="text-modal-title">
                  {language === 'hi' ? 'नामांकित व्यक्ति जोड़ें' : 'Add Nominee'}
                </h2>
                <button
                  onClick={() => setAddFlowStep(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  data-testid="button-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {addFlowStep === 'basic' && (
                  <div className="space-y-4" data-testid="step-basic">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nominee-name">
                        {language === 'hi' ? 'नाम' : 'Name'}
                      </label>
                      <input
                        id="nominee-name"
                        type="text"
                        value={newNominee.name}
                        onChange={e => setNewNominee({ ...newNominee, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                        data-testid="input-nominee-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nominee-relationship">
                        {language === 'hi' ? 'संबंध' : 'Relationship'}
                      </label>
                      <select
                        id="nominee-relationship"
                        value={newNominee.relationship}
                        onChange={e => setNewNominee({ ...newNominee, relationship: e.target.value as Relationship })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="select-relationship"
                      >
                        <option value="Parent">{language === 'hi' ? 'माता-पिता' : 'Parent'}</option>
                        <option value="Sibling">{language === 'hi' ? 'भाई-बहन' : 'Sibling'}</option>
                        <option value="Spouse">{language === 'hi' ? 'जीवनसाथी' : 'Spouse'}</option>
                        <option value="Friend">{language === 'hi' ? 'मित्र' : 'Friend'}</option>
                        <option value="Other">{language === 'hi' ? 'अन्य' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nominee-phone">
                        {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                      </label>
                      <input
                        id="nominee-phone"
                        type="tel"
                        value={newNominee.phone}
                        onChange={e => setNewNominee({ ...newNominee, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91"
                        data-testid="input-nominee-phone"
                      />
                    </div>

                    <button
                      onClick={handleNextStep}
                      disabled={!newNominee.name || !newNominee.phone}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      data-testid="button-next-basic"
                    >
                      {language === 'hi' ? 'अगला' : 'Next'}
                    </button>
                  </div>
                )}

                {addFlowStep === 'scope' && (
                  <div className="space-y-6" data-testid="step-scope">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {language === 'hi' ? 'पहुंच का दायरा' : 'Access Scope'}
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="scope"
                            value="emergency-only"
                            checked={newNominee.scope === 'emergency-only'}
                            onChange={e => setNewNominee({ ...newNominee, scope: e.target.value as AccessScope })}
                            className="mt-1"
                            data-testid="radio-scope-emergency-only"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="w-5 h-5 text-orange-600" />
                              <span className="font-medium">
                                {language === 'hi' ? 'केवल आपातकालीन कार्ड' : 'Emergency Card Only'}
                              </span>
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                {language === 'hi' ? 'अनुशंसित' : 'Recommended'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {language === 'hi'
                                ? 'केवल आपातकालीन संपर्क और महत्वपूर्ण स्वास्थ्य जानकारी'
                                : 'Emergency contacts and critical health info only'}
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="scope"
                            value="emergency-limited"
                            checked={newNominee.scope === 'emergency-limited'}
                            onChange={e => setNewNominee({ ...newNominee, scope: e.target.value as AccessScope })}
                            className="mt-1"
                            data-testid="radio-scope-emergency-limited"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">
                                {language === 'hi' ? 'आपातकालीन + सीमित दस्तावेज़' : 'Emergency + Limited Documents'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {language === 'hi'
                                ? 'आपातकालीन कार्ड और चुनिंदा चिकित्सा दस्तावेज़'
                                : 'Emergency card and selected medical documents'}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {language === 'hi' ? 'समाप्ति अवधि' : 'Expiry Duration'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setNewNominee({ ...newNominee, expiry: '24h' })}
                          className={`p-3 border-2 rounded-lg text-center ${
                            newNominee.expiry === '24h' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          data-testid="button-expiry-24h"
                        >
                          <Clock className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">24 {language === 'hi' ? 'घंटे' : 'hours'}</span>
                        </button>
                        <button
                          onClick={() => setNewNominee({ ...newNominee, expiry: '7d' })}
                          className={`p-3 border-2 rounded-lg text-center ${
                            newNominee.expiry === '7d' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          data-testid="button-expiry-7d"
                        >
                          <Calendar className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">7 {language === 'hi' ? 'दिन' : 'days'}</span>
                        </button>
                        <button
                          onClick={() => setNewNominee({ ...newNominee, expiry: 'custom' })}
                          className={`p-3 border-2 rounded-lg text-center ${
                            newNominee.expiry === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          data-testid="button-expiry-custom"
                        >
                          <Calendar className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">{language === 'hi' ? 'कस्टम' : 'Custom'}</span>
                        </button>
                        <button
                          onClick={() => setNewNominee({ ...newNominee, expiry: 'lifetime' })}
                          className={`p-3 border-2 rounded-lg text-center ${
                            newNominee.expiry === 'lifetime' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          data-testid="button-expiry-lifetime"
                        >
                          <Infinity className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">{language === 'hi' ? 'आजीवन' : 'Lifetime'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      data-testid="button-next-scope"
                    >
                      {language === 'hi' ? 'अगला' : 'Next'}
                    </button>
                  </div>
                )}

                {addFlowStep === 'confirm' && (
                  <div className="space-y-6" data-testid="step-confirm">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-gray-900 mb-3" data-testid="text-confirm-title">
                        {language === 'hi' ? 'विवरण की पुष्टि करें' : 'Confirm Details'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'hi' ? 'नाम' : 'Name'}</p>
                          <p className="font-medium" data-testid="text-confirm-name">{newNominee.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'hi' ? 'संबंध' : 'Relationship'}</p>
                          <p className="font-medium" data-testid="text-confirm-relationship">{getRelationshipLabel(newNominee.relationship)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'hi' ? 'मोबाइल' : 'Mobile'}</p>
                          <p className="font-medium" data-testid="text-confirm-phone">{newNominee.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'hi' ? 'पहुंच' : 'Access'}</p>
                          <p className="font-medium" data-testid="text-confirm-scope">{getScopeLabel(newNominee.scope)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'hi' ? 'समाप्ति' : 'Expiry'}</p>
                          <p className="font-medium" data-testid="text-confirm-expiry">
                            {newNominee.expiry === 'lifetime' ? language === 'hi' ? 'आजीवन' : 'Lifetime' : newNominee.expiry}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-900">
                        {language === 'hi' ? 'जारी रखने के लिए अपना PIN या बायोमेट्रिक प्रदान करें' : 'Provide your PIN or biometric to continue'}
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmAdd}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      data-testid="button-confirm-add"
                    >
                      {language === 'hi' ? 'पुष्टि करें और जोड़ें' : 'Confirm & Add'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {revokeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={() => setRevokeConfirm(null)}
            data-testid="revoke-modal"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-revoke-title">
                  {language === 'hi' ? 'पहुंच रद्द करें?' : 'Revoke Access?'}
                </h3>
                <p className="text-gray-600">
                  {language === 'hi'
                    ? 'यह नामांकित व्यक्ति आपके आपातकालीन कार्ड तक पहुंचने में सक्षम नहीं होगा'
                    : 'This nominee will no longer be able to access your emergency card'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRevokeConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  data-testid="button-cancel-revoke"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleRevoke(revokeConfirm)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  data-testid="button-confirm-revoke"
                >
                  {language === 'hi' ? 'हां, रद्द करें' : 'Yes, Revoke'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
