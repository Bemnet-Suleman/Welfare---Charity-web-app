import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "What is Welfare?",
      answer:
        "Welfare is a centralized charity portal that connects donors, volunteers, and beneficiaries. We provide transparent, impactful charitable giving with clear tracking of how your contributions make a difference.",
    },
    {
      question: "How do I donate to a campaign?",
      answer:
        "Click on any campaign from our Campaigns page, review the details, and click the Donate button. You can choose your donation amount and payment method. Your contribution will be tracked, and you can view impact stories from your donations.",
    },
    {
      question: "Is my donation secure?",
      answer:
        "Yes, all donations are processed through secure payment channels. We use industry-standard encryption and security protocols to protect your financial information. You will receive a confirmation and receipt for every donation.",
    },
    {
      question: "Can I volunteer?",
      answer:
        "Absolutely! Visit our Volunteer page to browse available opportunities. Create an account, specify your skills and availability, and connect with campaigns that need your help. You can track your volunteer hours and impact.",
    },
    {
      question: "How do I request aid?",
      answer:
        "If you need assistance, visit the Request Aid page and fill out the application form. Provide details about your situation, required aid type, and documentation if available. Our team will review your request and connect you with appropriate resources.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept multiple payment methods including credit cards, debit cards, and digital wallets. Our payment gateway is secure and PCI compliant to protect your financial information.",
    },
    {
      question: "Can I see where my donation goes?",
      answer:
        "Yes! Our Transparency page provides detailed information about campaign progress, fund allocation, and impact metrics. You can also view impact stories from beneficiaries showing how donations have made a difference.",
    },
    {
      question: "How do I create a campaign?",
      answer:
        "We currently manage campaign creation through our admin team to ensure quality and legitimacy. If you represent an organization or have a campaign idea, please contact us through the About Us page or email us directly.",
    },
    {
      question: "Is there an age requirement to donate or volunteer?",
      answer:
        "To donate, you should be at least 18 years old or have parental consent. Volunteer opportunities have specific age requirements depending on the nature of the work. These are listed in each opportunity description.",
    },
    {
      question: "How do I update my profile information?",
      answer:
        "Log into your account and click on your Profile. You can update your personal information, avatar, preferences, and notification settings. Changes are saved immediately.",
    },
    {
      question: "What languages are supported?",
      answer:
        "We currently support English and Amharic. You can switch languages from the header menu. More languages may be added in the future.",
    },
    {
      question: "How do I report a problem or give feedback?",
      answer:
        "We value your feedback! If you encounter any issues or have suggestions, please reach out to us through the contact information on our About Us page or use the feedback form in your profile settings.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {t("Frequently Asked Questions")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("Find answers to common questions about Welfare")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="overflow-hidden hover-elevate transition-all cursor-pointer"
              onClick={() => toggleItem(index)}
            >
              <div className="p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex-1">{faq.question}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(index);
                  }}
                >
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {openItems.includes(index) && (
                <div className="px-6 pb-6 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
          <h2 className="text-xl font-semibold mb-2">{t("Still have questions?")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("Can't find the answer you're looking for? Please visit our About Us page or contact us directly.")}
          </p>
          <Link href="/contact"><a>
            <Button className="bg-accent hover:bg-accent text-accent-foreground">{t("Contact Us")}</Button>
          </a></Link>
        </div>
      </div>
    </div>
  );
}
