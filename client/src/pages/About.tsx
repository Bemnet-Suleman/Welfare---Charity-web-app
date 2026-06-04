import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold font-['Poppins']">{t("About Us")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("Learn about Welfare’s mission to connect donors, volunteers, and communities with meaningful support.")}
          </p>
          <Link href="/">
            <Button>{t("Back to Home")}</Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold">{t("Our Mission")}</h2>
            <p>
              {t("Welfare is built to make transparent giving simple and to ensure every act of generosity reaches the people who need it most.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("What We Do")}</h2>
            <p>
              {t("We support campaigns, volunteer opportunities, and aid requests with a modern charity portal that puts trust and clarity first.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Our Values")}</h2>
            <p>
              {t("We believe in transparency, community trust, and efficient support for vulnerable people and local organizations.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("Get Involved")}</h2>
            <p>
              {t("Join as a donor, volunteer, or beneficiary and help build a more caring, accountable charity ecosystem.")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
