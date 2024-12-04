"use client";

import React, { useState, useEffect } from "react";
import { PiArrowFatLinesDown } from "react-icons/pi";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AndroidInstallProps {
  onInstallClick: () => void;
}

const AndroidInstall = ({ onInstallClick }: AndroidInstallProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleSwipeEnd = (event: any, info: any) => {
    const SWIPE_THRESHOLD = 100;
    if (info.velocity.y > 0 && info.offset.y > SWIPE_THRESHOLD) {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 w-full z-[1000]"
          initial={false}
          animate={{ height: "500px" }}
          exit={{ height: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.div
            className="bg-accent w-full h-full rounded-t-3xl p-4 space-y-1 flex flex-col"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragDirectionLock
            onDragEnd={handleSwipeEnd}
            whileDrag={{ scale: 1 }}
          >
            <div className="flex justify-center items-center w-full">
              <div className="relative w-16 h-1.5 bg-charade-800 rounded-full cursor-grab mb-4" />
            </div>

            <div className="flex flex-col items-center justify-between h-full relative pb-12">
              <div className="flex flex-col items-center space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-black">
                  {t("Install_our_app")}
                </h1>
                <h2 className="text-base sm:text-lg text-center text-black">
                  {t("for")}
                </h2>
                <h2 className="text-lg sm:text-xl text-center bg-red-500 p-2 rounded-lg text-white">
                  {t("get_10_off_cupon")}
                </h2>
                <Image
                  src="/Android-install.png"
                  alt="android-install"
                  width={160}
                  height={160}
                  className="w-[160px] sm:w-[200px]"
                />
                <div className="flex flex-col space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="flex w-full bg-charade-950 p-3 rounded-lg border border-gray-500 items-center justify-center gap-2 cursor-pointer hover:bg-charade-900 transition-colors"
                      onClick={onInstallClick}
                    >
                      <img
                        src="/Playstore.svg"
                        alt="Play Store"
                        className="h-7"
                        loading="lazy"
                      />
                      <span className="text-white text-base sm:text-lg">
                        {t("footer.install_android_app")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AndroidInstall;
