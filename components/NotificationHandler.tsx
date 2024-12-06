"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";


interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

export default function NotificationHandler() {
  const t = useTranslations("");

  const [showPrompt, setShowPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      const storedPromptState = localStorage.getItem("notificationPromptState");
      if (storedPromptState !== null) {
        return JSON.parse(storedPromptState);
      }
      return window.matchMedia("(display-mode: standalone)").matches;
    }
    return false;
  });
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSPWA = (window.navigator as SafariNavigator).standalone ?? false;

      const isPWAValue = Boolean(isStandalone || isIOSPWA);
      console.log("PWA status:", { isStandalone, isIOSPWA, isPWAValue });
      return isPWAValue;
    };

    const updatePWAState = () => {
      const newPWAState = checkIfPWA();
      setIsPWA(newPWAState);
    };

    updatePWAState();

    const mql = window.matchMedia("(display-mode: standalone)");
    mql.addEventListener("change", updatePWAState);

    return () => {
      mql.removeEventListener("change", updatePWAState);
    };
  }, []);

  const registerPushSubscription = async () => {
    if (!isPWA) return;

    try {
      console.log("Registering push in PWA mode...");
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker is ready");

      const existingSubscription =
        await registration.pushManager.getSubscription();
      console.log("Existing subscription:", existingSubscription);

      if (!existingSubscription) {
        console.log("Creating new subscription...");
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log("VAPID key:", vapidKey);

        if (!vapidKey) {
          throw new Error("VAPID key is not defined");
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });

        console.log("New Push Subscription:", subscription);

        const response = await fetch("/api/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

        if (!response.ok) {
          throw new Error("Failed to save subscription");
        }

        const result = await response.json();
        console.log("Server response:", result);
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
      localStorage.setItem("notificationPromptState", "false");

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

        if (Notification.permission === "default" && isPWA) {
          setShowPrompt(true);
        } else if (Notification.permission === "granted" && isPWA) {
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

  // Add console log before return condition
  console.log("Current states - isPWA:", isPWA, "showPrompt:", showPrompt);

  if (!isPWA || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-accent p-6 text-charade-950 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
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
