import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, HandHeart } from "lucide-react";
import { useState } from "react";

export default function RequestAid() {
  const [aidType, setAidType] = useState("");

  const handleSubmit = () => {
    console.log("Aid request submitted");
    //todo: implement aid request logic
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <HandHeart className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Request Assistance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help. Submit your request and our team will review it promptly.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="requestType" className="text-lg font-semibold">Type of Assistance Needed</Label>
              <Select value={aidType} onValueChange={setAidType}>
                <SelectTrigger className="mt-2" data-testid="select-aid-type">
                  <SelectValue placeholder="Select type of aid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical / Healthcare</SelectItem>
                  <SelectItem value="education">Education / School Fees</SelectItem>
                  <SelectItem value="food">Food / Nutrition</SelectItem>
                  <SelectItem value="shelter">Shelter / Housing</SelectItem>
                  <SelectItem value="emergency">Emergency Relief</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" data-testid="input-first-name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" data-testid="input-last-name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" data-testid="input-email" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+251 900 000000" data-testid="input-phone" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="City, Region, Country" 
                data-testid="input-location"
              />
            </div>

            <div>
              <Label htmlFor="situation" className="text-lg font-semibold">Describe Your Situation</Label>
              <Textarea 
                id="situation" 
                placeholder="Please describe your current situation and why you need assistance..."
                className="mt-2 min-h-[150px]"
                data-testid="textarea-situation"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-lg font-semibold">Estimated Amount Needed ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="5000" 
                className="mt-2"
                data-testid="input-amount"
              />
              <p className="text-sm text-muted-foreground mt-2">Provide an estimate if applicable</p>
            </div>

            <div>
              <Label htmlFor="urgency" className="text-lg font-semibold">Urgency Level</Label>
              <Select>
                <SelectTrigger className="mt-2" data-testid="select-urgency">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical (Immediate need)</SelectItem>
                  <SelectItem value="urgent">Urgent (Within 1 week)</SelectItem>
                  <SelectItem value="moderate">Moderate (Within 1 month)</SelectItem>
                  <SelectItem value="low">Low (No immediate deadline)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">Supporting Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer hover-elevate">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">Upload supporting documents</p>
                <p className="text-sm text-muted-foreground">Medical reports, ID, proof of situation (Optional but recommended)</p>
                <input type="file" multiple className="hidden" data-testid="input-documents" />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Privacy Notice:</strong> Your information will be kept confidential and only shared with verified aid providers. We review all requests to ensure legitimate assistance reaches those in need.
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-secondary hover:bg-secondary text-secondary-foreground border border-secondary-border"
              onClick={handleSubmit}
              data-testid="button-submit-request"
            >
              Submit Request
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
