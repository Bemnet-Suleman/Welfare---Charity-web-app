import { CampaignCard, CampaignCardProps } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedCampaigns() {
  //todo: remove mock functionality
  const campaigns: CampaignCardProps[] = [
    {
      id: "1",
      title: "Emergency Relief: Flood Victims in Southern Ethiopia",
      description: "Provide immediate aid including food, water, shelter, and medical supplies to families affected by devastating floods.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      category: "Disaster Relief",
      goalAmount: 100000,
      raisedAmount: 67000,
      daysLeft: 5,
      organizer: {
        name: "Red Cross Ethiopia",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RC",
        verified: true,
      },
      urgent: true,
    },
    {
      id: "2",
      title: "Clean Water Wells for Rural Communities",
      description: "Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.",
      image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80",
      category: "Healthcare",
      goalAmount: 75000,
      raisedAmount: 52000,
      daysLeft: 15,
      organizer: {
        name: "Water for Life",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=WL",
        verified: true,
      },
    },
    {
      id: "3",
      title: "School Supplies for 500 Students",
      description: "Equip underprivileged children with essential school supplies, textbooks, and learning materials for the academic year.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      category: "Education",
      goalAmount: 25000,
      raisedAmount: 18500,
      daysLeft: 20,
      organizer: {
        name: "Education First",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EF",
        verified: true,
      },
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
              Featured Campaigns
            </h2>
            <p className="text-muted-foreground">Make a difference in causes that matter</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" data-testid="button-view-all-campaigns">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {campaigns.map((campaign, index) => (
            <div 
              key={campaign.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button variant="outline" className="gap-2" data-testid="button-view-all-campaigns-mobile">
            View All Campaigns
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
