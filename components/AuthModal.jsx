"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { PiChalkboardTeacherThin, PiSignOut } from "react-icons/pi";
import Link from "next/link";
import Image from "next/image";

export default function AuthModal() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userData, setUserData] = useState(null);

  const { data: session } = useSession();
  const t = useTranslations("auth");
  const locale = useLocale();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/auth/profile");
          const data = await res.json();
          if (data.user) {
            setUserData(data.user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const hasValidNames = (data) => {
    return !!(
      data?.Nume &&
      data?.Prenume &&
      data.Nume.trim() &&
      data.Prenume.trim()
    );
  };

  const shouldShowInitials = hasValidNames(userData);

  const userInitials = shouldShowInitials
    ? `${userData.Nume[0]}${userData.Prenume[0]}`.toUpperCase()
    : "";

  const displayName =
    session?.user?.name ||
    (userData && `${userData.Nume} ${userData.Prenume}`.trim()) ||
    "";

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleRegister = async (e) => {
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
        setSuccessMessage(t("user_registered_successfully"));
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
            ? t("email_already_exists")
            : t("internal_error")
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(t("internal_error"));
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(t("invalid_credentials"));
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(t("internal_error"));
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: window.location.href });
  };

  if (session) {
    return (
      <div className="w-60 flex border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-charade-900 justify-center flex-col">
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="text-center text-xl font-bold">{t("Welcome")}</h1>

          <div className="w-14 h-14 rounded-full overflow-hidden relative">
            {!session.user.image && !userInitials ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                fill
                quality={100}
                sizes="100px"
                className="object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                {userInitials}
              </div>
            )}
          </div>

          {displayName ? (
            <h2 className="text-center text-base">{displayName}</h2>
          ) : (
            <div className="animate-pulse h-6 w-32 dark:bg-charade-700 bg-gray-300 rounded mx-auto" />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Link
            href={`/${locale}/dashboard`}
            className="bg-charade-950 text-white p-2 rounded-lg text-center items-center justify-center flex gap-2"
          >
            <PiChalkboardTeacherThin size={25} />
            {t("Dashboard")}
          </Link>

          <button
            className="bg-red-600 text-white p-2 rounded-lg flex items-center justify-center gap-2"
            onClick={() => signOut()}
          >
            <PiSignOut size={25} />
            {t("Logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 flex border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-charade-900 justify-center flex-col">
      <div className="flex justify-between mb-4 border-b border-gray-300 dark:border-gray-700">
        <button
          className={`w-full p-2 ${
            activeTab === "login" ? "border-b-2 border-charade-950" : ""
          }`}
          onClick={() => switchTab("login")}
        >
          {t("Login")}
        </button>
        <button
          className={`w-full p-2 ${
            activeTab === "register" ? "border-b-2 border-charade-950" : ""
          }`}
          onClick={() => switchTab("register")}
        >
          {t("Register")}
        </button>
      </div>

      {activeTab === "login" ? (
        <div className="flex flex-col gap-4">
          <button
            className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
            onClick={() => handleSocialLogin("google")}
          >
            {t("Login with Google")}
            <Image src="/google.svg" alt="Google" width={32} height={32} />
          </button>
          <button
            className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
            onClick={() => handleSocialLogin("facebook")}
          >
            {t("Login with Facebook")}
            <Image src="/facebook.svg" alt="Facebook" width={32} height={32} />
          </button>
          <p className="text-center">{t("or")}</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
            />
            <input
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              type="password"
              placeholder={t("Password")}
              autoComplete="current-password"
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
            />
            <button
              type="submit"
              className="bg-charade-950 text-white p-2 rounded-lg"
            >
              {t("Login")}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
            onClick={() => handleSocialLogin("google")}
          >
            {t("Register with Google")}
            <Image src="/google.svg" alt="Google" width={32} height={32} />
          </button>
          <button
            className="bg-charade-950 p-2 rounded-lg flex items-center gap-2 justify-center text-white"
            onClick={() => handleSocialLogin("facebook")}
          >
            {t("Register with Facebook")}
            <Image src="/facebook.svg" alt="Facebook" width={32} height={32} />
          </button>
          <p className="text-center">{t("or")}</p>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder={t("Nume si Prenume")}
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
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={t("Password")}
              autoComplete="new-password"
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
            />
            <button
              type="submit"
              className="bg-charade-950 text-white p-2 rounded-lg"
            >
              {t("Register")}
            </button>
          </form>
        </div>
      )}

      {errorMessage && (
        <div className="text-red-500 text-center mt-4">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="text-green-500 text-center mt-4">{successMessage}</div>
      )}
    </div>
  );
}
