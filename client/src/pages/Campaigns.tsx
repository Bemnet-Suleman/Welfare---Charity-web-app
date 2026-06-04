import { CampaignCard, CampaignCardProps } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { t } = useTranslation();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns", searchQuery, categoryFilter],
    queryFn: () =>
      apiRequest("GET", "/api/campaigns" +
        (searchQuery || categoryFilter !== "all"
          ? `?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`
          : ""))
        .then((r) => r.json()),
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

  const campaignCards: CampaignCardProps[] = (campaigns || []).map(transformCampaignToCardProps);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("Campaigns")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Browse all active campaigns and find causes that matter to you. Every contribution makes a difference.")}
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search campaigns...")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-campaigns"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("Filter by category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Categories")}</SelectItem>
              <SelectItem value="education">{t("Education")}</SelectItem>
              <SelectItem value="healthcare">{t("Healthcare")}</SelectItem>
              <SelectItem value="food">{t("Food & Nutrition")}</SelectItem>
              <SelectItem value="environment">{t("Environment")}</SelectItem>
              <SelectItem value="Disaster Relief">{t("Emergency Relief")}</SelectItem>
              <SelectItem value="water">{t("Water & Sanitation")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-20">{t("Loading campaigns...")}</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">{t("Unable to load campaigns. Please try again later.")}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignCards.map((campaign, index) => (
            <div
              key={campaign.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            {t("Load More Campaigns")}
          </Button>
        </div>
      </div>
    </div>
  );
}