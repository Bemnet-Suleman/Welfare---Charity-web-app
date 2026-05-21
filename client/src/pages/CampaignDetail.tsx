import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, CheckCircle2, MapPin, Calendar, Users, TrendingUp } from "lucide-react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

interface Donation {
  donorId?: string;
  amount: string;
}

function parseCampaignDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function CampaignDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns", id],
    queryFn: () => apiRequest("GET", `/api/campaigns/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["/api/campaigns", id, "donations"],
    queryFn: () => apiRequest("GET", `/api/campaigns/${id}/donations`).then((r) => r.json()),
    enabled: !!id,
  });

  const updates = [] as Array<{ id: number; date: string; title: string; content: string }>;

  const topDonors = (donations || [])
    .slice()
    .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map((d: any) => ({ name: d.donorId || "Anonymous", amount: Number(d.amount || 0) }));

  if (isLoading) {
    return <div className="text-center py-20">{t("Loading campaign...")}</div>;
  }

  if (error || !campaign) {
    return <div className="text-center py-20 text-red-500">{t("Unable to load campaign.")}</div>;
  }

  const now = new Date();
  const startDate = parseCampaignDate(campaign.startDate);
  const endDate = parseCampaignDate(campaign.endDate);
  const dateInfoValid = startDate !== null && endDate !== null && endDate.getTime() >= startDate.getTime();
  const daysLeft = dateInfoValid
    ? Math.max(0, Math.ceil((endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const donorCount = donations.length;
  const safeRaised = Number(campaign.raisedAmount || 0);
  const safeGoal = Number(campaign.goalAmount || 1);
  const progress = safeGoal > 0 ? Math.min(100, (safeRaised / safeGoal) * 100) : 0;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = campaign.title || "Support this campaign";
  const shareText = `${shareTitle} - Help impact lives through the Welfare platform.`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedText = encodeURIComponent(shareText);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const emailShareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: currentUrl });
        return;
      }
    } catch (err) {
      console.warn("Web Share API failed", err);
    }

    try {
      if (navigator.clipboard && currentUrl) {
        await navigator.clipboard.writeText(currentUrl);
        alert("Campaign link copied to clipboard.");
        return;
      }
    } catch (err) {
      console.warn("Copy to clipboard failed", err);
    }

    window.prompt("Copy the campaign link:", currentUrl);
  };

  return (
    <div className="min-h-screen py-12 overflow-y-auto">
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
                  {campaign.location || t("Location unavailable")}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {daysLeft !== null ? `${daysLeft} ${t("days left")}` : t("Date info unavailable")}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {donorCount} {t("donors")}
                </span>
              </div>
            </div>

            <Tabs defaultValue="story" className="space-y-6">
              <TabsList>
                <TabsTrigger value="story" data-testid="tab-story">Story</TabsTrigger>
                <TabsTrigger value="updates" data-testid="tab-updates">Updates ({updates.length})</TabsTrigger>
                <TabsTrigger value="donors" data-testid="tab-donors">Donors ({donorCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="story">
                <Card className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-foreground leading-relaxed">{campaign.description}</p>

                    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">How Your Donation Helps</h3>
                    <ul className="space-y-2 text-foreground">
                      <li>50 {t("currency.Birr")} provides emergency food for a family of 5 for one week</li>
                      <li>100 {t("currency.Birr")} supplies clean water for 50 people</li>
                      <li>250 {t("currency.Birr")} provides temporary shelter materials for one family</li>
                      <li>500 {t("currency.Birr")} covers medical care for 20 flood victims</li>
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
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20">{donor.amount} {t("currency.Birr")}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="p-6 lg:sticky lg:top-4 lg:self-start">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold font-['Space_Grotesk']" data-testid="amount-raised">
                      {safeRaised.toLocaleString()} {t("currency.Birr")}
                    </span>
                    <span className="text-muted-foreground">of {safeGoal.toLocaleString()} {t("currency.Birr")}</span>
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <p className="text-sm text-secondary font-medium">{progress.toFixed(0)}% funded</p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/donate?campaignId=${id}`}>
                    <Button
                      size="lg"
                      className="flex-1 bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
                      data-testid="button-donate-now"
                    >
                      <Heart className="h-5 w-5 mr-2 fill-current" />
                      Donate Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={handleShareClick} data-testid="button-share">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{donorCount} donors</span>
                    <span className="text-muted-foreground">{daysLeft !== null ? `${daysLeft} days left` : "Date N/A"}</span>
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
                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Facebook</Button>
                </a>
                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Twitter</Button>
                </a>
                <a href={emailShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Email</Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
