import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: userData } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json().then(({ user }: any) => user)),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const user = userData as { id: string; role?: string } | undefined;
  const isLoggedIn = Boolean(user);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md transition-all">
            <Heart className="h-6 w-6 text-accent fill-accent" />
            <span className="text-xl font-bold font-['Poppins']">{t("Welfare")}</span>
          </Link>

          <nav className="hidden md:flex items-center flex-1 justify-center gap-8">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" data-testid="link-campaigns">{t("Campaigns")}</Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="ghost" data-testid="link-volunteer">{t("Volunteer")}</Button>
              </Link>
              <Link href="/stories">
                <Button variant="ghost" data-testid="link-stories">{t("Stories")}</Button>
              </Link>
              <Link href="/transparency">
                <Button variant="ghost" data-testid="link-transparency">{t("Transparency")}</Button>
              </Link>
              {isLoggedIn && (
                <Link href="/profile">
                  <Button variant="ghost" data-testid="link-profile">{t("Profile")}</Button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Link href="/donate">
                <Button 
                  className="bg-accent hover:bg-accent text-accent-foreground border border-accent-border" 
                  data-testid="button-donate-now"
                >
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  {t("Donate Now")}
                </Button>
              </Link>
              {isLoggedIn ? (
                <Button variant="outline" onClick={async () => {
                  await apiRequest("POST", "/api/auth/logout");
                  window.location.reload();
                }} data-testid="button-logout">
                  {t("Logout")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="outline" data-testid="button-login">{t("Login")}</Button>
                  </Link>
                  <Link href="/register">
                    <Button data-testid="button-register">{t("Join")}</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Switch language">
              {i18n.language === 'en' ? 'አማ' : 'EN'}
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-campaigns-mobile">
                {t("Campaigns")}
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-volunteer-mobile">
                {t("Volunteer")}
              </Button>
            </Link>
            <Link href="/stories">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-stories-mobile">
                {t("Stories")}
              </Button>
            </Link>
            <Link href="/transparency">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-transparency-mobile">
                {t("Transparency")}
              </Button>
            </Link>
            <Link href="/donate">
              <Button 
                className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border" 
                data-testid="button-donate-now-mobile"
              >
                <Heart className="h-4 w-4 mr-2 fill-current" />
                {t("Donate Now")}
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
