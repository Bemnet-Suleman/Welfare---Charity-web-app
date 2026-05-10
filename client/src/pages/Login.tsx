import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();

      toast({
        title: t("Login Successful"),
        description: t("Welcome back!"),
      });

      // Keep auth state fresh so headers, profile, etc. update immediately
      queryClient.setQueryData(["auth/me"], result.user);
      queryClient.invalidateQueries({ queryKey: ["auth/me"] });

      if (rememberMe) {
        localStorage.setItem("auth_user", JSON.stringify(result.user));
      } else {
        localStorage.removeItem("auth_user");
      }

      // Redirect based on role
      if (result.user.role === "admin" || result.user.role === "system_admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: t("Login Failed"),
        description: error.message || t("Invalid credentials"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Heart className="h-12 w-12 text-accent fill-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Poppins']">
            {t("Welcome Back")}
          </h1>
          <p className="text-muted-foreground">{t("Sign in to continue making a difference")}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">{t("Password")}</Label>
              <Link href="/forgot-password">
                  <a className="text-sm text-primary hover:underline">{t("Forgot password?")}</a>
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                {...register("password")}
                data-testid="input-password" 
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                data-testid="checkbox-remember"
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                {t("Remember me")}
              </Label>
            </div>

            <Button 
              type="submit"
              size="lg" 
              className="w-full bg-primary hover:bg-primary text-primary-foreground border border-primary-border"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? t("Signing In...") : t("Sign In")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("Don't have an account?")} {" "}
              <Link href="/register">
                <a className="text-primary hover:underline font-medium">{t("Create one now")}</a>
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
