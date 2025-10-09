import { StoryCard, StoryCardProps } from "./StoryCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function StoriesSection() {
  //todo: remove mock functionality
  const stories: StoryCardProps[] = [
    {
      id: "1",
      quote: "The medical supplies donated through Welfare saved my son's life. When the hospital ran out of critical medications, these generous donors stepped in. I will be forever grateful.",
      author: {
        name: "Tigist Haile",
        role: "Mother & Beneficiary",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist",
      },
      category: "Healthcare Impact",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
    },
    {
      id: "2",
      quote: "Volunteering with Welfare has been the most rewarding experience of my life. Seeing children smile when they receive their school supplies reminds me why I do this.",
      author: {
        name: "Michael Chen",
        role: "Volunteer Coordinator",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      category: "Volunteer Experience",
    },
    {
      id: "3",
      quote: "As a donor, I appreciate the transparency. I can see exactly where my money goes and the real impact it makes. This platform has restored my faith in charitable giving.",
      author: {
        name: "Sarah Williams",
        role: "Monthly Donor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      category: "Donor Perspective",
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              Stories of Impact
            </h2>
            <p className="text-muted-foreground">Real stories from real people making a difference</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-stories">
            Read More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stories.map((story, index) => (
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
            Read More Stories
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
