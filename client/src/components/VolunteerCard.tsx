import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users } from "lucide-react";
import {useTranslation} from "react-i18next";
export interface VolunteerCardProps {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  timeCommitment: string;
  skills: string[];
  volunteers: number;
  spotsLeft: number;
  onApply?: () => void;
}

export function VolunteerCard({
  title,
  organization,
  description,
  location,
  timeCommitment,
  skills,
  volunteers,
  spotsLeft,
  onApply,
}: VolunteerCardProps) {
  const {t} = useTranslation();
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold font-['Poppins']" data-testid="volunteer-title">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{organization}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeCommitment}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{volunteers} {t("volunteers")} • {spotsLeft} {t("spots left")}</span>
          </div>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
          onClick={onApply}
          data-testid="button-apply-volunteer"
        >
          {t("Apply Now")}
        </Button>
      </div>
    </Card>
  );
}
