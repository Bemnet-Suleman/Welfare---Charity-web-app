import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImagePlus, Target } from "lucide-react";
import { useState } from "react";

export default function CreateCampaign() {
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    console.log("Campaign creation submitted");
    //todo: implement campaign creation logic
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Target className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Create a Campaign
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your story and raise funds for your cause. Every campaign makes a difference.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">Campaign Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Help Build a School in Rural Ethiopia" 
                className="mt-2"
                data-testid="input-title"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-lg font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2" data-testid="select-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="disaster-relief">Disaster Relief</SelectItem>
                  <SelectItem value="food-nutrition">Food & Nutrition</SelectItem>
                  <SelectItem value="water-sanitation">Water & Sanitation</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">Campaign Story</Label>
              <Textarea 
                id="description" 
                placeholder="Tell your story. Explain why this cause matters and how donations will be used..."
                className="mt-2 min-h-[200px]"
                data-testid="textarea-description"
              />
              <p className="text-sm text-muted-foreground mt-2">Be specific and authentic. People connect with real stories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="goal" className="text-lg font-semibold">Funding Goal ($)</Label>
                <Input 
                  id="goal" 
                  type="number" 
                  placeholder="50000" 
                  className="mt-2"
                  data-testid="input-goal"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-lg font-semibold">Campaign Duration (days)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  placeholder="30" 
                  className="mt-2"
                  data-testid="input-duration"
                />
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">Campaign Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer hover-elevate">
                <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG or GIF (MAX. 5MB)</p>
                <input type="file" className="hidden" accept="image/*" data-testid="input-image" />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-lg font-semibold">Location</Label>
              <Input 
                id="location" 
                placeholder="City, Country" 
                className="mt-2"
                data-testid="input-location"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">Supporting Documents (Optional)</Label>
              <Button variant="outline" className="w-full" data-testid="button-upload-documents">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <p className="text-sm text-muted-foreground mt-2">Verification documents, permits, or supporting materials</p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                data-testid="button-save-draft"
              >
                Save as Draft
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
                onClick={handleSubmit}
                data-testid="button-submit-campaign"
              >
                Submit for Review
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
