"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { PiPhoneCallThin, PiEnvelopeThin, PiMapPinThin } from "react-icons/pi";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("tel"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "support@gamma.md",
          ...data,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setSubmitStatus("success");
      e.target.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex mt-10 gap-4 max-w-[1250px] w-[90vw] mx-auto ">
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
            href="tel:+079867092"
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex relative bg-accent p-2 rounded-full w-[35px] h-[35px] items-center justify-center">
              <PiPhoneCallThin className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              079867092
            </p>
          </a>

          <a
            href="mailto:support@gamma.md"
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex bg-accent p-2 rounded-full w-[35px] h-[35px] items-center justify-center">
              <PiEnvelopeThin className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
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
            <p className="text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Strada Sfîntul Gheorghe 6, Chișinău, Moldova
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
