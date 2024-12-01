"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { PiLaptopThin } from "react-icons/pi";
import { useTranslations, useLocale } from "next-intl";

export default function PWAInstallPrompt() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const detectDeviceType = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType("ios");
      } else if (/android/.test(userAgent)) {
        setDeviceType("android");
      } else {
        setDeviceType("desktop");
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const checkPWAInstallAvailability = () => {
      if ("serviceWorker" in navigator && "beforeinstallprompt" in window) {
        setCanInstall(true);
      }
    };

    detectDeviceType();
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
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt && deviceType === "desktop") {
      if (window.navigator.userAgent.includes("Chrome")) {
        window.open("chrome://flags/#install-pwa", "_blank");
      } else {
        alert(t("other_browser_instructions"));
      }
      setShowPrompt(false);
      return;
    }

    if (deferredPrompt) {
      try {
        const { outcome } = await deferredPrompt.prompt();
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setCanInstall(false);
        }
      } catch (error) {
        console.error("PWA installation failed:", error);
        alert(t("install_error"));
      }
    }
    setShowPrompt(false);
  };

  return (
    <>
      {canInstall && deviceType === "ios" && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-charade-950 dark:text-white">
            {t("install_app")}
          </h2>
          <div
            className="flex w-full bg-charade-950 p-2 rounded-xl border-2 border-gray-500 items-center justify-center gap-2 mb-2 cursor-pointer"
            onClick={() => setShowPrompt(true)}
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
            onClick={() => setShowPrompt(true)}
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
            onClick={() => setShowPrompt(true)}
          >
            <PiLaptopThin className="h-7 w-7" />
            <h3 className="text-white">{t("install_desktop_app")}</h3>
          </div>
        </div>
      )}

      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("install_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("install_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setShowPrompt(false)}>
              {t("not_now")}
            </Button>
            <Button onClick={handleInstallClick}>{t("install")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
