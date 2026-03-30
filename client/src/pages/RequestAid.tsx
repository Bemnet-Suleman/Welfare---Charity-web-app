import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, HandHeart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

export default function RequestAid() {
  const { t } = useTranslation();
  const [aidType, setAidType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [situation, setSituation] = useState("");
  const [amount, setAmount] = useState("");
  const [urgency, setUrgency] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!aidType || !firstName || !lastName || !email || !location || !situation || !amount || !urgency) {
      alert(t("Please fill in all required fields before submitting."));
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/aid-requests", {
        aidType,
        firstName,
        lastName,
        email,
        phone,
        location,
        situation,
        amount: Number(amount),
        urgency,
      });
      alert(t("Aid request submitted successfully."));
      setAidType("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setSituation("");
      setAmount("");
      setUrgency("");
    } catch (err) {
      console.error(err);
      alert(t("Failed to submit aid request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
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
              <Label htmlFor="requestType" className="text-lg font-semibold">{t("Type of Assistance Needed")}</Label>
              <Select value={aidType} onValueChange={setAidType}>
                <SelectTrigger className="mt-2" data-testid="select-aid-type">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">{t("First Name")}</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("John")} data-testid="input-first-name" />
              </div>
              <div>
                <Label htmlFor="lastName">{t("Last Name")}</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("Doe")} data-testid="input-last-name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">{t("Email Address")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" data-testid="input-email" />
              </div>
              <div>
                <Label htmlFor="phone">{t("Phone Number")}</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 900 000000" data-testid="input-phone" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">{t("Location")}</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("City, Region, Country")} data-testid="input-location" />
            </div>

            <div>
              <Label htmlFor="situation" className="text-lg font-semibold">{t("Describe Your Situation")}</Label>
              <Textarea id="situation" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("Please describe your current situation and why you need assistance...")} className="mt-2 min-h-[150px]" data-testid="textarea-situation" />
            </div>

            <div>
              <Label htmlFor="amount" className="text-lg font-semibold">{t("Estimated Amount Needed ($)")}</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="mt-2" data-testid="input-amount" />
              <p className="text-sm text-muted-foreground mt-2">{t("Provide an estimate if applicable")}</p>
            </div>

            <div>
              <Label htmlFor="urgency" className="text-lg font-semibold">{t("Urgency Level")}</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger className="mt-2" data-testid="select-urgency">
                  <SelectValue placeholder={t("Select urgency level")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{t("Critical (Immediate need)")}</SelectItem>
                  <SelectItem value="urgent">{t("Urgent (Within 1 week)")}</SelectItem>
                  <SelectItem value="moderate">{t("Moderate (Within 1 month)")}</SelectItem>
                  <SelectItem value="low">{t("Low (No immediate deadline)")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold block mb-2">{t("Supporting Documents")}</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer hover-elevate">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">{t("Upload supporting documents")}</p>
                <p className="text-sm text-muted-foreground">{t("Medical reports, ID, proof of situation (Optional but recommended)")}</p>
                <input type="file" multiple className="hidden" data-testid="input-documents" />
              </div>
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
