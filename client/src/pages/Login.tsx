import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log("Login submitted");
    //todo: implement login logic
  };

  return (
    <div className="min-h-screen py-12 flex items-center">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-12 w-12 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to continue making a difference</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                data-testid="input-email" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password">
                  <a className="text-sm text-primary hover:underline">Forgot password?</a>
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                data-testid="input-password" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                data-testid="checkbox-remember"
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
              onClick={handleLogin}
              data-testid="button-login"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register">
                <a className="text-primary hover:underline font-medium">Create one now</a>
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
