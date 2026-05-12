import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const donationSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  campaignId: z.string().min(1, "Please select a campaign"),
  amount: z.string().min(1, "Amount is required"),
  donationType: z.string(),
});

type DonationForm = z.infer<typeof donationSchema>;

export default function Donate() {
  const [agreed, setAgreed] = useState(false);
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [hasInvalidCampaignToast, setHasInvalidCampaignToast] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const quickAmounts = [10, 25, 50, 100, 250];
  const [isVerifying, setIsVerifying] = useState(false);

  const campaignIdFromUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("campaignId") || ""
    : "";

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns").then(res => res.json()),
  });

  const { data: userData } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then(res => res.json().then(({ user }: any) => user)),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const user = userData as { id: string; fullName?: string; username?: string; email?: string; role?: string } | undefined;
  const isAuthenticated = Boolean(user);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donationType: "one-time",
      amount: "",
      campaignId: campaignIdFromUrl,
    },
  });

  


  const watchedAmount = watch("amount") || "";
  const watchedCampaignId = watch("campaignId") || "";

  const selectedCampaign = campaigns?.find(
    (c: any) => c.id === watchedCampaignId || c.id === campaignIdFromUrl,
  );

  const pageTitle = selectedCampaign
    ? t("Donate to {{title}}", { title: selectedCampaign.title })
    : t("Make a Donation");

  // Pre-select campaign if campaignId is in URL and handle invalid campaign ID
  useEffect(() => {
    if (!campaignIdFromUrl) {
      setIsCampaignMode(false);
      setHasInvalidCampaignToast(false);
      return;
    }

    if (!campaigns) {
      return;
    }

    const campaign = campaigns.find((c: any) => c.id === campaignIdFromUrl);

    if (campaign) {
      setValue("campaignId", campaignIdFromUrl);
      setValue("donationType", "one-time");
      setIsCampaignMode(true);
      setHasInvalidCampaignToast(false);
    } else {
      setIsCampaignMode(false);
      if (!hasInvalidCampaignToast) {
        toast({
          title: t("Invalid campaign"),
          description: t("The campaign specified in the URL could not be found. Please select another campaign."),
          variant: "destructive",
        });
        setHasInvalidCampaignToast(true);
      }
    }
  }, [campaignIdFromUrl, campaigns, setValue, t, toast, hasInvalidCampaignToast]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get("status");
    const txRef = searchParams.get("tx_ref");

    if (status !== "success" || !txRef) {
      return;
    }

    const verifyDonation = async () => {
      setIsVerifying(true);
      try {
        const response = await apiRequest("GET", `/api/payments/chapa/verify?tx_ref=${encodeURIComponent(txRef)}`);
        await response.json();

        toast({
          title: t("Payment verified"),
          description: t("Your donation has been recorded successfully."),
        });

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("status");
        cleanUrl.searchParams.delete("tx_ref");
        window.history.replaceState({}, "", cleanUrl.toString());
      } catch (error: any) {
        toast({
          title: t("Payment verification failed"),
          description: error?.message || t("Please check your payment status or try again."),
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyDonation();
  }, [t, toast]);

  const onSubmit = async (data: DonationForm) => {
    if (!isAuthenticated) {
      if (!data.firstName || !data.lastName || !data.email) {
        toast({ title: t("Missing info"), description: t("Guest donors must provide full name and email."), variant: "destructive" });
        return;
      }
    }

    try {
      const donationPayload: any = {
        campaignId: data.campaignId,
        amount: data.amount,
        paymentMethod: "chapa",
        message: "",
        donationType: data.donationType,
        email: data.email || user?.email || "",
        firstName: data.firstName || user?.fullName?.split(" ")[0] || user?.username || "Supporter",
        lastName: data.lastName || user?.fullName?.split(" ").slice(1).join(" ") || "",
      };

      if (isAuthenticated && user?.id) {
        donationPayload.donorId = user.id;
        donationPayload.anonymous = false;
      } else {
        donationPayload.donorId = null;
        donationPayload.anonymous = true;
      }

      const response = await apiRequest("POST", "/api/payments/chapa", donationPayload);
      const result = await response.json();

      if (!result?.checkoutUrl) {
        throw new Error(t("Unable to start Chapa checkout."));
      }

      window.location.href = result.checkoutUrl;

      // Reset form or redirect
      setValue("amount", "");
      setValue("campaignId", "");
      if (!isAuthenticated) {
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("email", "");
      }
      setAgreed(false);
    } catch (error: any) {
      toast({
        title: t("Donation Failed"),
        description: error?.message || t("Please try again later."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-16 w-16 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {pageTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {selectedCampaign
              ? t("You are supporting {{title}}. Your donation will directly impact this campaign.", { title: selectedCampaign.title })
              : t("Your generosity creates lasting change. Every contribution makes a real difference in someone's life.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Select Donation Type")}</Label>
                {isCampaignMode && selectedCampaign && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("This donation is for {{title}}, we recommend one-time donations with campaign-specific support.", {
                      title: selectedCampaign.title,
                    })}
                  </p>
                )}
                <RadioGroup {...register("donationType")} onValueChange={(value) => setValue("donationType", value)}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                    <RadioGroupItem value="one-time" id="one-time" data-testid="radio-one-time" />
                    <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                      <p className="font-semibold">{t("One-time Donation")}</p>
                      <p className="text-sm text-muted-foreground">{t("Make an immediate impact")}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                    <RadioGroupItem value="monthly" id="monthly" data-testid="radio-monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <p className="font-semibold">{t("Monthly Donation")}</p>
                      <p className="text-sm text-muted-foreground">{t("Sustained support for ongoing needs")}</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Choose Amount")}</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={watchedAmount === String(amt) ? "default" : "outline"}
                      className={watchedAmount === String(amt) ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => setValue("amount", String(amt))}
                      data-testid={`button-amount-${amt}`}
                    >
                      {amt} Birr
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Birr</span>
                  <Input
                    type="number"
                    placeholder={t("Custom amount")}
                    className="pl-12"
                    {...register("amount")}
                    data-testid="input-custom-amount"
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Select Campaign")}</Label>
                {isCampaignMode && selectedCampaign ? (
                  <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3">
                    <p className="font-medium">{selectedCampaign.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("Campaign-specific donation mode enabled.")}</p>
                  </div>
                ) : (
                  <Select value={watchedCampaignId} onValueChange={(value) => setValue("campaignId", value)}>
                    <SelectTrigger data-testid="select-campaign">
                      <SelectValue placeholder={t("Choose a campaign to support")} />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns?.map((campaign: any) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.campaignId && <p className="text-red-500 text-sm mt-1">{t(errors.campaignId.message as string)}</p>}
              </div>

              {selectedCampaign && (
                <Card className="p-4 rounded-lg border border-secondary/20 bg-secondary/10">
                  <h4 className="font-semibold mb-2">{t("Selected Campaign")}</h4>
                  <p className="font-medium">{selectedCampaign.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t("Category")}: {selectedCampaign.category || t("Unspecified")}</p>
                </Card>
              )}

              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Your Information")}</Label>
                {isAuthenticated ? (
                  <div className="rounded-lg border p-4 bg-muted/10">
                    <p className="font-medium">{t("Logged in as")} {user?.fullName || user?.username || user?.email}</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? t("no email")}</p>
                    <p className="text-sm mt-1">{t("Role")}: {t(user?.role || "donor")}</p>
                    <p className="text-sm mt-1 text-muted-foreground">{t("Donation is assigned to your account automatically.")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t("First Name")}</Label>
                        <Input id="firstName" {...register("firstName")} placeholder={t("John")} data-testid="input-first-name" />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{t(errors.firstName.message as string)}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t("Last Name")}</Label>
                        <Input id="lastName" {...register("lastName")} placeholder={t("Doe")} data-testid="input-last-name" />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{t(errors.lastName.message as string)}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">{t("Email Address")}</Label>
                      <Input id="email" type="email" {...register("email")} placeholder="john@example.com" data-testid="input-email" />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{t(errors.email.message as string)}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Payment Method")}</Label>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">{t("Pay with Chapa (Credit / Debit Card)")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms" 
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  {t("I agree to the terms and conditions and understand that my donation will be used to support the selected cause.")}
                </Label>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
                onClick={handleSubmit(onSubmit)}
                disabled={!agreed || isSubmitting || isVerifying}
                data-testid="button-complete-donation"
              >
                <Heart className="h-5 w-5 mr-2 fill-current" />
                {(isSubmitting || isVerifying)
                  ? t("Processing...")
                  : `${t("Complete Donation of") } ${watchedAmount || "0"} Birr`}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("Your Impact")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">{t("100% of your donation goes directly to the cause")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">{t("Tax-deductible receipt sent instantly")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">{t("Track your impact in real-time")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">{t("Cancel recurring donations anytime")}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <h3 className="font-semibold mb-2">{t("Your donation can provide")}: {watchedAmount || "0"} Birr</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {Math.floor((parseFloat(watchedAmount || "0") / 0.5))} {t("meals for families in need")}</li>
                <li>• {Math.floor(parseFloat(watchedAmount || "0") / 5)} {t("sets of school supplies for children")}</li>
                <li>• {Math.floor(parseFloat(watchedAmount || "0") / 20)} {t("patients with medical care")}</li>
                <li>• {t("Clean water for")} {Math.floor(parseFloat(watchedAmount || "0") / 2)} {t("people")}</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
