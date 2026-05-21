import { Heart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const heroImages = [
  "/attached_assets/Hero.jpg",
  "/attached_assets/Hero1.jpg",
  "/attached_assets/Story!.jpg",
  "/attached_assets/Story2.jpg",
  "/attached_assets/Story3.jpg",
];

function shuffleArray<T>(values: T[]) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function HeroSection() {
  const [stats, setStats] = useState<{ donations: number; lives: number; volunteers: number }>({ donations: 0, lives: 0, volunteers: 0 });
  const [order] = useState(() => shuffleArray(heroImages));
  const [heroState, setHeroState] = useState(() => ({
    activeLayer: 0 as 0 | 1,
    currentIndex: 0,
    layers: [order[0], order[1] ?? order[0]],
  }));
  const { t } = useTranslation();

  useEffect(() => {
    // fetch actual stats from API
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          donations: data.totalRaised,
          lives: data.livesImpacted,
          volunteers: data.activeVolunteers,
        });
      })
      .catch(() => {
        console.warn("Failed to load stats, using defaults");
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroState((prev) => {
        const nextIndex = (prev.currentIndex + 1) % order.length;
        const nextLayer = prev.activeLayer === 0 ? 1 : 0;
        const nextLayers = [...prev.layers] as [string, string];
        nextLayers[nextLayer] = order[nextIndex];

        return {
          activeLayer: nextLayer,
          currentIndex: nextIndex,
          layers: nextLayers,
        };
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [order]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 hero-image transition-opacity duration-1000 ease-in-out ${
            heroState.activeLayer === 0 ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${heroState.layers[0]}')` }}
          role="img"
          aria-label={t("People helping each other in community")}
        />
        <div
          className={`absolute inset-0 hero-image transition-opacity duration-1000 ease-in-out ${
            heroState.activeLayer === 1 ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${heroState.layers[1]}')` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(255, 145, 77, 0.14), rgba(255, 125, 35, 0.08) 35%, rgba(15,23,42,0.10) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 bg-black/20 border border-white/10 rounded-[2rem] shadow-2xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-['Poppins']">
          {t("Give with Clarity. Help with Confidence.")}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          {t("Connect donors, volunteers, and beneficiaries through transparent charity campaigns. Track your impact and make a real difference.")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/donate">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent text-accent-foreground border border-accent-border text-lg px-8 py-6 transition-transform hover:scale-105"
              data-testid="button-start-giving"
            >
              <Heart className="h-5 w-5 mr-2 fill-current" />
              {t("Start Giving")}
            </Button>
          </Link>
          <Link href="/#campaigns">
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6 transition-transform hover:scale-105"
              data-testid="button-explore-campaigns"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('campaigns');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {t("Explore Campaigns")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-donations" aria-label={`${stats.donations} donations raised`}>
                ${(stats.donations / 1000).toFixed(0)}{t("K")}
              </span>
            </div>
            <p className="text-white/80">{t("Donations Raised")}</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-lives">
                {(stats.lives / 1000).toFixed(1)}{t("K")}
              </span>
            </div>
            <p className="text-white/80">{t("Lives Helped")}</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20 hover-elevate transition-all">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-4xl font-bold text-white font-['Space_Grotesk']" data-testid="stat-volunteers">
                {(stats.volunteers / 1000).toFixed(1)}{t("K")}
              </span>
            </div>
            <p className="text-white/80">{t("Active Volunteers")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
