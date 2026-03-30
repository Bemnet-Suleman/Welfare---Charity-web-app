import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Award, Calendar, DollarSign, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface DonationRecord {
  id: string;
  campaignId: string;
  amount: number;
  createdAt: string;
  status?: string;
}

interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

interface DonationHistoryItem {
  id: string;
  campaign: string;
  amount: number;
  date: string;
  status: string;
}

interface Campaign {
  id: string;
  title: string;
  donated: number;
  goal: number;
  progress: number;
  lastUpdate: string;
}

export default function DonorProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    avatar: "",
    password: "",
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json().then(({ user }: any) => user)),
    retry: 1,
  });

  const user = userData as UserProfile | undefined;
  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";

  useEffect(() => {
    if (user) {
      setEditFormData({
        username: user.username || "",
        fullName: user.fullName || "",
        email: user.email || "",
        avatar: user.avatar || "",
        password: "",
      });
    }
  }, [user]);
  const isDonor = user?.role === "donor" || !user?.role;

  const userId = user?.id;

  const { data: donationsData = [], isLoading: donationsLoading } = useQuery({
    queryKey: ["donations", userId],
    queryFn: () => apiRequest("GET", `/api/donations?donorId=${userId}`).then((res) => res.json()),
    enabled: !!userId,
    retry: 1,
  });

  const donations = donationsData as DonationRecord[];

  const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const campaignsSupported = new Set(donations.map((d) => d.campaignId)).size;
  const livesImpacted = Math.round(totalDonated * 0.1);
  const monthlyDonations = donations.filter((d) => {
    const date = new Date(d.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const donationHistory: DonationHistoryItem[] = donations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((donation) => ({
      id: donation.id,
      campaign: `Campaign ${donation.campaignId.slice(0, 6)}`,
      amount: Number(donation.amount),
      date: new Date(donation.createdAt).toLocaleDateString(),
      status: donation.status || "completed",
    })) as DonationHistoryItem[];

  const updateProfile = async () => {
    if (!user?.id) return;

    try {
      const payload: any = {
        username: editFormData.username,
        fullName: editFormData.fullName,
        email: editFormData.email,
        avatar: editFormData.avatar,
      };

      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      const response = await apiRequest("PUT", `/api/users/${user.id}`, payload);
      const updated = await response.json();

      queryClient.setQueryData(["auth/me"], updated.user);
      queryClient.invalidateQueries({ queryKey: ["auth/me"] });

      toast({
        title: t("donorProfile.profileUpdated"),
        description: t("donorProfile.changesSaved"),
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: t("donorProfile.updateFailed"),
        description: error.message || t("donorProfile.couldNotUpdate"),
        variant: "destructive",
      });
    }
  };

  const activeCampaigns: Campaign[] = Array.from(new Map(
    donations
      .slice(0, 2)
      .map((donation) => [
        donation.campaignId,
        {
          id: donation.campaignId,
          title: `Campaign ${donation.campaignId.slice(0, 6)}`,
          donated: Number(donation.amount),
          goal: 50000,
          progress: Math.min(100, Math.round((Number(donation.amount) / 50000) * 100)),
          lastUpdate: "Recent",
        },
      ]),
  ).values()) as Campaign[];

  if (userLoading || donationsLoading) {
    return <div className="text-center py-24">{t("donorProfile.loadingProfile")}</div>;
  }

  if (!user) {
    return <div className="text-center py-24">{t("donorProfile.signInToView")}</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=user"} />
              <AvatarFallback>{(user.fullName || user.username || "U")[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2 font-['Poppins']">{user.fullName || user.username}</h1>
              <p className="text-muted-foreground mb-2">Member since {new Date(user.createdAt ?? Date.now()).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {isAdmin
                  ? t("donorProfile.adminDescription")
                  : isOrganizer
                  ? t("donorProfile.organizerDescription")
                  : t("donorProfile.donorDescription")}
              </p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="gap-1">{isAdmin ? t("donorProfile.charityAdmin") : isOrganizer ? t("donorProfile.organization") : t("donorProfile.donor")}</Badge>
                <Badge variant="secondary" className="gap-1">{user.role || "donor"}</Badge>
                <Badge variant="secondary" className="gap-1">{campaignsSupported} {t("donorProfile.donations")}</Badge>
              </div>
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="username">{t("donorProfile.username")}</Label>
                    <Input
                      id="username"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">{t("donorProfile.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">{t("donorProfile.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar">{t("donorProfile.avatarUrl")}</Label>
                    <Input
                      id="avatar"
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">{t("donorProfile.newPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full"
                    placeholder={t("donorProfile.leaveEmptyPassword")}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={updateProfile}
                    data-testid="button-save-profile"
                  >
                    {t("donorProfile.saveProfile")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    data-testid="button-cancel-profile"
                  >
                    {t("donorProfile.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-profile"
              >
                {t("donorProfile.editProfile")}
              </Button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-1/10">
                <DollarSign className="h-6 w-6 text-chart-1" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-total-donated">${totalDonated.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{t("donorProfile.totalDonated")}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-2/10">
                <Heart className="h-6 w-6 text-chart-2" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-campaigns-supported">{campaignsSupported}</p>
            <p className="text-sm text-muted-foreground">{t("donorProfile.campaignsSupported")}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-3/10">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-lives-impacted">{livesImpacted}</p>
            <p className="text-sm text-muted-foreground">{t("donorProfile.livesImpacted")}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <TrendingUp className="h-6 w-6 text-chart-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid="stat-monthly-donations">{monthlyDonations}</p>
            <p className="text-sm text-muted-foreground">{t("donorProfile.monthlyDonations")}</p>
          </Card>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="history" data-testid="tab-history">{t("donorProfile.donationHistory")}</TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">{t("donorProfile.activeCampaigns")}</TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">{t("donorProfile.myImpact")}</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 font-['Poppins']">{t("donorProfile.donationHistory")}</h2>
              <div className="space-y-3">
                {!isDonor ? (
                  <p className="text-muted-foreground">{t("donorProfile.donationHistoryUnavailable")}</p>
                ) : donationHistory.length === 0 ? (
                  <p className="text-muted-foreground">{t("donorProfile.noDonationsYet")}</p>
                ) : (
                  donationHistory.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate transition-all">
                      <div className="flex-1">
                        <p className="font-medium">{donation.campaign}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{donation.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-['Space_Grotesk']">${donation.amount.toLocaleString()}</p>
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20 mt-1">{donation.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            {isAdmin ? (
              <p className="text-muted-foreground">{t("donorProfile.adminCampaignMessage")}</p>
            ) : !isDonor ? (
              <p className="text-muted-foreground">{t("donorProfile.organizerCampaignMessage")}</p>
            ) : activeCampaigns.length === 0 ? (
              <p className="text-muted-foreground">{t("donorProfile.noActiveContributions")}</p>
            ) : (
              activeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">{t("donorProfile.lastUpdate")}: {campaign.lastUpdate}</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-campaign-${campaign.id}`}>
                        {t("donorProfile.viewCampaign")}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{t("donorProfile.yourContribution")}: ${campaign.donated.toLocaleString()}</span>
                        <span className="text-muted-foreground">{t("donorProfile.goal")}: ${campaign.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                      <p className="text-sm text-secondary">{campaign.progress}% {t("donorProfile.funded")}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="impact">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 font-['Poppins']">{t("donorProfile.yourImpactStory")}</h2>
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">{t("donorProfile.impactThanks")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-1 mb-1">{Math.round(totalDonated / 10).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{t("donorProfile.mealsProvided")}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-2 mb-1">{Math.round(totalDonated / 100).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{t("donorProfile.childrenEducated")}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-3 mb-1">{Math.round(totalDonated / 200).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{t("donorProfile.medicalTreatments")}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-chart-4 mb-1">{livesImpacted.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{t("donorProfile.cleanWaterWells")}</p>
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border" data-testid="button-share-impact">
                  <Heart className="h-4 w-4 mr-2 fill-current" /> {t("donorProfile.shareMyImpact")}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
