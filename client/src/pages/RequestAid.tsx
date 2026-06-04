import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, HandHeart } from "lucide-react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function RequestAid() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
  });

  const handleSubmit = async () => {
    if (!title || !description || !category || !urgency || !location) {
      alert(t("Please fill in all required fields before submitting."));
      return;
    }

    if (!user || !user.id) {
      alert(t("You must be logged in to submit a request."));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("urgency", urgency);
      formData.append("location", location);

      // Append files - multer will handle these with upload.array('documents')
      documents.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await apiRequest("POST", "/api/aid-requests", formData);
      const result = await response.json();

      alert(t("Aid request submitted successfully."));
      setTitle("");
      setDescription("");
      setCategory("");
      setUrgency("");
      setLocation("");
      setDocuments([]);
    } catch (err) {
      console.error("Aid request error:", err);
      alert(t("Failed to submit aid request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <HandHeart className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">{t("Request Assistance")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("We're here to help. Submit your request and our team will review it promptly.")}
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">{t("Request Title")}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Brief title for your aid request")} className="mt-2" data-testid="input-title" />
            </div>

            <div>
              <Label htmlFor="category" className="text-lg font-semibold">{t("Type of Assistance Needed")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2" data-testid="select-category">
                  <SelectValue placeholder={t("Select type of aid")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">{t("Medical / Healthcare")}</SelectItem>
                  <SelectItem value="education">{t("Education / School Fees")}</SelectItem>
                  <SelectItem value="food">{t("Food / Nutrition")}</SelectItem>
                  <SelectItem value="shelter">{t("Shelter / Housing")}</SelectItem>
                  <SelectItem value="emergency">{t("Emergency Relief")}</SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">{t("Describe Your Situation")}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Please describe your current situation and why you need assistance...")} className="mt-2 min-h-[150px]" data-testid="textarea-description" />
            </div>

            <div>
              <Label htmlFor="location">{t("Location")}</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("City, Region, Country")} data-testid="input-location" />
            </div>

            <div>
              <Label htmlFor="urgency" className="text-lg font-semibold">{t("Urgency Level")}</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger className="mt-2" data-testid="select-urgency">
                  <SelectValue placeholder={t("Select urgency level")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("Low (No immediate deadline)")}</SelectItem>
                  <SelectItem value="medium">{t("Medium (Within 1 month)")}</SelectItem>
                  <SelectItem value="high">{t("High (Within 1 week)")}</SelectItem>
                  <SelectItem value="emergency">{t("Emergency (Immediate need)")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">{t("Supporting Documents")}</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">{t("Upload supporting documents")}</p>
                <p className="text-sm text-muted-foreground mb-4">{t("Medical reports, ID, proof of situation (Optional but recommended)")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  data-testid="input-documents"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("Choose Files")}
                </Button>
              </div>
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">{t("Selected files:")}</p>
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t("Privacy Notice:")}</strong> {t("Your information will be kept confidential and only shared with verified aid providers. We review all requests to ensure legitimate assistance reaches those in need.")}
              </p>
            </div>

            <Button size="lg" className="w-full bg-secondary hover:bg-secondary text-secondary-foreground border border-secondary-border" onClick={handleSubmit} disabled={isSubmitting} data-testid="button-submit-request">
              {isSubmitting ? t("Submitting...") : t("Submit Request")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
