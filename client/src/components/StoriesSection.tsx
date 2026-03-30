import { StoryCard, StoryCardProps } from "./StoryCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface Story {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category?: string;
  published: boolean;
}

export function StoriesSection() {
  const { t } = useTranslation();
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["/api/stories"],
    queryFn: () => apiRequest("GET", "/api/stories").then(res => res.json()),
  });

  const transformStoryToCardProps = (story: Story): StoryCardProps => {
    return {
      id: story.id,
      quote: story.content.length > 200 ? story.content.substring(0, 200) + "..." : story.content,
      author: {
        name: story.author?.name || "Unknown",
        role: story.author?.role || "Donor",
        avatar: story.author?.avatar || story.image || undefined,
      },
      category: story.category || "Impact Story",
      image: story.image,
    };
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
                {t("Stories of Impact")}
              </h2>
              <p className="text-muted-foreground">{t("Loading stories...")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-80"></div>
              </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            {t("Stories of Impact")}
          </h2>
          <p className="text-muted-foreground">{t("Unable to load stories. Please try again later.")}</p>
        </div>
      </section>
    );
  }

  const storyCards = stories?.map(transformStoryToCardProps) || [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              {t("Stories of Impact")}
            </h2>
            <p className="text-muted-foreground">{t("Real stories from real people making a difference")}</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-stories">
            Read More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {storyCards.map((story: any, index: number) => (
            <div
              key={story.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <StoryCard {...story} />
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button variant="outline" className="gap-2" data-testid="button-view-all-stories-mobile">
            {t("Read More Stories")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
