"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { PiPhoneCallThin, PiEnvelopeThin, PiMapPinThin } from "react-icons/pi";
import Script from "next/script";
import Link from "next/link";
import {
  formatPhoneNumber,
  stripPhonePrefix,
  handlePhoneKeyDown,
} from "@/lib/utils/phoneUtils";

export default function ContactForm({ initialUserData }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [phone, setPhone] = useState("+373 ");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (initialUserData) {
      const fullName = `${initialUserData.Nume || ""} ${
        initialUserData.Prenume || ""
      }`.trim();
      setName(fullName);
      setEmail(initialUserData.Email || "");
      if (initialUserData.Numar_Telefon) {
        setPhone(formatPhoneNumber(`+373${initialUserData.Numar_Telefon}`));
      }
    }
  }, [initialUserData]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Gamma",
    description: "Contact us page for Gamma",
    publisher: {
      "@type": "Organization",
      name: "Gamma",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "022897007",
        contactType: "customer service",
        email: "support@gamma.md",
        areaServed: "MD",
        availableLanguage: ["Romanian", "Russian"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Strada Sfîntul Gheorghe 6",
        addressLocality: "Chișinău",
        addressCountry: "MD",
      },
    },
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: stripPhonePrefix(phone).toString(),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitStatus("success");
      e.target.reset();
      setPhone("+373 ");
    } catch (error) {
      console.error("Failed to send message:", error.message);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        id="contact-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-[1250px] w-[90vw] mx-auto">
        <nav aria-label="Breadcrumb" className="py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {t("home")}
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-200">
                {t("contact_us")}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex mt-10 gap-4">
          <div className="w-full md:w-[70%] p-6 border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-gray-100">
            <h1 className="font-semibold text-3xl mb-6">{t("contact_us")}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium dark:text-white text-gray-700"
                >
                  {t("your_name")}:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("name")}
                  className="p-2 dark:bg-[#4A4B59] bg-white mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tel"
                  className="block text-sm font-medium dark:text-white text-gray-700"
                >
                  {t("phone_number")}:
                </label>
                <input
                  type="tel"
                  id="tel"
                  name="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  maxLength={13}
                  placeholder={t("phone_number")}
                  className="p-2 dark:bg-[#4A4B59] bg-white mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium dark:text-white text-gray-700"
                >
                  {t("email_address")}:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="p-2 dark:bg-[#4A4B59] bg-white mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium dark:text-white text-gray-700"
                >
                  {t("message")}:
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder={t("write_message_here")}
                  className="p-2 dark:bg-[#4A4B59] bg-white mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  rows={4}
                  required
                />
              </div>

              {submitStatus === "success" && (
                <div className="text-green-600 dark:text-green-400">
                  {t("message_sent_success")}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="text-red-600 dark:text-red-400">
                  {t("message_error")}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gray-500 hover:bg-charade-800 text-white px-4 py-2 rounded-lg transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? t("sending") : t("send")}
              </button>
            </form>
          </div>

          <div className="hidden md:flex border border-gray-200 dark:border-gray-700 h-96 w-[30%] rounded-xl p-6 gap-2 items-center justify-center">
            <div>
              <h1 className="font-semibold text-3xl mb-6">{t("contacts")}</h1>

              <a
                href="tel:+022897007"
                className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
              >
                <div className="flex relative bg-accent p-2 rounded-full w-[35px] h-[35px] items-center justify-center">
                  <PiPhoneCallThin className="text-white" size={20} />
                </div>
                <p className="text-gray-500 text-base hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  022897007
                </p>
              </a>

              <a
                href="mailto:support@gamma.md"
                className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
              >
                <div className="flex bg-accent p-2 rounded-full w-[35px] h-[35px] items-center justify-center">
                  <PiEnvelopeThin className="text-white" size={20} />
                </div>
                <p className="text-gray-500 text-base hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  support@gamma.md
                </p>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Strada+Sfîntul+Gheorghe+6,+Chișinău,+Moldova"
                className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex bg-accent p-2 rounded-full w-[35px] h-[35px] items-center justify-center">
                  <PiMapPinThin className="text-white" size={20} />
                </div>
                <p className="text-gray-500 text-base hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {locale === "ru"
                    ? "Страда Святого Георгия 6, Кишинёв, Молдова"
                    : "Strada Sfîntul Gheorghe 6, Chișinău, Moldova"}
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
