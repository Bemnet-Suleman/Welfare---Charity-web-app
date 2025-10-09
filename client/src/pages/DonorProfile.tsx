import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Award, Calendar, DollarSign, Users } from "lucide-react";

export default function DonorProfile() {
  //todo: remove mock functionality
  const donorStats = {
    totalDonated: 12500,
    campaignsSupported: 23,
    livesImpacted: 450,
    monthlyDonations: 4,
  };

  const donationHistory = [
    { id: 1, campaign: "Emergency Relief Fund", amount: 5000, date: "2025-01-15", status: "completed" },
    { id: 2, campaign: "School Supplies Drive", amount: 250, date: "2025-01-10", status: "completed" },
    { id: 3, campaign: "Clean Water Initiative", amount: 1000, date: "2025-01-05", status: "completed" },
    { id: 4, campaign: "Medical Supplies", amount: 500, date: "2024-12-28", status: "completed" },
  ];

  const activeCampaigns = [
    {
      id: 1,
      title: "Education Scholarship Fund",
      donated: 1000,
      goal: 50000,
      progress: 65,
      lastUpdate: "3 days ago",
    },
    {
      id: 2,
      title: "Community Healthcare Center",
      donated: 2500,
      goal: 100000,
      progress: 42,
      lastUpdate: "1 week ago",
    },
  ];

  const badges = [
    { name: "Monthly Donor", icon: Heart, color: "text-accent" },
    { name: "5K Club", icon: DollarSign, color: "text-chart-1" },
    { name: "Impact Leader", icon: Users, color: "text-chart-2" },
    { name: "Early Supporter", icon: Award, color: "text-chart-3" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=donor" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2 font-['Poppins']">John Doe</h1>
              <p className="text-muted-foreground mb-4">Member since January 2024</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={index} variant="secondary" className="gap-1">
                      <Icon className={`h-3 w-3 ${badge.color}`} />
                      {badge.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button variant="outline" data-testid="button-edit-profile">
              Edit Profile
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-1/10">
                <DollarSign className="h-6 w-6 text-chart-1" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-total-donated">
              ${donorStats.totalDonated.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Donated</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-2/10">
                <Heart className="h-6 w-6 text-chart-2" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-campaigns-supported">
              {donorStats.campaignsSupported}
            </p>
            <p className="text-sm text-muted-foreground">Campaigns Supported</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-3/10">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-lives-impacted">
              {donorStats.livesImpacted}
            </p>
            <p className="text-sm text-muted-foreground">Lives Impacted</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <TrendingUp className="h-6 w-6 text-chart-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-monthly-donations">
              {donorStats.monthlyDonations}
            </p>
            <p className="text-sm text-muted-foreground">Monthly Donations</p>
          </Card>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="history" data-testid="tab-history">Donation History</TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">My Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 font-['Poppins']">Donation History</h2>
              <div className="space-y-3">
                {donationHistory.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{donation.campaign}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{donation.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-['Space_Grotesk']">${donation.amount}</p>
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20 mt-1">
                        {donation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground">Last update: {campaign.lastUpdate}</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-campaign-${campaign.id}`}>
                      View Campaign
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Your contribution: ${campaign.donated}</span>
                      <span className="text-muted-foreground">Goal: ${campaign.goal.toLocaleString()}</span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                    <p className="text-sm text-secondary">{campaign.progress}% funded</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="impact">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 font-['Poppins']">Your Impact Story</h2>
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">
                    Thanks to your generous donations, you've helped provide:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-1 mb-1">1,200+</p>
                    <p className="text-sm text-muted-foreground">Meals provided to families</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-2 mb-1">45</p>
                    <p className="text-sm text-muted-foreground">Children educated</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-3 mb-1">23</p>
                    <p className="text-sm text-muted-foreground">Medical treatments funded</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-4 mb-1">8</p>
                    <p className="text-sm text-muted-foreground">Clean water wells built</p>
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border" data-testid="button-share-impact">
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Share My Impact Story
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
