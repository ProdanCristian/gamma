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
        // First check if there's already an active service worker
        const existingRegistration = await navigator.serviceWorker.ready;
        if (mounted) {
          setRegistration(existingRegistration);
          setIsReady(true);
          return;
        }

        // If no active service worker, register a new one
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service worker registered");

        // Wait for the service worker to be ready
        if (registration.installing || registration.waiting) {
          await new Promise<void>((resolve) => {
            const serviceWorker =
              registration.installing || registration.waiting;
            if (!serviceWorker) {
              resolve();
              return;
            }

            serviceWorker.addEventListener("statechange", (e) => {
              if (serviceWorker.state === "activated" && mounted) {
                console.log("Service worker activated");
                setRegistration(registration);
                setIsReady(true);
                resolve();
              }
            });
          });
        } else if (registration.active && mounted) {
          setRegistration(registration);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Service worker registration failed:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to register service worker")
          );
          setIsReady(false);
        }
      }
    };

    // Start registration process
    registerSW();

    // Listen for service worker controller changes
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (mounted) {
        console.log("Service worker controller changed");
        registerSW();
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, registration, error };
}
