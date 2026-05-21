import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Users, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

export default function Transparency() {
  const { t } = useTranslation();
  const { data: donations } = useQuery({
    queryKey: ["/api/donations"],
    queryFn: () => apiRequest("GET", "/api/donations").then((res: Response) => res.json()),
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns").then((res: Response) => res.json()),
  });

  const totalRaised = (donations || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
  const totalGoal = (campaigns || []).reduce((sum: number, c: any) => sum + Number(c.goalAmount || 0), 0);

  const fundAllocation = [
    {
      category: "Program Services",
      percentage: 75,
      amount: totalRaised * 0.75,
      color: "bg-chart-1",
    },
    {
      category: "Administrative",
      percentage: 15,
      amount: totalRaised * 0.15,
      color: "bg-chart-2",
    },
    {
      category: "Fundraising",
      percentage: 10,
      amount: totalRaised * 0.1,
      color: "bg-chart-3",
    },
  ];

  const campaignTitleById = new Map((campaigns || []).map((c: any) => [c.id, c.title]));
  const recentDonations = (donations || []).slice(0, 5).map((d: any) => ({
    donor: d.donorId || "Anonymous",
    amount: Number(d.amount || 0),
    campaign: campaignTitleById.get(d.campaignId) || "Unknown Campaign",
    time: d.createdAt ? new Date(d.createdAt).toLocaleString() : "Recently",
  }));

  const completedCampaigns = (campaigns || [])
    .filter((c: any) => c.status === 'completed' || Number(c.raisedAmount) >= Number(c.goalAmount))
    .map((c: any) => ({
      title: c.title,
      raised: Number(c.raisedAmount),
      beneficiaries: Math.max(0, Math.floor(Number(c.raisedAmount) / 10)),
      completion:
        Number(c.goalAmount) > 0
          ? Math.min(100, Math.round((Number(c.raisedAmount) / Number(c.goalAmount)) * 100))
          : 0,
      status: "Completed",
    }));

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("transparency.transparencyDashboard")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("transparency.dashboardDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">{t("transparency.fundAllocation")}</h2>
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
                        {item.amount.toLocaleString()} {t("currency.ETB")}
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
                {t("transparency.auditNote")}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 font-['Poppins']">{t("transparency.liveDonationFeed")}</h2>
            <div className="space-y-4">
              {recentDonations.map((donation: any, index: number) => (
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
                        {donation.amount} {t("currency.ETB")}
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
          <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">{t("transparency.impactMetrics")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-chart-1/10">
                    <span className="text-base font-semibold text-chart-1">ETB</span>
                  </div>
              </div>
              <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="metric-total-raised">
                2.5{t("M")} {t("currency.ETB")}
              </p>
              <p className="text-sm text-muted-foreground">{t("transparency.totalRaisedThisYear")}</p>
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
              <p className="text-sm text-muted-foreground">{t("transparency.beneficiariesHelped")}</p>
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
              <p className="text-sm text-muted-foreground">{t("transparency.activeCampaigns")}</p>
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
              <p className="text-sm text-muted-foreground">{t("transparency.successRate")}</p>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">{t("transparency.recentlyCompletedCampaigns")}</h2>
          <div className="space-y-4">
            {completedCampaigns.map((campaign: any, index: number) => (
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
                        <span className="inline text-sm font-semibold">ETB</span>
                        {campaign.raised.toLocaleString()} {t("transparency.raised")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.beneficiaries.toLocaleString()} {t("transparency.beneficiaries")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary font-['Space_Grotesk']">
                        {campaign.completion}%
                      </p>
                      <p className="text-xs text-muted-foreground">{t("transparency.completed")}</p>
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
