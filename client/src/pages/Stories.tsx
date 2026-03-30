import { StoryCard, StoryCardProps } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["/api/stories", searchQuery, categoryFilter],
    queryFn: () =>
      apiRequest("GET", "/api/stories" +
        (searchQuery || categoryFilter !== "all"
          ? `?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`
          : ""))
        .then((r) => r.json()),
  });

  const filteredStories: StoryCardProps[] = stories || [];


  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Stories of Impact
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from donors, volunteers, and beneficiaries. Discover how your contribution creates lasting change.
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-stories"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stories</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="emergency">Emergency Relief</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-20">Loading stories…</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">Failed to load stories.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredStories || []).map((story, index) => (
            <div
              key={story.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StoryCard {...story} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            Load More Stories
          </Button>
        </div>
      </div>
    </div>
  );
}
