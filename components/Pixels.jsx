"use client";

import { useEffect } from "react";

export default function Pixels({ pixelData }) {
  useEffect(() => {
    if (pixelData) {
      // Create a temporary container to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(pixelData, "text/html");

      // Wait for head to be ready
      const appendToHead = () => {
        // Get all scripts and insert them
        const scripts = doc.getElementsByTagName("script");
        Array.from(scripts).forEach((scriptElement) => {
          const script = document.createElement("script");
          script.innerHTML = scriptElement.innerHTML;
          script.defer = true; // Add defer attribute
          script.async = true; // Add async attribute
          document.head.appendChild(script); // Append at the end of head
        });

        // Get all noscripts and insert them
        const noscripts = doc.getElementsByTagName("noscript");
        Array.from(noscripts).forEach((noscriptElement) => {
          const noscript = document.createElement("noscript");
          noscript.innerHTML = noscriptElement.innerHTML;
          document.head.appendChild(noscript); // Append at the end of head
        });
      };

      // Execute after a small delay to ensure head is ready
      setTimeout(appendToHead, 0);
    }
  }, [pixelData]);

  return null;
}
