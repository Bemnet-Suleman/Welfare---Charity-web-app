import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, CheckCircle2, MapPin, Calendar, Users, TrendingUp, Plus, Trash2 } from "lucide-react";
import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { formatLargeNumber } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

interface Donation {
  id: string;
  donorId?: string;
  donorName?: string;
  donorAvatar?: string;
  anonymous?: boolean;
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
  const queryClient = useQueryClient();

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

  const { data: updates = [] } = useQuery<Array<{ id: string; title: string; content: string; createdAt: string; author?: { name: string } }>>({
    queryKey: ["/api/stories", id, "updates"],
    queryFn: () => apiRequest("GET", `/api/stories?campaignId=${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: authData } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = authData?.role === "admin" || authData?.role === "system_admin";

  const donorGroups = (donations || [])
    .filter((d: any) => !d.anonymous)
    .reduce((map: Record<string, { id: string; name: string; amount: number; avatar: string; donations: number }>, donation: any) => {
      const key = donation.donorId || donation.donorName || `guest-${donation.id}`;
      const name = donation.donorName || t("Guest");
      const avatar = donation.donorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      if (!map[key]) {
        map[key] = {
          id: key,
          name,
          amount: Number(donation.amount || 0),
          avatar,
          donations: 1,
        };
      } else {
        map[key].amount += Number(donation.amount || 0);
        map[key].donations += 1;
      }

      return map;
    }, {});

  const uniqueDonors = Object.values(donorGroups);
  const topDonors = uniqueDonors
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const donorCount = uniqueDonors.length + donations.filter((d: any) => d.anonymous).length;

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm(t("Are you sure you want to delete this update?"))) return;
    try {
      await apiRequest("DELETE", `/api/stories/${updateId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/stories", id, "updates"] });
    } catch (err: any) {
      alert(t("Failed to delete update"));
    }
  };

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

  const safeRaised = Number(campaign.raisedAmount || 0);
  const safeGoal = Number(campaign.goalAmount || 1);
  const progress = safeGoal > 0 ? Math.min(100, (safeRaised / safeGoal) * 100) : 0;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = campaign.title || t("Support this campaign");
  const shareText = `${shareTitle} - ${t("Help impact lives through the Welfare platform.")}`;

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
        alert(t("Campaign link copied to clipboard."));
        return;
      }
    } catch (err) {
      console.warn("Copy to clipboard failed", err);
    }

    window.prompt(t("Copy the campaign link:"), currentUrl);
  };

  return (
    <div className="min-h-screen py-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-card border-card-border text-card-foreground">{campaign.category ? t(campaign.category) : t("Unspecified")}</Badge>
                {campaign.urgent && (
                  <Badge className="bg-destructive text-destructive-foreground animate-pulse">{t("Urgent")}</Badge>
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
                <TabsTrigger value="story" data-testid="tab-story">{t("Story")}</TabsTrigger>
                <TabsTrigger value="updates" data-testid="tab-updates">{`${t("Updates")} (${updates.length})`}</TabsTrigger>
                <TabsTrigger value="donors" data-testid="tab-donors">{`${t("Donors")} (${donorCount})`}</TabsTrigger>
              </TabsList>

              <TabsContent value="story">
                <Card className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-foreground leading-relaxed">{campaign.description}</p>

                    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{t("How Your Donation Helps")}</h3>
                    <ul className="space-y-2 text-foreground">
                      <li>{t("5,000 Birr provides emergency food for a family of 5 for one week")}</li>
                      <li>{t("10,000 Birr supplies clean water for 50 people")}</li>
                      <li>{t("25,000 Birr provides temporary shelter materials for one family")}</li>
                      <li>{t("50,000 Birr covers medical care for 20 flood victims")}</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="space-y-4">
                {isAdmin && (
                  <Link href={`/create-story?campaignId=${id}`}>
                    <Button size="sm" className="mb-4">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("Add Update")}
                    </Button>
                  </Link>
                )}
                {updates.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>{t("No campaign updates yet. Check back soon for the latest impact news.")}</p>
                  </Card>
                ) : (
                  updates.map((update) => (
                    <Card key={update.id} className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-secondary/10">
                          <TrendingUp className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{update.title}</h3>
                              <span className="text-sm text-muted-foreground">{update.author?.name && `${t("by")} ${update.author.name}`}</span>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUpdate(update.id)}
                                className="text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(update.createdAt).toLocaleDateString()}</span>
                          <p className="text-muted-foreground mt-2">{update.content}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="donors">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">{t("Top Donors")} ({uniqueDonors.length} {t("donors")}, {donations.length} {t("donations")})</h3>
                  {uniqueDonors.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("No public donations yet")}</p>
                  ) : (
                    <div className="space-y-3">
                      {topDonors.map((donor) => (
                        <div key={donor.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={donor.avatar} />
                              <AvatarFallback>{(donor.name || "").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{donor.name}</span>
                          </div>
                          <Badge className="bg-secondary/10 text-secondary border-secondary/20">{formatLargeNumber(donor.amount, t)} {t("currency.Birr")}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {donations.filter((d: any) => d.anonymous).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">{donations.filter((d: any) => d.anonymous).length} {t("anonymous donations")}</p>
                    </div>
                  )}
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
                      {formatLargeNumber(safeRaised, t)} {t("currency.Birr")}
                    </span>
                    <span className="text-muted-foreground">of {formatLargeNumber(safeGoal, t)} {t("currency.Birr")}</span>
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
                      {t("Donate Now")}
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={handleShareClick} data-testid="button-share">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {isAdmin && (
                  <div className="pt-4">
                    <Link href={`/create-story?campaignId=${id}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("Add Campaign Update")}
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{donorCount} {t("donors")}</span>
                    <span className="text-muted-foreground">{daysLeft !== null ? `${daysLeft} ${t("days left")}` : t("Date N/A")}</span>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <CheckCircle2 className="inline h-4 w-4 mr-1 text-secondary" />
                      {t("100% of donations go directly to relief efforts")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">{t("Share Campaign")}</h3>
              <div className="flex gap-2">
                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">{t("Facebook")}</Button>
                </a>
                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">{t("Twitter")}</Button>
                </a>
                <a href={emailShareUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">{t("Email")}</Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
