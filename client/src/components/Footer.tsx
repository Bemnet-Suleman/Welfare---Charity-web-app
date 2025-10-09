import { Heart, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              <span className="text-xl font-bold font-['Poppins']">Welfare</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Give with clarity. Help with confidence. Making charitable giving transparent and impactful.
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
            <h3 className="font-semibold mb-4">For Donors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><a className="hover:text-foreground transition-colors">Browse Campaigns</a></Link></li>
              <li><Link href="/donate"><a className="hover:text-foreground transition-colors">Make a Donation</a></Link></li>
              <li><Link href="/transparency"><a className="hover:text-foreground transition-colors">Transparency</a></Link></li>
              <li><Link href="/profile"><a className="hover:text-foreground transition-colors">My Donations</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/volunteer"><a className="hover:text-foreground transition-colors">Volunteer</a></Link></li>
              <li><Link href="/create-campaign"><a className="hover:text-foreground transition-colors">Start a Campaign</a></Link></li>
              <li><Link href="/request-aid"><a className="hover:text-foreground transition-colors">Request Aid</a></Link></li>
              <li><Link href="/register"><a className="hover:text-foreground transition-colors">Join Welfare</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/stories"><a className="hover:text-foreground transition-colors">Impact Stories</a></Link></li>
              <li><Link href="/login"><a className="hover:text-foreground transition-colors">Sign In</a></Link></li>
              <li><Link href="/register"><a className="hover:text-foreground transition-colors">Create Account</a></Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Welfare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
