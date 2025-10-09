import { Heart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export function HeroSection() {
  const [stats, setStats] = useState({ donations: 0, lives: 0, volunteers: 0 });

  useEffect(() => {
    //todo: remove mock functionality
    const intervals = [
      setInterval(() => {
        setStats(prev => ({ ...prev, donations: Math.min(prev.donations + 15000, 2500000) }));
      }, 50),
      setInterval(() => {
        setStats(prev => ({ ...prev, lives: Math.min(prev.lives + 150, 45000) }));
      }, 50),
      setInterval(() => {
        setStats(prev => ({ ...prev, volunteers: Math.min(prev.volunteers + 10, 5200) }));
      }, 50),
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-['Poppins']">
          Give with Clarity.<br />Help with Confidence.
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Connect donors, volunteers, and beneficiaries through transparent charity campaigns. Track your impact and make a real difference.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/donate">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent text-accent-foreground border border-accent-border text-lg px-8 py-6 transition-transform hover:scale-105"
              data-testid="button-start-giving"
            >
              <Heart className="h-5 w-5 mr-2 fill-current" />
              Start Giving
            </Button>
          </Link>
          <Link href="/">
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6 transition-transform hover:scale-105"
              data-testid="button-explore-campaigns"
            >
              Explore Campaigns
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-donations">
                ${(stats.donations / 1000).toFixed(0)}k
              </span>
            </div>
            <p className="text-white/80">Donations Raised</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-lives">
                {(stats.lives / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="text-white/80">Lives Helped</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-volunteers">
                {(stats.volunteers / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="text-white/80">Active Volunteers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
