import { Heart, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: userData } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const user = userData as { id: string; username: string; fullName?: string; avatar?: string; role?: string; isVolunteer?: boolean } | undefined;
  const isLoggedIn = Boolean(user);
  const isBeneficiary = user?.role === "beneficiary";

  const profileRoles = new Set<string>();
  if (user?.role) profileRoles.add(user.role);
  if (user?.isVolunteer) profileRoles.add("volunteer");
  const profileRoleLabel =
    profileRoles.size > 0
      ? Array.from(profileRoles)
          .map((role) => getRoleLabel(role, t))
          .join(" • ")
      : getRoleLabel(user?.role, t);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md transition-all">
            <Heart className="h-6 w-6 text-accent fill-accent" />
            <span className="text-xl font-bold font-['Poppins']">{t("Welfare")}</span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-8 mx-auto">
            <div className="flex items-center gap-2">
              <Link href="/campaigns">
                <Button variant="ghost" data-testid="link-campaigns">{t("Campaigns")}</Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="ghost" data-testid="link-volunteer">{t("Volunteer")}</Button>
              </Link>
              <Link href="/stories">
                <Button variant="ghost" className="hidden lg:inline-flex" data-testid="link-stories">{t("Stories")}</Button>
              </Link>
              <Link href="/transparency">
                <Button variant="ghost" className="hidden lg:inline-flex" data-testid="link-transparency">{t("Transparency")}</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className="hidden lg:inline-flex" data-testid="link-about">{t("About Us")}</Button>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                        <AvatarFallback>{(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profileRoleLabel}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("Profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        await apiRequest("POST", "/api/auth/logout");
                        window.location.reload();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("Logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label={t("Switch language")}>
              {i18n.language === 'en' ? 'አማ' : 'EN'}
            </Button>
            <ThemeToggle />
            <div className="flex items-center gap-2 md:hidden">
              {isLoggedIn ? (
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t("Profile")}> 
                      <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                      <AvatarFallback>{(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="min-w-[88px]">{t("Login")}</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="min-w-[88px]">{t("Join")}</Button>
                  </Link>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={mobileMenuOpen ? t("Close menu") : t("Open menu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            <Link href="/campaigns">
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
              <Button variant="ghost" className="w-full justify-start" data-testid="link-stories-mobile" onClick={() => setMobileMenuOpen(false)}>
                {t("Stories")}
              </Button>
            </Link>
            <Link href="/transparency">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-transparency-mobile" onClick={() => setMobileMenuOpen(false)}>
                {t("Transparency")}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-about-mobile" onClick={() => setMobileMenuOpen(false)}>
                {t("About Us")}
              </Button>
            </Link>
            <Link href="/donate">
              <Button 
                className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border" 
                data-testid="button-donate-now-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4 mr-2 fill-current" />
                {t("Donate Now")}
              </Button>
            </Link>
            {isLoggedIn ? (
              <div className="rounded-2xl border border-border bg-background/90 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                    <AvatarFallback>{(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{profileRoleLabel}</p>
                  </div>
                </div>
                <Link href="/profile">
                  <Button className="w-full" data-testid="button-profile-mobile" onClick={() => setMobileMenuOpen(false)}>{t("Profile")}</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await apiRequest("POST", "/api/auth/logout");
                    window.location.reload();
                  }}
                >
                  {t("Logout")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login">
                  <Button className="w-full" data-testid="button-login-mobile">{t("Login")}</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full" data-testid="button-register-mobile">{t("Join")}</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
