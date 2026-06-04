import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { useRoute } from "wouter";

export default function DonationSuccess() {
  const { t } = useTranslation();
  const [match, params] = useRoute("/donation-success/:id");
  const id = params?.id as string | undefined;
  const [donation, setDonation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDonation = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("GET", `/api/donations/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Unable to fetch donation");
        }
        const data = await res.json();
        setDonation(data);
      } catch (err: any) {
        setError(err?.message || t("Unable to load donation"));
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, t]);

  if (!id) {
    return <div className="p-8">{t("Donation not specified")}</div>;
  }

  if (loading) return <div className="p-8">{t("Loading...")}</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-4">{t("Donation Successful")}</h2>
          <p className="text-muted-foreground mb-6">{t("Thank you for your generous contribution. Below is your donation receipt.")}</p>

          <div className="space-y-3">
            <div>
              <strong>{t("Donation ID")}: </strong>
              <span>{donation?.id}</span>
            </div>
            <div>
              <strong>{t("Amount")}: </strong>
              <span>{donation?.amount} {t("currency.Birr")}</span>
            </div>
            <div>
              <strong>{t("Campaign")}: </strong>
              <span>{donation?.campaignId || t("General Donation")}</span>
            </div>
            <div>
              <strong>{t("Transaction")}: </strong>
              <span>{donation?.transactionId || t("N/A")}</span>
            </div>
            <div>
              <strong>{t("Donor")}: </strong>
              <span>{donation?.donorId || (donation?.anonymous ? t("Anonymous") : t("Guest"))}</span>
            </div>
            <div>
              <strong>{t("Message")}: </strong>
              <span>{donation?.message || t("None")}</span>
            </div>
            <div>
              <strong>{t("Date")}: </strong>
              <span>{new Date(donation?.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button asChild>
              <a href="/">{t("Return to Home")}</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/campaigns/${donation?.campaignId}`}>{t("View Campaign")}</a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
