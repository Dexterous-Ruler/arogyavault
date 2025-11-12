import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import '@/i18n/i18n'; // Initialize i18next
import { featureFlags } from "@/config/featureFlags";
import '@/utils/testServiceWorker'; // Load test utilities for console debugging
import AuthPage from "@/pages/auth";
import OTPPage from "@/pages/otp";
import OTPEmailPage from "@/pages/otp-email";
import OnboardingPage from "@/pages/onboarding";
import HomePage from "@/pages/home";
import VaultPage from "@/pages/vault";
import ConsentPage from "@/pages/consent";
import EmergencyPage from "@/pages/emergency";
import EmergencyViewPage from "@/pages/emergency-view";
import NomineeManagementPage from "@/pages/nominee-management";
import ProfilePage from "@/pages/profile";
import DocumentDetailPage from "@/pages/document-detail";
import SharedPage from "@/pages/shared";
import LegalSupportPage from "@/pages/legal-support";
import FAQPage from "@/pages/faq";
import ContactSupportPage from "@/pages/contact-support";
import TermsConditionsPage from "@/pages/terms-conditions";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import AIInsightsPage from "@/pages/ai-insights";
import MedicationsPage from "@/pages/medications";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Auth page - mobile-first responsive design */}
      {featureFlags.screens.auth && (
        <>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
        </>
      )}
      
      {/* Future routes (feature-flagged) */}
      {featureFlags.screens.otp && <Route path="/otp" component={OTPPage} />}
      {featureFlags.screens.otp && <Route path="/otp-email" component={OTPEmailPage} />}
      {featureFlags.screens.onboarding && <Route path="/onboarding" component={OnboardingPage} />}
      {featureFlags.screens.home && <Route path="/home" component={HomePage} />}
      {featureFlags.screens.vault && <Route path="/vault" component={VaultPage} />}
      {featureFlags.screens.consent && <Route path="/consent" component={ConsentPage} />}
      <Route path="/emergency" component={EmergencyPage} />
      <Route path="/emergency/view/:token" component={EmergencyViewPage} />
      <Route path="/nominee-management" component={NomineeManagementPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/document/:id" component={DocumentDetailPage} />
      <Route path="/share/:token" component={SharedPage} />
      
      {/* Legal & Support Pages */}
      <Route path="/legal-support" component={LegalSupportPage} />
      <Route path="/legal/faq" component={FAQPage} />
      <Route path="/legal/contact" component={ContactSupportPage} />
      <Route path="/legal/terms" component={TermsConditionsPage} />
      <Route path="/legal/privacy" component={PrivacyPolicyPage} />
      
      {/* AI Insights Page */}
      <Route path="/ai-insights" component={AIInsightsPage} />
      
      {/* Medications Page */}
      <Route path="/medications" component={MedicationsPage} />
      
      {/* Redirect to auth if not enabled */}
      {!featureFlags.screens.auth && <Route path="/" component={NotFound} />}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
