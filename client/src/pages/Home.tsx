import { HeroSection } from "@/components/HeroSection";
import { FeaturedCampaigns } from "@/components/FeaturedCampaigns";
import { ImpactStats } from "@/components/ImpactStats";
import { StoriesSection } from "@/components/StoriesSection";
import { VolunteerSection } from "@/components/VolunteerSection";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ImpactStats />
      <FeaturedCampaigns />
      <StoriesSection />
      <VolunteerSection />
      <CTASection />
    </div>
  );
}
