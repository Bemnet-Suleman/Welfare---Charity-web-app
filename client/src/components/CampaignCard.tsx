import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock, Heart } from "lucide-react";
import { Link } from "wouter";

export interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  daysLeft: number;
  organizer: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  urgent?: boolean;
}

export function CampaignCard({
  title,
  description,
  image,
  category,
  goalAmount,
  raisedAmount,
  daysLeft,
  organizer,
  urgent = false,
}: CampaignCardProps) {
  const progress = (raisedAmount / goalAmount) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-card border-card-border text-card-foreground">{category}</Badge>
          {urgent && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              Urgent
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 backdrop-blur-sm bg-background/80 rounded-full px-3 py-1.5">
          <Avatar className="h-6 w-6 border-2 border-background">
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback>{organizer.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{organizer.name}</span>
          {organizer.verified && (
            <CheckCircle2 className="h-4 w-4 text-secondary" />
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
              ${raisedAmount.toLocaleString()}
            </span>
            <span className="text-muted-foreground">of ${goalAmount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-secondary">{progress.toFixed(0)}% funded</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/donate">
            <Button 
              className="flex-1 bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
              data-testid="button-donate-campaign"
            >
              <Heart className="h-4 w-4 mr-2 fill-current" />
              Donate
            </Button>
          </Link>
          <Link href="/campaign/1">
            <Button variant="outline" className="flex-1" data-testid="button-learn-more">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
