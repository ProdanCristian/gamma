"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { PiLaptopThin } from "react-icons/pi";
import IphoneInstall from "./IphoneInstall";
import Cookies from "js-cookie";

export default function PWAInstallPrompt() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );
  const [showIphoneInstall, setShowIphoneInstall] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setCanInstall(false);
      return;
    }

    const hasShownIOSPrompt = Cookies.get('hasShownIOSPrompt');
    if (hasShownIOSPrompt) {
      setHasShownPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as any;
      setDeferredPrompt(prompt);
      setCanInstall(true);
    };

    const checkPWAInstallAvailability = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = isIOS || isAndroid;

      if (isIOS) {
        setDeviceType("ios");
        setCanInstall(true);
        
        if (!hasShownIOSPrompt) {
          setTimeout(() => {
            setShowIphoneInstall(true);
            setHasShownPrompt(true);
            Cookies.set('hasShownIOSPrompt', 'true', { expires: 365 });
          }, 3500);
        }
      } else if (isAndroid) {
        setDeviceType("android");
      } else {
        setDeviceType("desktop");
      }

      const isPWASupported =
        "serviceWorker" in navigator && "beforeinstallprompt" in window;
      setCanInstall((isPWASupported || isMobile) && !isInstalled);
    };

    checkPWAInstallAvailability();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deviceType === "ios") {
      setShowIphoneInstall(false);
      setTimeout(() => {
        setShowIphoneInstall(true);
      }, 100);
      return;
    }

    if (!deferredPrompt) {
      console.error("No deferred prompt available");
      alert("PWA installation is not supported on this device");
      return;
    }

    try {
      const { outcome } = await deferredPrompt.prompt();
      console.log("Installation outcome:", outcome);

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } catch (error) {
      console.error("PWA installation failed:", error);
      alert("Failed to install the app. Please try again.");
    }
  };

  return (
    <>
      {showIphoneInstall && <IphoneInstall />}

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
