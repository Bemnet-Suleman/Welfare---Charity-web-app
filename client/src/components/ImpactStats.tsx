import { Card } from "@/components/ui/card";
import { TrendingUp, Heart, Users, Target } from "lucide-react";

export function ImpactStats() {
  //todo: remove mock functionality
  const stats = [
    {
      icon: TrendingUp,
      value: "$2.5M",
      label: "Total Raised",
      change: "+23% this month",
      color: "text-chart-1",
    },
    {
      icon: Heart,
      value: "45K",
      label: "Lives Impacted",
      change: "+15% this month",
      color: "text-chart-3",
    },
    {
      icon: Users,
      value: "5.2K",
      label: "Active Volunteers",
      change: "+8% this month",
      color: "text-chart-2",
    },
    {
      icon: Target,
      value: "89%",
      label: "Goals Achieved",
      change: "+5% this month",
      color: "text-chart-4",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Poppins']">
            Our Impact in Numbers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track the real-time impact of our community's generosity and compassion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold font-['Space_Grotesk']" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-secondary flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
