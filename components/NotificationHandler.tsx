"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
export default function NotificationHandler() {
  const t = useTranslations("");
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isReady, registration, error } = useServiceWorker();

  useEffect(() => {
    // Wait a bit for PWA context to be fully established
    setTimeout(() => {
      const isPWA = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as Navigator).standalone || 
        document.referrer.includes('android-app://') ||
        window.location.href.includes('?mode=pwa');
                  
      console.log('Is PWA:', isPWA, {
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        iosStandalone: (window.navigator as Navigator).standalone,
        androidApp: document.referrer.includes('android-app://')
      });

      if (isPWA || process.env.NODE_ENV === 'development') {
        checkNotificationStatus();
      } else {
        setShouldShow(false);
      }
    }, 1000);

    const checkNotificationStatus = async () => {
      if (!isReady || !registration || error) {
        console.log('Not ready:', { isReady, registration, error });
        setShouldShow(false);
        return;
      }

      const notificationSupported = "Notification" in window;
      console.log('Notification supported:', notificationSupported);
      
      if (!notificationSupported) {
        setShouldShow(false);
        return;
      }

      const hasSubscribed = localStorage.getItem("pushNotificationSubscribed") === "true";
      console.log('Has subscribed:', hasSubscribed);
      
      if (hasSubscribed) {
        setShouldShow(false);
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', subscription);
      
      if (subscription) {
        localStorage.setItem("pushNotificationSubscribed", "true");
        setShouldShow(false);
        return;
      }

      console.log('Setting shouldShow to true');
      setShouldShow(true);
    };
  }, [isReady, registration, error]);

  const handleEnableNotifications = async () => {
    if (!registration) return;

    try {
      setIsLoading(true);

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShouldShow(false);
        return;
      }

      // Get VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found");
      }

      // Subscribe to push notifications
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to server
      const response = await fetch("/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to save subscription");
      }

      localStorage.setItem("pushNotificationSubscribed", "true");
      setShouldShow(false);
    } catch (err) {
      console.error("Error enabling notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pushNotificationSubscribed", "true");
    setShouldShow(false);
  };

  if (!shouldShow) {
    return null;
  }

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
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="px-6 py-2.5 bg-white text-charade-950 font-medium rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{t("notifications.enabling")}</span>
                </>
              ) : (
                t("notifications.enable")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
