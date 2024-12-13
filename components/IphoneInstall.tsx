"use client";

import React, { useState } from "react";
import { IoShareOutline } from "react-icons/io5";
import { IoAddOutline } from "react-icons/io5";
import { PiArrowFatLinesDown } from "react-icons/pi";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const IphoneInstall = ({ onClose }: { onClose?: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations();

  const handleSwipeEnd = (event: any, info: any) => {
    const SWIPE_THRESHOLD = 100;
    if (info.velocity.y > 0 && info.offset.y > SWIPE_THRESHOLD) {
      setIsVisible(false);
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 w-full z-[1000]"
          initial={false}
          animate={{ height: "600px" }}
          exit={{ height: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.div
            className="bg-accent w-full h-full rounded-t-3xl p-4  flex flex-col"
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
              <h2 className="text-xl sm:text-2xl font-bold text-center text-black">
                {t("How_to_install")}
              </h2>
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
                  src="/Iphones.png"
                  alt="app-store"
                  width={120}
                  height={120}
                  className="w-[130px] sm:w-[180px]"
                />
                <div className="flex flex-col space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-base sm:text-lg bg-red-500 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white">
                      1
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 bg-charade-800 rounded-lg p-2 text-white justify-center">
                      <IoShareOutline size={24} className="sm:text-[30px]" />
                      <p className="text-base sm:text-lg">
                        {t("Tap_the_Share_button")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-base sm:text-lg bg-red-500 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white">
                      2
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 bg-charade-800 rounded-lg p-2 text-white justify-center">
                      <IoAddOutline
                        size={24}
                        className="border rounded-lg sm:text-[30px]"
                      />
                      <p className="text-base sm:text-lg">
                        {t("Select_Add_to_Home_Screen")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2">
                <PiArrowFatLinesDown
                  size={40}
                  className="animate-bounce text-red-500"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IphoneInstall;
