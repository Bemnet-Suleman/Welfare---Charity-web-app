import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Volunteer from "@/pages/Volunteer";
import Stories from "@/pages/Stories";
import Transparency from "@/pages/Transparency";
import Donate from "@/pages/Donate";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import CreateCampaign from "@/pages/CreateCampaign";
import RequestAid from "@/pages/RequestAid";
import DonorProfile from "@/pages/DonorProfile";
import CampaignDetail from "@/pages/CampaignDetail";
import NotFound from "@/pages/not-found";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function Router() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/volunteer" component={Volunteer} />
      <Route path="/stories" component={Stories} />
      <Route path="/transparency" component={Transparency} />
      <Route path="/donate" component={Donate} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/create-campaign" component={CreateCampaign} />
      <Route path="/request-aid" component={RequestAid} />
      <Route path="/profile" component={DonorProfile} />
      <Route path="/campaign/:id" component={CampaignDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
