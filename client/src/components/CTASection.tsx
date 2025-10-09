import { Button } from "@/components/ui/button";
import { Heart, HandHeart } from "lucide-react";
import { Link } from "wouter";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-['Poppins']">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of donors and volunteers who are changing lives every day. Your contribution, no matter how small, creates lasting impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/donate">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent text-accent-foreground border border-accent-border text-lg px-8 py-6 transition-transform hover:scale-105"
                data-testid="button-start-donating"
              >
                <Heart className="h-5 w-5 mr-2 fill-current" />
                Start Donating
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 transition-transform hover:scale-105"
                data-testid="button-become-volunteer"
              >
                <HandHeart className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            100% transparent. 100% secure. 100% impact-driven.
          </p>
        </div>
      </div>
    </section>
  );
}
