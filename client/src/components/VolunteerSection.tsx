import { VolunteerCard, VolunteerCardProps } from "./VolunteerCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export function VolunteerSection() {
  const { t } = useTranslation();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["volunteerOpportunities"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/api/campaigns?limit=3").then((response) => response.json());
      if (!Array.isArray(data)) return [];
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const opportunities: VolunteerCardProps[] = (campaigns || []).map((item: any) => ({
    id: item.id || String(item.organizerId || Math.random()),
    title: item.title || item.role || "Volunteer Opportunity",
    organization: item.organizer?.name || item.organization || item.campaign || "Community Partner",
    description: item.description || "No description provided.",
    location: item.location || "Remote",
    timeCommitment: item.timeCommitment || item.duration || "Flexible",
    skills: item.skills || item.tags || ["Community"],
    volunteers: item.volunteers || item.participants || 0,
    spotsLeft: item.spotsLeft || item.openSpots || 1,
  }));

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
                {t("Volunteer Opportunities")}
              </h2>
              <p className="text-muted-foreground">{t("Loading volunteer opportunities...")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-muted p-6 h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              {t("Volunteer Opportunities")}
            </h2>
            <p className="text-muted-foreground">{t("Unable to load volunteer opportunities. Please try again later.")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              {t("Volunteer Opportunities")}
            </h2>
            <p className="text-muted-foreground">{t("Lend your time and skills to make a difference")}</p>
          </div>
          <Link href="/volunteer">
            <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-opportunities">
              {t("View All")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <VolunteerCard {...opportunity} />
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-muted p-10 text-center text-muted-foreground">
              {t("No volunteer opportunities are available right now. Check back soon!")}
            </div>
          )}
        </div>

        <div className="text-center md:hidden">
          <Link href="/volunteer">
            <Button variant="outline" className="gap-2" data-testid="button-view-all-opportunities-mobile">
              {t("View All Opportunities")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
