export function register() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const swUrl = "/sw.js";
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log("ServiceWorker registration successful");

        // Check for existing subscription
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // Get VAPID public key from environment
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidPublicKey) {
            throw new Error("VAPID public key not found");
          }

          // Convert VAPID key to Uint8Array
          const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

          // Subscribe to push notifications
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });

          // Send subscription to backend
          await fetch("/api/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubscription),
          });

          console.log("Push notification subscription successful");
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("New content is available; please refresh.");
              } else {
                console.log("Content is cached for offline use.");
              }
            }
          };
        });
      } catch (error) {
        console.error("Error during service worker registration:", error);
      }
    });
  }
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

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
