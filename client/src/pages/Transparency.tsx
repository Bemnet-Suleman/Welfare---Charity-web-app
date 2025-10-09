import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, DollarSign, Users, TrendingUp, Clock } from "lucide-react";

export default function Transparency() {
  //todo: remove mock functionality
  const fundAllocation = [
    { category: "Program Services", percentage: 75, amount: 1875000, color: "bg-chart-1" },
    { category: "Administrative", percentage: 15, amount: 375000, color: "bg-chart-2" },
    { category: "Fundraising", percentage: 10, amount: 250000, color: "bg-chart-3" },
  ];

  const recentDonations = [
    { donor: "Anonymous", amount: 5000, campaign: "Emergency Relief Fund", time: "2 minutes ago" },
    { donor: "Sarah W.", amount: 250, campaign: "School Supplies Drive", time: "15 minutes ago" },
    { donor: "Michael C.", amount: 1000, campaign: "Clean Water Initiative", time: "1 hour ago" },
    { donor: "Ahmed K.", amount: 500, campaign: "Medical Supplies", time: "2 hours ago" },
    { donor: "Jane D.", amount: 2500, campaign: "Education Scholarship", time: "3 hours ago" },
  ];

  const completedCampaigns = [
    {
      title: "Winter Clothing Drive 2024",
      raised: 35000,
      beneficiaries: 1200,
      completion: 100,
      status: "Distributed",
    },
    {
      title: "Emergency Medical Supplies",
      raised: 58000,
      beneficiaries: 850,
      completion: 100,
      status: "Delivered",
    },
    {
      title: "School Reconstruction Project",
      raised: 125000,
      beneficiaries: 500,
      completion: 100,
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Transparency Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See exactly where your donations go. Every dollar is tracked and reported with complete transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">Fund Allocation</h2>
            <div className="space-y-6">
              {fundAllocation.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-['Space_Grotesk']">
                        ${item.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-3" />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <CheckCircle2 className="inline h-4 w-4 mr-1 text-secondary" />
                Our fund allocation is independently audited quarterly. Latest audit: January 2025
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 font-['Poppins']">Live Donation Feed</h2>
            <div className="space-y-4">
              {recentDonations.map((donation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-right-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donation.donor}`} />
                    <AvatarFallback>{donation.donor[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{donation.donor}</p>
                    <p className="text-sm text-muted-foreground truncate">{donation.campaign}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                        ${donation.amount}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{donation.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">Impact Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-chart-1/10">
                  <DollarSign className="h-6 w-6 text-chart-1" />
                </div>
              </div>
              <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="metric-total-raised">
                $2.5M
              </p>
              <p className="text-sm text-muted-foreground">Total Raised This Year</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-chart-2/10">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
              </div>
              <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="metric-beneficiaries">
                45,000
              </p>
              <p className="text-sm text-muted-foreground">Beneficiaries Helped</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <TrendingUp className="h-6 w-6 text-chart-3" />
                </div>
              </div>
              <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="metric-campaigns">
                156
              </p>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-chart-4/10">
                  <CheckCircle2 className="h-6 w-6 text-chart-4" />
                </div>
              </div>
              <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="metric-success-rate">
                89%
              </p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">Recently Completed Campaigns</h2>
          <div className="space-y-4">
            {completedCampaigns.map((campaign, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.title}</h3>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${campaign.raised.toLocaleString()} raised
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.beneficiaries.toLocaleString()} beneficiaries
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary font-['Space_Grotesk']">
                        {campaign.completion}%
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-secondary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
