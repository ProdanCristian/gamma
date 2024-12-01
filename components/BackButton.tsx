"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useScrollDirection } from "./hooks/useScrollDirection";

export default function BackButton() {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname.split("/").length <= 2;
  const [canGoBack, setCanGoBack] = useState(false);
  const showButton = useScrollDirection();

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  const handleBack = () => {
    if (canGoBack) {
      window.history.back();
    }
  };

  if (isHomePage || !canGoBack) {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`fixed top-[32px] left-4 z-[9999] bg-accent p-1 rounded-full shadow-lg transition-transform duration-300 ${
        showButton ? "hidden" : "block"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
