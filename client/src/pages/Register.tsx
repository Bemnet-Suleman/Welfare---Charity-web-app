import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getAppUrl, getSupabaseClient } from "../lib/supabase";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  userType: z.enum(["donor", "volunteer", "beneficiary"]),
  agreedToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { t } = useTranslation();
  const [userType, setUserType] = useState("donor");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "donor",
      agreedToTerms: false,
    },
  });

  const agreedToTerms = watch("agreedToTerms");

  const onSubmit = async (data: RegisterForm) => {
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error(t("Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."));
      const email = data.email.trim().toLowerCase();
      const appUrl = await getAppUrl();
      if (!appUrl) throw new Error(t("The public app URL is not configured for email verification."));
      const redirectOrigin = new URL(appUrl);
      const redirectIsLocal = ["localhost", "127.0.0.1", "::1"].includes(redirectOrigin.hostname);
      const pageIsLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
      if (redirectIsLocal && !pageIsLocal) {
        throw new Error(t("Email verification cannot use a localhost URL. Configure the public app URL."));
      }
      const emailRedirectTo = new URL("/verify-email", redirectOrigin).toString();
      const { data: signupResult, error: signupError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo,
          data: { username: email, full_name: `${data.firstName} ${data.lastName}`, role: data.userType },
        },
      });
      if (signupError) throw signupError;
      if (!signupResult.user) throw new Error(t("Supabase did not return a new account."));
      if (!signupResult.session) {
        toast({ title: t("Check your email"), description: t("Supabase sent a verification link. Your profile will be completed when you open it.") });
        setLocation("/verify-email");
        return;
      }
      const response = await apiRequest("POST", "/api/register", {
        authUserId: signupResult.user.id,
      }, { headers: { Authorization: `Bearer ${signupResult.session.access_token}` } });
      const result = await response.json();
      toast({
        title: signupResult.session ? t("Registration Successful") : t("Check your email"),
        description: result.message || t("Your profile has been created."),
      });
      if (signupResult.session) await supabase.auth.signOut();
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: t("Registration Failed"),
        description: error.message || t("Failed to create account"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-12 w-12 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            {t("Join Welfare")}
          </h1>
          <p className="text-muted-foreground">{t("Create your account and start making a difference")}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">{t("I want to:")}</Label>
              <RadioGroup 
                value={userType} 
                onValueChange={(value) => {
                  setUserType(value);
                  setValue("userType", value as any);
                }}
              >
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="donor" id="donor" data-testid="radio-donor" />
                  <Label htmlFor="donor" className="flex-1 cursor-pointer">
                    <p className="font-semibold">{t("Donate to Causes")}</p>
                    <p className="text-sm text-muted-foreground">{t("Support campaigns and track your impact")}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="volunteer" id="volunteer" data-testid="radio-volunteer" />
                  <Label htmlFor="volunteer" className="flex-1 cursor-pointer">
                    <p className="font-semibold">{t("Volunteer My Time")}</p>
                    <p className="text-sm text-muted-foreground">{t("Find opportunities to help in your community")}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate cursor-pointer">
                  <RadioGroupItem value="beneficiary" id="beneficiary" data-testid="radio-beneficiary" />
                  <Label htmlFor="beneficiary" className="flex-1 cursor-pointer">
                    <p className="font-semibold">{t("Request Assistance")}</p>
                    <p className="text-sm text-muted-foreground">{t("Submit aid requests for yourself or your community")}</p>
                  </Label>
                </div>
              </RadioGroup>
              {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("First Name")}</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    {...register("firstName")}
                    data-testid="input-first-name" 
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">{t("Last Name")}</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    {...register("lastName")}
                    data-testid="input-last-name" 
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t("Email Address")}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  {...register("email")}
                  data-testid="input-email" 
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password">{t("Password")}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...register("password")}
                  data-testid="input-password" 
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("Confirm Password")}</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  {...register("confirmPassword")}
                  data-testid="input-confirm-password" 
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setValue("agreedToTerms", checked as boolean)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                {t("I agree to the ")} <a href="/terms" className="text-primary hover:underline">{t("Terms of Service")}</a> {t("and")} <a href="/privacy" className="text-primary hover:underline">{t("Privacy Policy")}</a>
              </Label>
            </div>
            {errors.agreedToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms.message}</p>}

            <Button 
              type="submit"
              size="lg" 
              className="w-full bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
              disabled={isSubmitting}
              data-testid="button-register"
            >
              {isSubmitting ? t("Creating Account...") : t("Create Account")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("Already have an account?")}{" "}
              <Link href="/login">
                <a className="text-primary hover:underline font-medium">Sign in</a>
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
