"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Type declaration for iOS Safari navigator
interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

export default function NotificationHandler() {
  const t = useTranslations("");

  const [showPrompt, setShowPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      return Notification.permission === "default";
    }
    return false;
  });
  const [isPWA, setIsPWA] = useState(false);

  // Check if app is running as PWA
  useEffect(() => {
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOSPWA =
        (window.navigator as SafariNavigator).standalone ?? false;

      return Boolean(isStandalone || isIOSPWA);
    };

    setIsPWA(checkIfPWA());

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const registerPushSubscription = async () => {
    try {
      console.log("Getting service worker registration...");
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker is ready");

      const existingSubscription =
        await registration.pushManager.getSubscription();
      console.log("Existing subscription:", existingSubscription);

      if (!existingSubscription) {
        console.log("Creating new subscription...");
        console.log("VAPID key:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        console.log("New Push Subscription:", subscription);

        const response = await fetch("/api/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

        console.log("Subscription sent to server:", await response.json());
      }
    } catch (error) {
      console.error("Error registering push subscription:", error);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Notification permission status:", permission);

      setShowPrompt(false);

      if (permission === "granted") {
        await registerPushSubscription();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        if (!isPWA) return;

        const registration = await navigator.serviceWorker.register("/sw.js");

        if (Notification.permission === "default") {
          setShowPrompt(true);
        } else if (Notification.permission === "granted") {
          await registerPushSubscription();
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    if ("Notification" in window && "serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, [isPWA]);

  // Only show if it's a PWA and notification prompt should be shown
  if (!isPWA || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-accent p-6 text-charade-950 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {t("notifications.title")}
            </h3>
            <p className="text-sm opacity-90">
              {t("notifications.description")}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleEnableNotifications()}
              className="px-6 py-2.5 bg-white text-charade-950 font-medium rounded-full hover:bg-opacity-90 transition-colors"
            >
              {t("notifications.enable")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
