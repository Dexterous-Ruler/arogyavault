import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import '@/i18n/i18n'; // Initialize i18next
import { featureFlags } from "@/config/featureFlags";
import AuthPage from "@/pages/auth";
import OTPPage from "@/pages/otp";
import OTPEmailPage from "@/pages/otp-email";
import OnboardingPage from "@/pages/onboarding";
import HomePage from "@/pages/home";
import VaultPage from "@/pages/vault";
import ConsentPage from "@/pages/consent";
import EmergencyPage from "@/pages/emergency";
import NomineeManagementPage from "@/pages/nominee-management";
import ProfilePage from "@/pages/profile";
import DocumentDetailPage from "@/pages/document-detail";
import SharedPage from "@/pages/shared";
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
      <Route path="/nominee-management" component={NomineeManagementPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/document/:id" component={DocumentDetailPage} />
      <Route path="/share/:token" component={SharedPage} />
      
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
