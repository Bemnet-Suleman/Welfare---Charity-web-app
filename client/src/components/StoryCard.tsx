import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

export interface StoryCardProps {
  id: string;
  quote: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category: string;
  image?: string;
}

export function StoryCard({ quote, author, category, image }: StoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      {image && (
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={author.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <Quote className="h-8 w-8 text-accent flex-shrink-0" />
          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
            {category}
          </Badge>
        </div>

        <blockquote className="text-lg italic text-foreground leading-relaxed" data-testid="story-quote">
          "{quote}"
        </blockquote>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold" data-testid="story-author">{author.name}</p>
            <p className="text-sm text-muted-foreground">{author.role}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
