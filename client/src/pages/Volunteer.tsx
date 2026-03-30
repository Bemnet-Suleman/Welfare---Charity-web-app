import { VolunteerCard, VolunteerCardProps } from "@/components/VolunteerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Volunteer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns", searchQuery, categoryFilter],
    queryFn: () =>
      apiRequest("GET", "/api/campaigns" +
        (searchQuery || categoryFilter !== "all"
          ? `?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`
          : ""))
        .then((r) => r.json()),
  });

  const handleApply = async (campaignId: string) => {
    try {
      await apiRequest("POST", "/api/volunteers", {
        userId: null, // anonymous
        campaignId,
        skills: [],
        availability: "",
        experience: "",
        status: "pending",
      });
      toast({
        title: "Application Submitted",
        description: "Your volunteer application has been submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Please try again later.",
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Volunteer Opportunities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make a difference with your time and skills. Join our community of passionate volunteers creating positive change.
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-volunteer"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="food">Food & Nutrition</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-20">Loading opportunities…</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">Failed to load opportunities.</div>
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
            Load More Opportunities
          </Button>
        </div>
      </div>
    </div>
  );
}
