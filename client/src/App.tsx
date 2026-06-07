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
import Campaigns from "@/pages/Campaigns";
import Transparency from "@/pages/Transparency";
import Donate from "@/pages/Donate";
import DonationSuccess from "@/pages/DonationSuccess";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import CreateCampaign from "@/pages/CreateCampaign";
import CreateStory from "@/pages/CreateStory";
import RequestAid from "@/pages/RequestAid";
import DonorProfile from "@/pages/DonorProfile";
import CampaignDetail from "@/pages/CampaignDetail";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateVolunteerOpportunity from "@/pages/CreateVolunteerOpportunity"
import VerifyEmail from "@/pages/VerifyEmail";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
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
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/volunteer" component={Volunteer} />
      <Route path="/stories" component={Stories} />
      <Route path="/transparency" component={Transparency} />
      <Route path="/donate" component={Donate} />
      <Route path="/donation-success/:id" component={DonationSuccess} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/create-campaign" component={CreateCampaign} />
      <Route path="/edit-campaign/:id" component={CreateCampaign} />
      <Route path="/create-story" component={CreateStory} />
      <Route path="/edit-story/:id" component={CreateStory} />
      <Route path="/request-aid" component={RequestAid} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/profile" component={DonorProfile} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/campaign/:id" component={CampaignDetail} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-email/:token" component={VerifyEmail} />
      <Route path="/create-volunteer-opportunity" component={CreateVolunteerOpportunity} />
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
