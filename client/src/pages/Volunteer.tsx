import { VolunteerCard, VolunteerCardProps } from "@/components/VolunteerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Plus, X, GraduationCap, Calendar, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function Volunteer() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{ id: string; campaignId?: string; title?: string } | null>(null);
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>(["Community Support"]);

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
  });

  const { data: opportunitiesData = [], isLoading, error } = useQuery({
    queryKey: ["/api/public-opportunities-spec"],
    queryFn: () => apiRequest("GET", "/api/volunteers?limit=100").then((res) => res.json()),
  });

  const isDonor = authData?.role === "donor";

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setSkillsList(skillsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInitiateApply = (opp: any) => {
    if (!authData?.id || !isDonor) {
      toast({
        title: t("Access Denied"),
        description: t("Only registered donor profiles can apply to fulfill volunteer assignments."),
        variant: "destructive",
      });
      if (!authData?.id) navigate("/login");
      return;
    }

    setAvailability("");
    setExperience("");
    if (Array.isArray(opp.skills)) {
      setSkillsList(opp.skills);
    } else {
      setSkillsList([t("Community Support")]);
    }
    
    setSelectedOpportunity({ 
      id: opp.id, 
      campaignId: opp.campaignId || opp.id, 
      title: opp.title 
    });
    setIsModalOpen(true);
  };

  const applyMutation = useMutation({
    mutationFn: (applicationPayload: any) => {
      return apiRequest("POST", "/api/volunteers", applicationPayload).then((res) => res.json());
    },
    onSuccess: () => {
      toast({
        title: t("Application Transmitted"),
        description: t("Your specialized application form has been queued for Admin review!"),
      });
      setIsModalOpen(false);
      setAvailability("");
      setExperience("");
      setSkillsList(["Community Support"]);
      queryClient.invalidateQueries({ queryKey: ["/api/public-opportunities-spec"] });
    },
    onError: (err: any) => {
      toast({
        title: t("Submission Failed"),
        description: err.message || t("Could not process parameters."),
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity || !authData?.id) return;

    applyMutation.mutate({
      userId: authData.id,
      campaignId: selectedOpportunity.campaignId,
      skills: skillsList,
      availability,
      experience,
      status: "pending", 
    });
  };

  const listingTemplates = opportunitiesData.filter((op: any) => op.isListing === true);

  const userApplications = opportunitiesData.filter((op: any) => op.isListing !== true);

  const filteredOpportunities: VolunteerCardProps[] = listingTemplates
    .filter((op: any) => {
      const matchesSearch =
        !searchQuery ||
        (op.experience || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(op.skills) && op.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        categoryFilter === "all" ||
        (op.category || "").toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .map((op: any) => {
      const approvedCount = userApplications.filter(
        (app: any) => app.campaignId === op.id || app.campaignId === op.campaignId
      ).length;

      return {
        id: op.id,
        title: op.title || t("Volunteer Assignment"),
        organization: op.organization || t("Community Hub"),
        description: op.description || op.experience || t("No outline details provided for this posting configuration."),
        location: op.location || t("Remote Support"),
        timeCommitment: op.availability || op.duration || t("Flexible Commitments"),
        skills: Array.isArray(op.skills) && op.skills.length > 0 ? op.skills : [t("General Support")],
        volunteers: approvedCount, 
        spotsLeft: Math.max(0, (op.spotsLeft || 5) - approvedCount),
        onApply: () => handleInitiateApply(op),
      };
    });

  if (authLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-lg">{t("Verifying environment access...")}</p>
      </div>
    );
  }

  if (!authData?.id) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-xl shadow-md border">
          <h1 className="text-3xl font-bold mb-4 font-['Poppins']">{t("Sign In Required")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("You need to be logged in to apply for volunteer opportunities. Please sign in or create an account to get started.")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button className="px-6" onClick={() => navigate("/login")}>{t("Log In")}</Button>
            <Button variant="outline" className="px-6" onClick={() => navigate("/register")}>{t("Create Account")}</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isDonor) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-xl shadow-md border">
          <h1 className="text-3xl font-bold mb-4 font-['Poppins']">{t("Access Restricted")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("Volunteer portfolios are tailored exclusively for donor accounts. Change parameters or check configuration fields via your dashboard profile.")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => navigate("/")}>{t("Return Home")}</Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>{t("View Profile")}</Button>
          </div>
        </Card>
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
            {t("Make a difference with your time and skills. Browse through live customized roles managed by administrators.")}
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search opportunities by experience or key requirements...")}
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
          <div className="text-center py-20 text-muted-foreground animate-pulse">{t("Loading open slots...")}</div>
        )}
        
        {error && (
          <div className="text-center py-20 text-destructive font-medium">{t("Failed to load opportunities from directory infrastructure.")}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <div
              key={opportunity.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <VolunteerCard {...opportunity} />
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && !isLoading && (
          <div className="text-center p-12 border border-dashed rounded-xl max-w-md mx-auto text-muted-foreground">
            {t("No customized opportunity configurations found matching that criteria.")}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            {t("Load More Opportunities")}
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Poppins'] text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary animate-bounce" />
              {t("Volunteer Application")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("Sign up or amend timeline commitments to complete this selected layout profile assignment.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {t("Your Time Allocation & Schedule")}
              </label>
              <Input
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder={t("e.g. Weekends, 4 hours on Saturday afternoons, Flexible")}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {t("Core Competencies & Talent Tags")}
              </label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder={t("Add item (e.g. First Aid, Translation, Logistics)")}
                  className="text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-secondary/10 border border-secondary/20 text-secondary text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      className="text-secondary/60 hover:text-secondary rounded-full"
                      onClick={() => handleRemoveSkill(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> {t("Relevant Experience & Intent Statement")}
              </label>
              <Textarea
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={t("Briefly describe why you would like to help this project and share any background experience you possess...")}
                rows={4}
                className="text-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={applyMutation.isPending}
              >
                {t("Cancel")}
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={applyMutation.isPending || !availability || !experience}
              >
                {applyMutation.isPending ? t("Transmitting...") : t("Submit Comprehensive Application")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}