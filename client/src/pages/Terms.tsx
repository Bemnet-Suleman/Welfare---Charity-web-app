import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold font-['Poppins']">{t("Terms of Service")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("Read the terms that explain how you can use Welfare and what you agree to when using the platform.")}
          </p>
          <Link href="/">
            <Button>{t("Back to Home")}</Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold">{t("Acceptance of Terms")}</h2>
            <p>
              {t("By creating an account or using our platform, you agree to follow these terms and use the service responsibly.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Account Registration")}</h2>
            <p>
              {t("Your account must use a valid email address, and you must verify your email before signing in.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("User Conduct")}</h2>
            <p>
              {t("Do not use Welfare for spam, fraudulent campaigns, or abusive behavior. Treat every beneficiary and donor with respect.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Privacy and Security")}</h2>
            <p>
              {t("Your personal information is handled according to our privacy policy and industry-standard security practices.")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
