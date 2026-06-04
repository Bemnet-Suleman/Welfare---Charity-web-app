import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: form handling would send to backend or email service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-['Poppins']">{t("Contact Us")}</h1>
          <p className="text-muted-foreground">{t("We'd love to hear from you. Send us a message and we'll get back to you shortly.")}</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-accent/10 rounded border border-accent/20 text-center">
            <h2 className="text-lg font-semibold mb-2">{t("Message sent")}</h2>
            <p className="text-muted-foreground">{t("Thanks for reaching out — we'll reply as soon as we can.")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("Name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Your name")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("Email")}</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("you@example.com")} type="email" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("Message")}</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("Write your message here...")} />
            </div>

            <div>
              <Button type="submit" className="bg-accent hover:bg-accent text-accent-foreground">{t("Send Message")}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
