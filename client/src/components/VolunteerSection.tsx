import { VolunteerCard, VolunteerCardProps } from "./VolunteerCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function VolunteerSection() {
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
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              Volunteer Opportunities
            </h2>
            <p className="text-muted-foreground">Lend your time and skills to make a difference</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-opportunities">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opportunities.map((opportunity, index) => (
            <div
              key={opportunity.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <VolunteerCard {...opportunity} />
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button variant="outline" className="gap-2" data-testid="button-view-all-opportunities-mobile">
            View All Opportunities
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
