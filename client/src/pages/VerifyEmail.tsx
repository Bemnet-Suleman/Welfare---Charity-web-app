import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function VerifyEmail() {
  const { token } = useParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage(t("Verification token is missing."));
        return;
      }

      try {
        const response = await apiRequest("GET", `/api/auth/verify-email/${token}`);
        const result = await response.json();
        if (!response.ok) {
          setStatus("error");
          setMessage(result.error || t("Email verification failed."));
        } else {
          setStatus("success");
          setMessage(result.message || t("Your email has been verified successfully."));
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || t("Email verification failed."));
      }
    }

    verify();
  }, [token, t]);

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
