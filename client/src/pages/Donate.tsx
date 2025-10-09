import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Donate() {
  const [amount, setAmount] = useState("50");
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time");
  const [agreed, setAgreed] = useState(false);

  const quickAmounts = ["25", "50", "100", "250", "500"];

  const handleDonate = () => {
    console.log("Donation submitted", { amount: customAmount || amount, type: donationType });
    //todo: implement donation logic
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-16 w-16 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            Make a Donation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generosity creates lasting change. Every contribution makes a real difference in someone's life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">Select Donation Type</Label>
                <RadioGroup value={donationType} onValueChange={setDonationType}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                    <RadioGroupItem value="one-time" id="one-time" data-testid="radio-one-time" />
                    <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                      <p className="font-semibold">One-time Donation</p>
                      <p className="text-sm text-muted-foreground">Make an immediate impact</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                    <RadioGroupItem value="monthly" id="monthly" data-testid="radio-monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <p className="font-semibold">Monthly Donation</p>
                      <p className="text-sm text-muted-foreground">Sustained support for ongoing needs</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">Choose Amount</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={amount === amt ? "default" : "outline"}
                      className={amount === amt ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => { setAmount(amt); setCustomAmount(""); }}
                      data-testid={`button-amount-${amt}`}
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    className="pl-8"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">Your Information</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" data-testid="input-first-name" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" data-testid="input-last-name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" data-testid="input-email" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">Payment Method</Label>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Credit / Debit Card</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms" 
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the terms and conditions and understand that my donation will be used to support the selected cause.
                </Label>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent text-accent-foreground border border-accent-border"
                onClick={handleDonate}
                disabled={!agreed}
                data-testid="button-complete-donation"
              >
                <Heart className="h-5 w-5 mr-2 fill-current" />
                Complete Donation of ${customAmount || amount}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Impact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">100% of your donation goes directly to the cause</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">Tax-deductible receipt sent instantly</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">Track your impact in real-time</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <p className="text-muted-foreground">Cancel recurring donations anytime</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <h3 className="font-semibold mb-2">Your ${customAmount || amount} Can Provide:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 50 meals for families in need</li>
                <li>• School supplies for 10 children</li>
                <li>• Medical care for 5 patients</li>
                <li>• Clean water for 25 people</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
