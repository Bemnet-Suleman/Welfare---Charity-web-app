import { VolunteerCard, VolunteerCardProps } from "@/components/VolunteerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function Volunteer() {
  const {t} = useTranslation();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  // Check if user is authenticated
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
  });

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns", searchQuery, categoryFilter],
    queryFn: () =>
      apiRequest("GET", "/api/campaigns" +
        (searchQuery || categoryFilter !== "all"
          ? `?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`
          : ""))
        .then((r) => r.json()),
  });

  const isDonor = authData?.role === "donor";

  const handleApply = async (campaignId: string) => {
    if (!authData?.id || !isDonor) {
      toast({
        title: t("Access Denied"),
        description: t("Only donor accounts can apply for volunteer opportunities."),
        variant: "destructive",
      });
      if (!authData?.id) {
        navigate("/login");
      }
      return;
    }

    try {
      await apiRequest("POST", "/api/volunteers", {
        userId: authData.id,
        campaignId,
        skills: [],
        availability: "",
        experience: "",
        status: "pending",
      });
      toast({
        title: t("Application Submitted"),
        description: t("Your volunteer application has been submitted successfully!"),
      });
    } catch (error) {
      toast({
        title: t("Application Failed"),
        description: t("Please try again later."),
        variant: "destructive",
      });
    }
  };

  const opportunities: VolunteerCardProps[] =
    (campaigns || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      organization: c.organizer?.name || "Community Organization",
      description: c.description,
      location: c.location || "",
      timeCommitment: "", // not available
      skills: [],
      volunteers: 0,
      spotsLeft: 0,
      onApply: () => handleApply(c.id),
    }));

  if (authLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {t("Loading...")}
        </div>
      </div>
    );
  }

  if (!authData?.id) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-10 text-center">
            <h1 className="text-3xl font-bold mb-4">{t("Sign In Required")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("You need to be logged in to apply for volunteer opportunities. Please sign in or create an account to get started.")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => navigate("/login")}>
                {t("Log In")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/register")}>
                {t("Create Account")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isDonor) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-10 text-center">
            <h1 className="text-3xl font-bold mb-4">{t("Access Restricted")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("Volunteer opportunities are only available to donor accounts. Please use a donor account to apply.")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => navigate("/")}>{t("Return Home")}</Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>{t("View Profile")}</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("Volunteer Opportunities")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Make a difference with your time and skills. Join our community of passionate volunteers creating positive change.")}
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search opportunities...")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-volunteer"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("Filter by category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Categories")}</SelectItem>
              <SelectItem value="healthcare">{t("Healthcare")}</SelectItem>
              <SelectItem value="education">{t("Education")}</SelectItem>
              <SelectItem value="food">{t("Food & Nutrition")}</SelectItem>
              <SelectItem value="environment">{t("Environment")}</SelectItem>
              <SelectItem value="technology">{t("Technology")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-20">{t("Loading opportunities…")}</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">{t("Failed to load opportunities.")}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity, index) => (
            <div
              key={opportunity.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <VolunteerCard {...opportunity} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            {t("Load More Opportunities")}
          </Button>
        </div>
      </div>
    </div>
  );
}
