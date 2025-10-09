import { StoryCard, StoryCardProps } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    {
      id: "4",
      quote: "My family received emergency food aid during the drought. Without this support, we would not have survived. Now we're back on our feet and helping others in our community.",
      author: {
        name: "Abebe Tadesse",
        role: "Beneficiary & Community Leader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abebe",
      },
      category: "Emergency Relief",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    },
    {
      id: "5",
      quote: "Thanks to the scholarship fund, I'm now studying medicine. I dream of returning to serve my community as a doctor. This opportunity changed my entire life trajectory.",
      author: {
        name: "Hana Bekele",
        role: "Medical Student",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hana",
      },
      category: "Education Impact",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    },
    {
      id: "6",
      quote: "Clean water wells transformed our village. Our children no longer get sick from contaminated water, and girls can attend school instead of walking hours to fetch water.",
      author: {
        name: "Kedir Ahmed",
        role: "Village Elder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kedir",
      },
      category: "Water & Sanitation",
      image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80",
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
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
