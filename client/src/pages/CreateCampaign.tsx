import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Target } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: string;
  role?: string;
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1640622656785-4fddbd3b4c6a?w=800&q=80";

export default function CreateCampaign() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json().then(({ user }: any) => user)),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const user = userData as { id: string; role?: string } | undefined;
  const isAdmin = user?.role === "admin";

  const handleSubmit = async () => {
    if (!isAdmin) {
      alert(t("Only Charity Admin can create campaigns directly. Your campaign request will be queued for admin approval."));
      return;
    }

    if (!title || !description || !goal || !duration || !location || !category) {
      alert(t("Please fill all required fields before submitting the campaign."));
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + Number(duration || 30) * 24 * 60 * 60 * 1000);

      await apiRequest("POST", "/api/campaigns", {
        title,
        description,
        image: imageUrl || "https://images.unsplash.com/photo-1640622656785-4fddbd3b4c6a?w=800&q=80",
        category: category || "other",
        goalAmount: goal,
        startDate,
        endDate,
        location,
      });

      alert(t("Campaign submitted successfully."));
      setTitle("");
      setDescription("");
      setGoal("");
      setDuration("");
      setImageUrl("");
      setCategory("");
      setLocation("");
    } catch (err) {
      console.error(err);
      alert(t("Failed to submit campaign."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Target className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("Create a Campaign")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Share your story and raise funds for your cause. Every campaign makes a difference.")}
          </p>
          {!isAdmin && (
            <p className="text-sm text-red-500 mt-2">
              {t("Only the Charity Admin can finalize campaign creation; your request will be reviewed by them.")}
            </p>
          )}
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">{t("Campaign Title")}</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("e.g., Help Build a School in Rural Ethiopia")} 
                className="mt-2"
                data-testid="input-title"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-lg font-semibold">{t("Category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2" data-testid="select-category">
                  <SelectValue placeholder={t("Select a category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">{t("Education")}</SelectItem>
                  <SelectItem value="healthcare">{t("Healthcare")}</SelectItem>
                  <SelectItem value="disaster-relief">{t("Disaster Relief")}</SelectItem>
                  <SelectItem value="food-nutrition">{t("Food & Nutrition")}</SelectItem>
                  <SelectItem value="water-sanitation">{t("Water & Sanitation")}</SelectItem>
                  <SelectItem value="environment">{t("Environment")}</SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">{t("Campaign Story")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("Tell your story. Explain why this cause matters and how donations will be used...")}
                className="mt-2 min-h-[200px]"
                data-testid="textarea-description"
              />
              <p className="text-sm text-muted-foreground mt-2">{t("Be specific and authentic. People connect with real stories.")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="goal" className="text-lg font-semibold">{t("Funding Goal ($)")}</Label>
                <Input
                  id="goal"
                  type="number"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="50000"
                  className="mt-2"
                  data-testid="input-goal"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-lg font-semibold">{t("Campaign Duration (days)")}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="30"
                  className="mt-2"
                  data-testid="input-duration"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-lg font-semibold">{t("Featured Image URL")}</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/campaign-image.jpg"
                className="mt-2"
                data-testid="input-image-url"
              />
              <p className="text-sm text-muted-foreground mt-2">{t("Enter image URL or keep default if not provided.")}</p>
            </div>

            <div>
              <Label htmlFor="location" className="text-lg font-semibold">{t("Location")}</Label>
              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={t("City, Country")}
                className="mt-2"
                data-testid="input-location"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">{t("Supporting Documents (Optional)")}</Label>
              <Button variant="outline" className="w-full" data-testid="button-upload-documents">
                <Upload className="h-4 w-4 mr-2" />
                {t("Upload Documents")}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">{t("Verification documents, permits, or supporting materials")}</p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                data-testid="button-save-draft"
              >
                {t("Save as Draft")}
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
                onClick={handleSubmit}
                disabled={!isAdmin}
                data-testid="button-submit-campaign"
              >
                {isAdmin ? t("Submit for Review") : t("Request campaign approval")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
