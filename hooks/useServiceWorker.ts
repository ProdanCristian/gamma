import { useState, useEffect } from "react";

export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let mounted = true;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service worker registered");

        if (mounted) {
          setRegistration(registration);
          setIsReady(true);
        }

        // Wait for the service worker to be active
        if (registration.installing || registration.waiting) {
          const serviceWorker = registration.installing || registration.waiting;
          if (serviceWorker) {
            serviceWorker.addEventListener("statechange", () => {
              if (serviceWorker.state === "activated" && mounted) {
                console.log("Service worker activated");
                setRegistration(registration);
                setIsReady(true);
              }
            });
          }
        }
      } catch (err) {
        console.error("Service worker registration failed:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to register service worker"));
          setIsReady(false);
        }
      }
    };

    // Start registration process
    registerSW();

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, registration, error };
}
