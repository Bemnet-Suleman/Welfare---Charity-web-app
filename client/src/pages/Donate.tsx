import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";
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
  const { t } = useTranslation();
  const { toast } = useToast();

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
  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donationType: "one-time",
    },
  });

  const watchedAmount = watch("amount");
  const watchedCampaignId = watch("campaignId");

  const quickAmounts = ["25", "50", "100", "250", "500"];

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
        paymentMethod: "card",
        message: "",
        donationType: data.donationType,
      };

      if (isAuthenticated && user?.id) {
        donationPayload.donorId = user.id;
        donationPayload.anonymous = false;
      } else {
        donationPayload.donorId = null;
        donationPayload.anonymous = true;
      }

      await apiRequest("POST", "/api/donations", donationPayload);

      toast({
        title: t("Donation Successful"),
        description: isAuthenticated ? t("Thanks for donating as a registered supporter!") : t("Thanks for donating as a guest supporter!"),
      });

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
            {t("Make a Donation")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Your generosity creates lasting change. Every contribution makes a real difference in someone's life.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Select Donation Type")}</Label>
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
                      variant={watchedAmount === amt ? "default" : "outline"}
                      className={watchedAmount === amt ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => setValue("amount", amt)}
                      data-testid={`button-amount-${amt}`}
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder={t("Custom amount")}
                    className="pl-8"
                    {...register("amount")}
                    data-testid="input-custom-amount"
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">{t("Select Campaign")}</Label>
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
                {errors.campaignId && <p className="text-red-500 text-sm mt-1">{t(errors.campaignId.message as string)}</p>}
              </div>

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
                      <span className="font-medium">{t("Credit / Debit Card")}</span>
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
                disabled={!agreed || isSubmitting}
                data-testid="button-complete-donation"
              >
                <Heart className="h-5 w-5 mr-2 fill-current" />
                {isSubmitting ? t("Processing...") : `${t("Complete Donation of") } $${watchedAmount || "0"}`}
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
              <h3 className="font-semibold mb-2">{t("Your donation can provide")}: ${watchedAmount || "0"}</h3>
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
