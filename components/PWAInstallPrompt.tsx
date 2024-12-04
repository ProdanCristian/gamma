"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { PiLaptopThin } from "react-icons/pi";
import IphoneInstall from "./IphoneInstall";
import Cookies from "js-cookie";
import DesktopInstall from "./DesktopInstall";
import AndroidInstall from "./AndroidInstall";

export default function PWAInstallPrompt() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );
  const [showIphoneInstall, setShowIphoneInstall] = useState(false);
  const [showDesktopInstall, setShowDesktopInstall] = useState(false);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is installed
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();
    window
      .matchMedia("(display-mode: standalone)")
      .addListener(checkIfInstalled);

    return () => {
      window
        .matchMedia("(display-mode: standalone)")
        .removeListener(checkIfInstalled);
    };
  }, []);

  // Handle installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as any;
      setDeferredPrompt(prompt);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Device detection and prompt display
  useEffect(() => {
    if (isInstalled) {
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    const hasShownDesktopPrompt = Cookies.get("hasShownDesktopPrompt");

    if (isIOS) {
      setDeviceType("ios");
      setTimeout(() => {
        setShowIphoneInstall(true);
      }, 3500);
    } else if (isAndroid) {
      setDeviceType("android");
      setTimeout(() => {
        setShowAndroidInstall(true);
      }, 4000);
    } else {
      setDeviceType("desktop");
      if (!hasShownDesktopPrompt && deferredPrompt) {
        setTimeout(() => {
          setShowDesktopInstall(true);
          Cookies.set("hasShownDesktopPrompt", "true", { expires: 365 });
        }, 4000);
      }
    }
  }, [isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (deviceType === "ios") {
      setShowIphoneInstall(false);
      setTimeout(() => {
        setShowIphoneInstall(true);
      }, 100);
      return;
    }

    if (!deferredPrompt) {
      console.log("No installation prompt available");
      return;
    }

    try {
      const { outcome } = await deferredPrompt.prompt();
      console.log("Installation outcome:", outcome);

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setCanInstall(false);
        setShowDesktopInstall(false);
        setIsInstalled(true);
        Cookies.set("appInstalled", "true", { expires: 365 });
      }
    } catch (error) {
      console.error("Installation failed:", error);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {showIphoneInstall && deviceType === "ios" && <IphoneInstall />}
      {showAndroidInstall && deviceType === "android" && (
        <AndroidInstall onInstallClick={handleInstallClick} />
      )}
      {showDesktopInstall && deviceType === "desktop" && deferredPrompt && (
        <DesktopInstall onInstallClick={handleInstallClick} />
      )}

      {canInstall && deviceType === "ios" && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-charade-950 dark:text-white">
            {t("install_app")}
          </h2>
          <div
            className="flex w-full bg-charade-950 p-2 rounded-xl border-2 border-gray-500 items-center justify-center gap-2 mb-2 cursor-pointer"
            onClick={handleInstallClick}
          >
            <img
              src="/Apple.svg"
              alt="App Store"
              className="h-7"
              loading="lazy"
              aria-hidden="true"
            />
            <h3 className="text-white">{t("install_ios_app")}</h3>
          </div>
        </div>
      )}

      {canInstall && deviceType === "android" && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-charade-950 dark:text-white">
            {t("install_app")}
          </h2>
          <div
            className="flex w-full bg-charade-950 p-2 rounded-xl border-2 border-gray-500 items-center justify-center gap-2 cursor-pointer"
            onClick={handleInstallClick}
          >
            <img
              src="/Playstore.svg"
              alt="Play Store"
              className="h-7"
              loading="lazy"
              aria-hidden="true"
            />
            <h3 className="text-white">{t("install_android_app")}</h3>
          </div>
        </div>
      )}

      {canInstall && deviceType === "desktop" && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-charade-950 dark:text-white">
            {t("install_app")}
          </h2>
          <div
            className="flex w-full bg-charade-950 p-2 rounded-xl border-2 border-gray-500 items-center justify-center gap-2 cursor-pointer"
            onClick={handleInstallClick}
          >
            <PiLaptopThin className="h-7 w-7 text-white" />
            <h3 className="text-white">{t("install_desktop_app")}</h3>
          </div>
        </div>
      )}
    </>
  );
}
