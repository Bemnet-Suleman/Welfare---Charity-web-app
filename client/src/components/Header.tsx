import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Link } from "wouter";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md transition-all">
            <Heart className="h-6 w-6 text-accent fill-accent" />
            <span className="text-xl font-bold font-['Poppins']">Welfare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" data-testid="link-campaigns">Campaigns</Button>
            </Link>
            <Link href="/volunteer">
              <Button variant="ghost" data-testid="link-volunteer">Volunteer</Button>
            </Link>
            <Link href="/stories">
              <Button variant="ghost" data-testid="link-stories">Stories</Button>
            </Link>
            <Link href="/transparency">
              <Button variant="ghost" data-testid="link-transparency">Transparency</Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              className="hidden md:flex bg-accent hover:bg-accent text-accent-foreground border border-accent-border" 
              data-testid="button-donate-now"
            >
              <Heart className="h-4 w-4 mr-2 fill-current" />
              Donate Now
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-campaigns-mobile">
                Campaigns
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-volunteer-mobile">
                Volunteer
              </Button>
            </Link>
            <Link href="/stories">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-stories-mobile">
                Stories
              </Button>
            </Link>
            <Link href="/transparency">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-transparency-mobile">
                Transparency
              </Button>
            </Link>
            <Button 
              className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border" 
              data-testid="button-donate-now-mobile"
            >
              <Heart className="h-4 w-4 mr-2 fill-current" />
              Donate Now
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
