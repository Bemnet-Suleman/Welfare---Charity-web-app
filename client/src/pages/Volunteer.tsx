import { VolunteerCard, VolunteerCardProps } from "@/components/VolunteerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Volunteer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  //todo: remove mock functionality
  const opportunities: VolunteerCardProps[] = [
    {
      id: "1",
      title: "Medical Outreach Coordinator",
      organization: "Healthcare for All",
      description: "Coordinate mobile health clinics and assist in providing basic healthcare services to underserved communities.",
      location: "Addis Ababa & Surrounding Areas",
      timeCommitment: "4-6 hours/week",
      skills: ["Healthcare", "Organization", "Communication"],
      volunteers: 8,
      spotsLeft: 4,
    },
    {
      id: "2",
      title: "Education Mentor",
      organization: "Learn & Grow Foundation",
      description: "Provide one-on-one tutoring and mentorship to students struggling with their studies. Help shape future leaders.",
      location: "Remote & On-site",
      timeCommitment: "3-4 hours/week",
      skills: ["Teaching", "Patience", "Subject Expertise"],
      volunteers: 15,
      spotsLeft: 5,
    },
    {
      id: "3",
      title: "Community Kitchen Assistant",
      organization: "Feed the Hungry",
      description: "Help prepare and serve meals to families facing food insecurity. Make an immediate impact in your community.",
      location: "Dire Dawa, Ethiopia",
      timeCommitment: "2-3 hours/week",
      skills: ["Cooking", "Teamwork", "Compassion"],
      volunteers: 20,
      spotsLeft: 10,
    },
    {
      id: "4",
      title: "Youth Sports Coach",
      organization: "Active Kids Initiative",
      description: "Lead sports activities and coaching sessions for children in underserved areas. Promote health and teamwork.",
      location: "Bahir Dar, Ethiopia",
      timeCommitment: "5-6 hours/week",
      skills: ["Sports", "Leadership", "Youth Development"],
      volunteers: 6,
      spotsLeft: 2,
    },
    {
      id: "5",
      title: "Tech Skills Trainer",
      organization: "Digital Literacy Foundation",
      description: "Teach basic computer and internet skills to adults seeking employment opportunities in the digital age.",
      location: "Remote",
      timeCommitment: "2-4 hours/week",
      skills: ["Technology", "Teaching", "Patience"],
      volunteers: 12,
      spotsLeft: 8,
    },
    {
      id: "6",
      title: "Environmental Conservation Volunteer",
      organization: "Green Ethiopia",
      description: "Participate in tree planting, waste management, and environmental awareness campaigns.",
      location: "Various Locations",
      timeCommitment: "3-5 hours/week",
      skills: ["Environmental Science", "Outdoor Work", "Community Engagement"],
      volunteers: 18,
      spotsLeft: 12,
    },
  ];

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
