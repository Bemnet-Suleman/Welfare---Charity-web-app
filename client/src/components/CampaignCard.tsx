import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock, Heart } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  daysLeft: number;
  urgent?: boolean;
}

export function CampaignCard({
  id,
  title,
  description,
  image,
  category,
  goalAmount,
  raisedAmount,
  daysLeft,
  urgent = false,
}: CampaignCardProps) {
  const progress = (raisedAmount / goalAmount) * 100;
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-card border-card-border text-card-foreground">{t(category)}</Badge>
          {urgent && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              {t("Urgent")}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold line-clamp-2 font-['Poppins']" data-testid="campaign-title">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold font-['Space_Grotesk']" data-testid="campaign-raised">
              {raisedAmount.toLocaleString()} Birr
            </span>
            <span className="text-muted-foreground">{t("of")} {goalAmount.toLocaleString()} Birr</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-secondary">{progress.toFixed(0)}{t("% funded")}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{daysLeft} {t("days left")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/donate?campaignId=${id}`}>
            <Button 
              className="flex-1 bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
              data-testid="button-donate-campaign"
            >
              <Heart className="h-4 w-4 mr-2 fill-current" />
              {t("Donate")}
            </Button>
          </Link>
          <Link href={`/campaign/${id}`}>
            <Button variant="outline" className="flex-1" data-testid="button-learn-more">
              {t("Learn More")}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
