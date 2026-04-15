import { StoryCard, StoryCardProps } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface StoryItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  author?: {
    name: string;
    role: string;
    avatar?: string;
  } | null;
  category?: string;
  published?: boolean;
}

export default function Stories() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["/api/stories", searchQuery, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter !== "all" && categoryFilter !== "donors" && categoryFilter !== "volunteers") {
        params.set("category", categoryFilter);
      }
      const queryString = params.toString();
      return apiRequest("GET", "/api/stories" + (queryString ? `?${queryString}` : "")).then((r) => r.json());
    },
  });

  const transformStory = (story: StoryItem): StoryCardProps => {
    const author = story.author ?? {
      name: "Anonymous",
      role: "Beneficiary",
      avatar: story.image,
    };

    return {
      id: story.id,
      quote: story.content,
      author: {
        name: author.name || "Anonymous",
        role: author.role || "Beneficiary",
        avatar: author.avatar || story.image || undefined,
      },
      category: story.category || "Impact Story",
      image: story.image,
    };
  };

  const storyCards: StoryCardProps[] = ((stories as StoryItem[]) || []).map(transformStory);
  const filteredStories: StoryCardProps[] = storyCards.filter((story) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "donors") return story.author.role.toLowerCase().includes("donor");
    if (categoryFilter === "volunteers") return story.author.role.toLowerCase().includes("volunteer");
    if (categoryFilter === "emergency") {
      const category = story.category.toLowerCase();
      return category.includes("emergency") || category.includes("disaster") || category.includes("relief");
    }
    return story.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });


  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("Stories of Impact")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Real stories from donors, volunteers, and beneficiaries. Discover how your contribution creates lasting change.")}
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search stories...")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-stories"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("Filter by category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="select-item-all">{t("All Categories")}</SelectItem>
              <SelectItem value="health" data-testid="select-item-health">{t("Health")}</SelectItem>
              <SelectItem value="education" data-testid="select-item-education">{t("Education")}</SelectItem>
              <SelectItem value="emergency" data-testid="select-item-emergency">{t("Emergency Relief")}</SelectItem>
              <SelectItem value="donors" data-testid="select-item-donors">{t("Donor Stories")}</SelectItem>
              <SelectItem value="volunteers" data-testid="select-item-volunteers">{t("Volunteer Stories")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-20">{t("Loading stories…")}</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500">{t("Failed to load stories.")}</div>
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
            {t("Load More Stories")}
          </Button>
        </div>
      </div>
    </div>
  );
}
