"use client";

import { useEffect } from "react";

// Prevent Facebook Pixel debug WebSocket connection on localhost
if (typeof window !== "undefined") {
  // Mock WebSocket for localhost debugging
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url, ...args) {
    if (url.includes("localhost:12387")) {
      return {
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
    return new OriginalWebSocket(url, ...args);
  };

  // Suppress console errors for WebSocket
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || "";
    if (
      errorMessage.includes("WebSocket") ||
      errorMessage.includes("ws://localhost")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export default function Pixels({ pixelData }) {
  useEffect(() => {
    if (!pixelData) return;

    const appendToHead = () => {
      // Create a temporary container for parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(pixelData, "text/html");

      // Function to safely append scripts
      const appendScript = (scriptElement) => {
        const script = document.createElement("script");

        // Copy all attributes
        Array.from(scriptElement.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });

        // Handle src scripts vs inline scripts
        if (scriptElement.src) {
          script.src = scriptElement.src;
        } else {
          script.innerHTML = scriptElement.innerHTML;
        }

        script.async = true;
        script.defer = true;

        // Error handling
        script.onerror = (error) => {
          if (
            !error?.message?.includes("WebSocket") &&
            !error?.message?.includes("ws://localhost")
          ) {
            console.warn("Script loading error:", error);
          }
        };

        // Append to head
        document.head.appendChild(script);
      };

      // Handle all script tags
      const scripts = doc.getElementsByTagName("script");
      Array.from(scripts).forEach(appendScript);

      // Handle all noscript tags
      const noscripts = doc.getElementsByTagName("noscript");
      Array.from(noscripts).forEach((noscriptElement) => {
        const noscript = document.createElement("noscript");
        // Copy all attributes
        Array.from(noscriptElement.attributes).forEach((attr) => {
          noscript.setAttribute(attr.name, attr.value);
        });
        noscript.innerHTML = noscriptElement.innerHTML;
        document.body.appendChild(noscript);
      });
    };

    // Initialize when document is ready
    if (document.readyState === "complete") {
      appendToHead();
    } else {
      window.addEventListener("load", appendToHead);
      return () => window.removeEventListener("load", appendToHead);
    }
  }, [pixelData]);

  return null;
}
