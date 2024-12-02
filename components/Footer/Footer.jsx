"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import useSWR from "swr";
import {
  PiNewspaperLight,
  PiPhoneCall,
  PiEnvelope,
  PiMapPin,
  PiFacebookLogo,
  PiInstagramLogo,
} from "react-icons/pi";
import MenuFooter from "./MenuFooter";
import { useToast } from "@/hooks/use-toast";
import PWAInstallPrompt from "../PWAInstallPrompt";

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const { theme, systemTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [blackLogo, setBlackLogo] = useState(null);
  const [lightLogo, setLightLogo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedBlackLogo = localStorage.getItem("blackLogo");
    const storedLightLogo = localStorage.getItem("lightLogo");

    if (storedBlackLogo && storedLightLogo) {
      setBlackLogo(storedBlackLogo);
      setLightLogo(storedLightLogo);
    }
  }, []);

  const { data: logoData } = useSWR("/api/marketingDesign", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000,
    onSuccess: (data) => {
      if (data.success && data.data.length > 0) {
        const newBlackLogo = data.data[0].Logo_Black[0];
        const newLightLogo = data.data[0].Logo[0];

        if (newBlackLogo !== blackLogo || newLightLogo !== lightLogo) {
          localStorage.setItem("blackLogo", newBlackLogo);
          localStorage.setItem("lightLogo", newLightLogo);
          setBlackLogo(newBlackLogo);
          setLightLogo(newLightLogo);
        }
      }
    },
  });

  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch("/api/newsLetter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmail("");
        toast({
          title: t("subscription_success_message"),
          variant: "default",
        });
      } else {
        if (data.message === "already_subscribed") {
          toast({
            title: t("already_subscribed_message"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("subscription_error"),
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast({
        title: t("subscription_error"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-gray-200 dark:bg-charade-950">
      <div>
        <div className="bg-charade-950 dark:bg-charade-900 w-full">
          <div className="max-w-[1250px] w-[90%] mx-auto flex flex-col md:flex-row gap-4 py-5 justify-center items-center">
            <PiNewspaperLight className="text-white" size={55} />
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">
                {t("discount_offer")}
              </h2>
              <p className="text-gray-500">{t("newsletter_description")}</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex md:flex-row gap-2 flex-grow w-full lg:w-auto"
              aria-label={t("newsletter_signup")}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={t("email_placeholder")}
                className="flex-grow text-white items-center justify-center bg-white/10 rounded-xl px-4 py-3 transition-colors hover:bg-white/20 focus:outline-none"
                required
                aria-label={t("email_input")}
              />
              <button
                type="submit"
                className="bg-accent rounded-lg p-2"
                aria-label={t("subscribe_button")}
              >
                {t("subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-[1250px] w-[90%] mx-auto justify-between my-10 flex flex-col md:flex-row">
          <Link
            href="/"
            locale={false}
            aria-label={t("home_link")}
            className="md:hidden self-center"
          >
            <div className="h-12 w-[150px]">
              {blackLogo && lightLogo && (
                <img
                  src={currentTheme === "dark" ? lightLogo : blackLogo}
                  alt={t("logo_alt")}
                  className="h-full w-full"
                  loading="lazy"
                  aria-hidden="true"
                />
              )}
            </div>
          </Link>
          <div className="flex flex-col gap-4 self-center md:w-1/3 w-[70%]">
            <Link
              href="/"
              locale={false}
              aria-label={t("home_link")}
              className="hidden md:block"
            >
              <div className="h-12 w-[150px]">
                {blackLogo && lightLogo && (
                  <img
                    src={currentTheme === "dark" ? lightLogo : blackLogo}
                    alt={t("logo_alt")}
                    className="h-full w-full"
                    loading="lazy"
                    aria-hidden="true"
                  />
                )}
              </div>
            </Link>
            <p className="text-gray-500 text-center md:text-left">
              {t("footer_description")}
            </p>

            <a
              href="tel:022897007"
              className="flex items-center gap-2 flex-col  md:flex-row"
              aria-label={t("phone_contact")}
            >
              <div className="flex relative bg-accent p-2 rounded-full w-[40px] h-[40px] items-center justify-center">
                <PiPhoneCall
                  className="text-white"
                  size={30}
                  aria-hidden="true"
                />
              </div>
              <p className="text-gray-500">022897007</p>
            </a>

            <a
              href="mailto:info@gamma.md"
              className="flex items-center gap-2 flex-col md:flex-row"
              aria-label={t("email_contact")}
            >
              <div className="flex bg-accent p-2 rounded-full w-[40px] h-[40px] items-center justify-center">
                <PiEnvelope
                  className="text-white"
                  size={30}
                  aria-hidden="true"
                />
              </div>
              <p className="text-gray-500">info@gamma.md</p>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Strada+Sfîntul+Gheorghe+6,+Chișinău,+Moldova"
              className="flex items-center gap-2 flex-col md:flex-row"
              aria-label={t("address_link")}
            >
              <div className="flex bg-accent p-2 rounded-full w-[40px] h-[40px] items-center justify-center">
                <PiMapPin className="text-white" size={30} aria-hidden="true" />
              </div>
              <p className="text-gray-500 text-center">{t("street")}</p>
            </a>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold mb-4 text-charade-950 dark:text-white">
              {t("menu")}
            </h2>
            <MenuFooter />
          </div>

          <div className="hidden md:block">
            <h2 className="text-2xl font-bold mb-4 text-charade-950 dark:text-white">
              {t("customer_service")}
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { href: "/terms-and-conditions", text: "terms_conditions" },
                { href: "/privacy-policy", text: "privacy_policy" },
                { href: "/warranty", text: "warranty" },
                { href: "/return-refunds", text: "exchange_return" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="mr-2 text-gray-500 dark:hover:text-accent hover:text-accent"
                >
                  {t(link.text)}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center md:text-left my-8 md:my-0">
            <h2 className="text-xl font-bold mb-4 text-charade-950 dark:text-white">
              {t("follow_us")}
            </h2>
            <div className="flex gap-2 w-full justify-center md:justify-start my-4">
              <PiFacebookLogo
                className="text-gray-500 hover:text-accent transition-colors cursor-pointer"
                size={35}
                role="img"
                aria-label="Facebook"
                onClick={() => {
                  window.open(
                    "https://www.facebook.com/gammamarketplace/",
                    "_blank"
                  );
                }}
              />
              <PiInstagramLogo
                className="text-gray-500 hover:text-accent transition-colors cursor-pointer"
                size={35}
                role="img"
                aria-label="Instagram"
                onClick={() => {
                  window.open(
                    "https://www.instagram.com/gamma.moldova/",
                    "_blank"
                  );
                }}
              />
            </div>
            <PWAInstallPrompt />
          </div>
        </div>
      </div>
      <div>
        <div className="bg-charade-900 py-2">
          <div className="max-w-[1250px] w-[90%] mx-auto flex items-center justify-center gap-2">
            <p className="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
              <span>{t("developed_by")}</span>
              <a
                href="https://prodan.digital"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors font-bold text-lg flex items-center gap-1 group"
              >
                <span className="bg-gradient-to-b from-accent to-accent-light bg-clip-text text-transparent">
                  prodandigital
                </span>
                <svg
                  className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-300 md:h-10 h-20 items-center flex">
        <div className="max-w-[1250px] w-[90%] mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-2 md:gap-0 py-2 md:py-0">
          <div className="flex items-center space-x-2 text-charade-950">
            <p className="text-sm">&copy;</p>
            <p className="font-bold">Gamma</p>
            <p className="text-sm text-gray-500">{t("copyright")}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">{t("payments_methods")}</p>
            <div className="flex gap-2 h-10">
              <img
                src="/Payments.png"
                alt={t("accepted_payment_methods")}
                className="h-full"
                loading="lazy"
                aria-label={t("accepted_payment_methods")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
