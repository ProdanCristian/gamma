"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PiLaptopThin } from "react-icons/pi";
import IphoneInstall from "./IphoneInstall";
import Cookies from "js-cookie";
import DesktopInstall from "./DesktopInstall";
import AndroidInstall from "./AndroidInstall";

export default function PWAInstallPrompt() {
  const t = useTranslations("footer");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );
  const [showIphoneInstall, setShowIphoneInstall] = useState(false);
  const [showDesktopInstall, setShowDesktopInstall] = useState(false);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [showManualIphoneInstall, setShowManualIphoneInstall] = useState(false);

  useEffect(() => {
    const hasVisitedBefore = Cookies.get("hasVisitedBefore");
    if (!hasVisitedBefore) {
      Cookies.set("hasVisitedBefore", "true", { expires: 365 });
      setHasVisited(false);
    } else {
      setHasVisited(true);
    }
  }, []);

  // Check if app is running as PWA
  useEffect(() => {
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOSPWA = (window.navigator as any).standalone;
      return Boolean(isStandalone || isIOSPWA);
    };

    setIsPWA(checkIfPWA());

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
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
    if (hasVisited) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

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
      if (deferredPrompt) {
        setTimeout(() => {
          setShowDesktopInstall(true);
        }, 4000);
      }
    }
  }, [isPWA, deferredPrompt, hasVisited]);

  const handleInstallClick = async () => {
    if (deviceType === "ios") {
      setShowManualIphoneInstall(true);
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
        Cookies.set("appInstalled", "true", { expires: 365 });
      }
    } catch (error) {
      console.error("Installation failed:", error);
    }
  };

  // Only hide install buttons in PWA mode
  if (isPWA) {
    return null;
  }

  return (
    <>
      {!hasVisited && (
        <>
          {showIphoneInstall && deviceType === "ios" && (
            <IphoneInstall onClose={() => setShowIphoneInstall(false)} />
          )}
          {showAndroidInstall && deviceType === "android" && (
            <AndroidInstall onInstallClick={handleInstallClick} />
          )}
          {showDesktopInstall && deviceType === "desktop" && deferredPrompt && (
            <DesktopInstall onInstallClick={handleInstallClick} />
          )}
        </>
      )}

      {showManualIphoneInstall && deviceType === "ios" && (
        <IphoneInstall onClose={() => setShowManualIphoneInstall(false)} />
      )}

      {deviceType === "ios" && (
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

      {deviceType === "android" && (
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

      {deviceType === "desktop" && deferredPrompt && (
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
