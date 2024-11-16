"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PiEye, PiEyeSlash } from "react-icons/pi";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("passwords_dont_match"));
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, locale }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push("/");
        }, 2000);
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
        {t("reset_password")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("new_password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("new_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-lg dark:bg-[#4a4b59] border dark:border-none"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("confirm_password")}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded-lg dark:bg-[#4a4b59] border dark:border-none"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <PiEyeSlash size={16} />
              ) : (
                <PiEye size={16} />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-charade-950 text-white p-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? t("resetting") : t("reset_password")}
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
