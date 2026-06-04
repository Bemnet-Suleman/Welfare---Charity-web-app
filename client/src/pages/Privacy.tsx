import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold font-['Poppins']">{t("Privacy Policy")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("Learn how Welfare collects, uses, and protects your personal information.")}
          </p>
          <Link href="/">
            <Button>{t("Back to Home")}</Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold">{t("Information We Collect")}</h2>
            <p>
              {t("We collect information such as your name, email address, and profile details to help you use the platform and keep your account secure.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("How We Use Your Data")}</h2>
            <p>
              {t("Your information is used to manage your account, send verification messages, and support transactions on the platform.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Sharing and Security")}</h2>
            <p>
              {t("We do not share your personal data with third parties except when necessary to fulfill requests or comply with legal requirements.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Your Choices")}</h2>
            <p>
              {t("You can update your profile information in your account settings and unsubscribe from emails by contacting our support team.")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
