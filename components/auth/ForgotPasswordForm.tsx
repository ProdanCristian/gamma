"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export const ForgotPasswordForm = () => {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(t("internal_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full py-10  px-10  max-w-md border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-charade-900 justify-center">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("forgot_password")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("email_address")}
          </label>
          <input
            type="email"
            placeholder={t("email_address")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-lg dark:bg-[#4a4b59] border dark:border-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-charade-950 text-white p-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? t("sending") : t("send_reset_link")}
        </button>
      </form>
      {message && (
        <div className="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400">{message}</p>
        </div>
      )}
      {error && (
        <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
