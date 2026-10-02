import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getSupabaseClient } from "../lib/supabase";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function verify() {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus("error");
        setMessage(t("Supabase Auth is not configured in this deployment."));
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        const authError = new URLSearchParams(window.location.search).get("error_description");
        if (error || authError) {
          setStatus("error");
          setMessage(authError || error?.message || t("Email verification failed."));
        } else if (data.session?.user.email_confirmed_at) {
          await apiRequest("POST", "/api/register", { authUserId: data.session.user.id }, {
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          });
          await supabase.auth.signOut();
          setStatus("success");
          setMessage(t("Your email has been verified with Supabase. You can now sign in."));
        } else {
          setStatus("pending");
          setMessage(t("Open the Supabase verification link from your email to finish confirming this account."));
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || t("Email verification failed."));
      }
    }

    verify();
  }, [t]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("Email Verification")}</h1>
          <p className="mb-6 text-muted-foreground">
            {status === "loading"
              ? t("Verifying your email, please wait...")
              : message}
          </p>
          {status === "success" ? (
            <div className="space-x-3">
              <Link href="/login">
                <Button>{t("Go to Login")}</Button>
              </Link>
            </div>
          ) : status === "pending" ? (
            <div className="space-x-3 justify-center">
              <Link href="/login">
                <Button>{t("Back to Login")}</Button>
              </Link>
            </div>
          ) : status === "error" ? (
            <div className="space-x-3">
              <Link href="/register">
                <Button variant="outline">{t("Register Again")}</Button>
              </Link>
              <Link href="/login">
                <Button>{t("Go to Login")}</Button>
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
