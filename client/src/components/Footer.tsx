import { Heart, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function Footer() {
  const { t } = useTranslation();

  const { data: userData } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json().then(({ user }: any) => user)),
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  const user = userData as { role?: string } | undefined;
  const hideDonorLink = user?.role === "beneficiary";

  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              <span className="text-xl font-bold font-['Poppins']">{t("Welfare")}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("Give with clarity. Help with confidence. Making charitable giving transparent and impactful.")}
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" data-testid="link-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("Support")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/campaigns"><a className="hover:text-foreground transition-colors">{t("Browse Campaigns")}</a></Link></li>
              <li><Link href="/donate"><a className="hover:text-foreground transition-colors">{t("Make a Donation")}</a></Link></li>
              <li><Link href="/transparency"><a className="hover:text-foreground transition-colors">{t("Transparency")}</a></Link></li>
              {!hideDonorLink && (
                <li><Link href="/profile"><a className="hover:text-foreground transition-colors">{t("My Donations")}</a></Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("Get Involved")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/volunteer"><a className="hover:text-foreground transition-colors">{t("Volunteer")}</a></Link></li>
              <li><Link href="/create-campaign"><a className="hover:text-foreground transition-colors">{t("Start a Campaign")}</a></Link></li>
              <li><Link href="/request-aid"><a className="hover:text-foreground transition-colors">{t("Request Aid")}</a></Link></li>
              <li><Link href="/register"><a className="hover:text-foreground transition-colors">{t("Join Welfare")}</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("About")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/stories"><a className="hover:text-foreground transition-colors">{t("Impact Stories")}</a></Link></li>
              <li><Link href="/login"><a className="hover:text-foreground transition-colors">{t("Sign In")}</a></Link></li>
              <li><Link href="/register"><a className="hover:text-foreground transition-colors">{t("Create Account")}</a></Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("FAQ")}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{t("© 2025 Welfare. All rights reserved.")}</p>
          <p>{t("Designed with care by the")} <i>{t("Digital hands Team")}</i></p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">{t("Privacy Policy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("Terms of Service")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
