"use client";

import React, { useState, useEffect } from "react";
import { PiLaptopThin } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

interface DesktopInstallProps {
  onInstallClick: () => void;
}

const DesktopInstall = ({ onInstallClick }: DesktopInstallProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations();

  const handleClose = () => {
    setIsVisible(false);
    Cookies.set("desktopPromptClosed", "true", { expires: 365 });
  };

  const handleInstallClick = () => {
    onInstallClick();
    setIsVisible(false);
  };

  useEffect(() => {
    const hasClosedPrompt = Cookies.get("desktopPromptClosed");
    if (hasClosedPrompt) {
      setIsVisible(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-4 bottom-4 z-[1000] max-w-[300px]"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="bg-accent rounded-xl p-4 shadow-lg  ">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-lg font-bold text-black">
                {t("Install_our_app")}
              </h1>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>
            <h2 className=" -mt-3 mb-3  text-black">{t("for")}</h2>
            <h2 className="text-sm text-center bg-red-500 p-2 rounded-lg text-white mb-4">
              {t("get_10_off_cupon")}
            </h2>

            <div
              className="flex w-full bg-charade-950 p-3 rounded-lg border border-gray-500 items-center justify-center gap-2 cursor-pointer hover:bg-charade-900 transition-colors"
              onClick={handleInstallClick}
            >
              <PiLaptopThin className="h-6 w-6 text-white" />
              <span className="text-white text-sm">
                {t("footer.install_desktop_app")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DesktopInstall;
