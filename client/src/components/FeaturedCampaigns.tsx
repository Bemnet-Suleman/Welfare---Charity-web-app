import { CampaignCard, CampaignCardProps } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  goalAmount: string;
  raisedAmount: string;
  endDate: string;
  urgent: boolean;
  status: string;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  verified: boolean;
}

export function FeaturedCampaigns() {
  const { t } = useTranslation();
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns").then(res => res.json()),
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => Promise.resolve([]), // We'll fetch users as needed
  });

  const transformCampaignToCardProps = (campaign: any): CampaignCardProps => {
    const endDate = new Date(campaign.endDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      category: campaign.category,
      goalAmount: parseFloat(campaign.goalAmount),
      raisedAmount: parseFloat(campaign.raisedAmount),
      daysLeft,
      urgent: campaign.urgent,
    };
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
                {t("Featured Campaigns")}
              </h2>
              <p className="text-muted-foreground">{t("Loading campaigns...")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            {t("Featured Campaigns")}
          </h2>
          <p className="text-muted-foreground">{t("Unable to load campaigns. Please try again later.")}</p>
        </div>
      </section>
    );
  }

  const campaignCards = campaigns?.map(transformCampaignToCardProps) || [];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              {t("Featured Campaigns")}
            </h2>
            <p className="text-muted-foreground">{t("Make a difference in causes that matter")}</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-campaigns">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {campaignCards.map((campaign: CampaignCardProps, index: number) => (
            <div
              key={campaign.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button variant="outline" className="gap-2" data-testid="button-view-all-campaigns-mobile">
            {t("View All Campaigns")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
