"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { PiEye, PiEyeSlash } from "react-icons/pi";

interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("login");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Message states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(t("auth.invalid_credentials"));
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(t("auth.internal_error"));
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(t("auth.user_registered_successfully"));
        setEmail("");
        setPassword("");
        setFullName("");
        setTimeout(() => {
          setSuccessMessage("");
          setActiveTab("login");
        }, 2000);
      } else {
        setErrorMessage(
          data.error === "User already exists"
            ? t("auth.email_already_exists")
            : t("auth.internal_error")
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(t("auth.internal_error"));
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: window.location.href });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[360px] flex border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-charade-900 justify-center flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-between w-full border-b border-gray-300 dark:border-gray-700">
            <button
              className={`w-full p-2 ${
                activeTab === "login" ? "border-b-2 border-charade-950" : ""
              }`}
              onClick={() => switchTab("login")}
            >
              {t("auth.Login")}
            </button>
            <button
              className={`w-full p-2 ${
                activeTab === "register" ? "border-b-2 border-charade-950" : ""
              }`}
              onClick={() => switchTab("register")}
            >
              {t("auth.Register")}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>

        {activeTab === "login" ? (
          <div className="flex flex-col gap-4">
            <button
              className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
              onClick={() => handleSocialLogin("google")}
            >
              {t("auth.Login with Google")}
              <Image src="/google.svg" alt="Google" width={32} height={32} />
            </button>
            <button
              className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
              onClick={() => handleSocialLogin("facebook")}
            >
              {t("auth.Login with Facebook")}
              <Image
                src="/facebook.svg"
                alt="Facebook"
                width={32}
                height={32}
              />
            </button>
            <p className="text-center">{t("auth.or")}</p>
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              />
              <div className="relative">
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  type={showLoginPassword ? "text" : "password"}
                  placeholder={t("auth.Password")}
                  autoComplete="current-password"
                  className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showLoginPassword ? (
                    <PiEyeSlash size={16} />
                  ) : (
                    <PiEye size={16} />
                  )}
                </button>
              </div>
              <div className="text-right">
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-sm dark:text-white text-charade-950 hover:underline"
                >
                  {t("auth.forgot_password")}
                </Link>
              </div>
              <button
                type="submit"
                className="bg-charade-950 text-white p-2 rounded-lg"
              >
                {t("auth.Login")}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
              onClick={() => handleSocialLogin("google")}
            >
              {t("auth.Register with Google")}
              <Image src="/google.svg" alt="Google" width={32} height={32} />
            </button>
            <button
              className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
              onClick={() => handleSocialLogin("facebook")}
            >
              {t("auth.Register with Facebook")}
              <Image
                src="/facebook.svg"
                alt="Facebook"
                width={32}
                height={32}
              />
            </button>
            <p className="text-center">{t("auth.or")}</p>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder={t("auth.Nume si Prenume")}
                autoComplete="name"
                className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              />
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder={t("auth.Password")}
                  autoComplete="new-password"
                  className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showRegisterPassword ? (
                    <PiEyeSlash size={16} />
                  ) : (
                    <PiEye size={16} />
                  )}
                </button>
              </div>
              <button
                type="submit"
                className="bg-charade-950 text-white p-2 rounded-lg"
              >
                {t("auth.Register")}
              </button>
            </form>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-500 text-center mt-4">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="text-green-500 text-center mt-4">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};
