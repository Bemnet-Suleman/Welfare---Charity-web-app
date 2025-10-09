import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, CheckCircle2, MapPin, Calendar, Users, TrendingUp } from "lucide-react";

export default function CampaignDetail() {
  //todo: remove mock functionality - get campaign ID from URL params
  const campaign = {
    title: "Emergency Relief: Flood Victims in Southern Ethiopia",
    description: "Devastating floods have displaced over 5,000 families in Southern Ethiopia. They urgently need food, clean water, shelter, and medical supplies. Your donation will provide immediate relief including emergency food packages, clean water, temporary shelter materials, and essential medical care.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80",
    category: "Disaster Relief",
    goalAmount: 100000,
    raisedAmount: 67000,
    donors: 1243,
    daysLeft: 5,
    location: "Southern Ethiopia",
    organizer: {
      name: "Red Cross Ethiopia",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RC",
      verified: true,
    },
    urgent: true,
  };

  const updates = [
    { id: 1, date: "2025-01-15", title: "1000 families received aid", content: "Thanks to your support, we've distributed emergency supplies to 1000 families." },
    { id: 2, date: "2025-01-12", title: "Medical teams deployed", content: "Mobile medical units are now providing healthcare in affected areas." },
  ];

  const topDonors = [
    { name: "Anonymous", amount: 5000 },
    { name: "Sarah W.", amount: 2500 },
    { name: "Michael C.", amount: 1000 },
  ];

  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-card border-card-border text-card-foreground">{campaign.category}</Badge>
                {campaign.urgent && (
                  <Badge className="bg-destructive text-destructive-foreground animate-pulse">Urgent</Badge>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 font-['Poppins']">{campaign.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {campaign.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {campaign.daysLeft} days left
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {campaign.donors} donors
                </span>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={campaign.organizer.avatar} />
                  <AvatarFallback>{campaign.organizer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">Organized by {campaign.organizer.name}</p>
                  {campaign.organizer.verified && (
                    <div className="flex items-center gap-1 text-sm text-secondary">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Organization
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Tabs defaultValue="story" className="space-y-6">
              <TabsList>
                <TabsTrigger value="story" data-testid="tab-story">Story</TabsTrigger>
                <TabsTrigger value="updates" data-testid="tab-updates">Updates ({updates.length})</TabsTrigger>
                <TabsTrigger value="donors" data-testid="tab-donors">Donors ({campaign.donors})</TabsTrigger>
              </TabsList>

              <TabsContent value="story">
                <Card className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-foreground leading-relaxed">{campaign.description}</p>
                    
                    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">How Your Donation Helps</h3>
                    <ul className="space-y-2 text-foreground">
                      <li>$50 provides emergency food for a family of 5 for one week</li>
                      <li>$100 supplies clean water for 50 people</li>
                      <li>$250 provides temporary shelter materials for one family</li>
                      <li>$500 covers medical care for 20 flood victims</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id} className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-secondary/10">
                        <TrendingUp className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{update.title}</h3>
                          <span className="text-sm text-muted-foreground">{update.date}</span>
                        </div>
                        <p className="text-muted-foreground">{update.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="donors">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Top Donors</h3>
                  <div className="space-y-3">
                    {topDonors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.name}`} />
                            <AvatarFallback>{donor.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{donor.name}</span>
                        </div>
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                          ${donor.amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold font-['Space_Grotesk']" data-testid="amount-raised">
                      ${campaign.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">of ${campaign.goalAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <p className="text-sm text-secondary font-medium">{progress.toFixed(0)}% funded</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
                    data-testid="button-donate-now"
                  >
                    <Heart className="h-5 w-5 mr-2 fill-current" />
                    Donate Now
                  </Button>
                  <Button size="lg" variant="outline" data-testid="button-share">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{campaign.donors} donors</span>
                    <span className="text-muted-foreground">{campaign.daysLeft} days left</span>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <CheckCircle2 className="inline h-4 w-4 mr-1 text-secondary" />
                      100% of donations go directly to relief efforts
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Share Campaign</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Facebook</Button>
                <Button variant="outline" size="sm" className="flex-1">Twitter</Button>
                <Button variant="outline" size="sm" className="flex-1">Email</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
