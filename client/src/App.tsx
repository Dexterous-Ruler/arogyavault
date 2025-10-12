import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { featureFlags } from "@/config/featureFlags";
import AuthPage from "@/pages/auth";
import OTPPage from "@/pages/otp";
import OnboardingPage from "@/pages/onboarding";
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
      {featureFlags.screens.onboarding && <Route path="/onboarding" component={OnboardingPage} />}
      {/* {featureFlags.screens.home && <Route path="/home" component={HomePage} />} */}
      {/* {featureFlags.screens.vault && <Route path="/vault" component={VaultPage} />} */}
      
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
