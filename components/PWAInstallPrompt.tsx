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
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as any;
      setDeferredPrompt(prompt);
      setCanInstall(true);
      console.log("Deferred prompt captured", prompt);
    };

    const checkPWAInstallAvailability = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = isIOS || isAndroid;

      console.log("Device detection:", { isIOS, isAndroid, isMobile });

      if (isIOS) {
        setDeviceType("ios");
        setCanInstall(true);
      } else if (isAndroid) {
        setDeviceType("android");
      } else {
        setDeviceType("desktop");
      }

      const isPWASupported = 'serviceWorker' in navigator && 
                              'beforeinstallprompt' in window;
      
      console.log("PWA Support:", isPWASupported);
      
      setCanInstall(isPWASupported || isMobile);
    };

    checkPWAInstallAvailability();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log("Install clicked", { 
      deviceType, 
      deferredPrompt, 
      canInstall 
    });

    if (deviceType === "ios") {
      alert("For iOS, please use browser's 'Add to Home Screen' option");
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) {
      console.error("No deferred prompt available");
      alert("PWA installation is not supported on this device");
      setShowPrompt(false);
      return;
    }

    try {
      const { outcome } = await deferredPrompt.prompt();
      console.log("Installation outcome:", outcome);

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setCanInstall(false);
      } else {
        console.log("Installation was dismissed");
      }
      setShowPrompt(false);
    } catch (error) {
      console.error("PWA installation failed:", error);
      alert("Failed to install the app. Please try again.");
      setShowPrompt(false);
    }
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
