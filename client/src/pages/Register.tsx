import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Register() {
  const [userType, setUserType] = useState("donor");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = () => {
    console.log("Registration submitted", { userType });
    //todo: implement registration logic
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-12 w-12 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            Join Welfare
          </h1>
          <p className="text-muted-foreground">Create your account and start making a difference</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">I want to:</Label>
              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="donor" id="donor" data-testid="radio-donor" />
                  <Label htmlFor="donor" className="flex-1 cursor-pointer">
                    <p className="font-semibold">Donate to Causes</p>
                    <p className="text-sm text-muted-foreground">Support campaigns and track your impact</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="volunteer" id="volunteer" data-testid="radio-volunteer" />
                  <Label htmlFor="volunteer" className="flex-1 cursor-pointer">
                    <p className="font-semibold">Volunteer My Time</p>
                    <p className="text-sm text-muted-foreground">Find opportunities to help in your community</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="beneficiary" id="beneficiary" data-testid="radio-beneficiary" />
                  <Label htmlFor="beneficiary" className="flex-1 cursor-pointer">
                    <p className="font-semibold">Request Assistance</p>
                    <p className="text-sm text-muted-foreground">Submit aid requests for yourself or your community</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="organization" id="organization" data-testid="radio-organization" />
                  <Label htmlFor="organization" className="flex-1 cursor-pointer">
                    <p className="font-semibold">Create Campaigns</p>
                    <p className="text-sm text-muted-foreground">Start fundraising for your organization or cause</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

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

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" data-testid="input-password" />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" data-testid="input-confirm-password" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
              onClick={handleRegister}
              disabled={!agreedToTerms}
              data-testid="button-register"
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-primary hover:underline font-medium">Sign in</a>
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
