"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import User from "./User";
import LangSwitcher from "@/components/Header/LangSwitcher";

export default function MobileHeader() {
  const { theme, systemTheme } = useTheme();
  const [blackLogo, setBlackLogo] = useState(null);
  const [lightLogo, setLightLogo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setShowModal(false);
  }, [pathname]);

  const fetchLogoData = async () => {
    try {
      const response = await fetch("/api/marketingDesign");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const logoData = await response.json();
      if (logoData.success && logoData.data.length > 0) {
        const marketingData = logoData.data[0];
        setBlackLogo(marketingData.Logo_Black[0]);
        setLightLogo(marketingData.Logo[0]);

        localStorage.setItem("blackLogo", marketingData.Logo_Black[0]);
        localStorage.setItem("lightLogo", marketingData.Logo[0]);
      } else {
        console.warn("Logo data not successful or empty:", logoData);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };

  useEffect(() => {
    const storedBlackLogo = localStorage.getItem("blackLogo");
    const storedLightLogo = localStorage.getItem("lightLogo");

    if (storedBlackLogo && storedLightLogo) {
      setBlackLogo(storedBlackLogo);
      setLightLogo(storedLightLogo);
    } else {
      fetchLogoData();
    }
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="md:hidden flex justify-between items-center w-full h-[77px] border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-charade-950/80 backdrop-filter backdrop-blur-lg px-3 fixed top-0 z-20">
      <Link href="/">
        <div className="h-12 w-[130px] ml-2">
          {blackLogo && lightLogo && (
            <img
              src={currentTheme === "dark" ? lightLogo : blackLogo}
              alt="Gamma"
              className="h-full w-full"
            />
          )}
        </div>
      </Link>
      <div className="flex items-center gap-4 justify-center">
        <LangSwitcher />
        <User />
        <ModeToggle />
      </div>
    </div>
  );
}
