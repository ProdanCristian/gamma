"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiPhone,
  PiMagnifyingGlass,
  PiDotsNineBold,
  PiList,
  PiHeart,
} from "react-icons/pi";
import CategoryList from "./CategoryList";
import SearchModal from "@/components/Header/SearchModal";
import VerticalMenu from "@/components/VerticalMenu";
import { usePathname } from "next/navigation";

const MobileNavBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dragHeight, setDragHeight] = useState(0);

  const t = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();

  // Reset all states when pathname changes
  useEffect(() => {
    setIsExpanded(false);
    setIsListOpen(false);
    setIsModalVisible(false);
    setDragHeight(0);
  }, [pathname]);

  const toggleModal = () => setIsModalVisible(!isModalVisible);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleList = () => setIsListOpen(!isListOpen);
  const closeSidebar = () => setIsListOpen(false);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 50) {
      setIsExpanded(false);
      setDragHeight(0);
    }
  };

  const handleDrag = (event: any, info: any) => {
    setDragHeight(info.offset.y);
  };

  return (
    <div>
      {/* Background Overlay */}
      {(isListOpen || isModalVisible || isExpanded) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[8]"
          onClick={() => {
            setIsListOpen(false);
            setIsModalVisible(false);
            setIsExpanded(false);
            setDragHeight(0);
          }}
        />
      )}

      {/* Search Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-full max-w-lg mx-4">
            <SearchModal isOpen={isModalVisible} onClose={toggleModal} />
          </div>
        </div>
      )}

      {/* Bottom Bar with Draggable Content */}
      <AnimatePresence>
        <motion.div
          initial={false}
          className={`
            md:hidden z-10 flex overflow-hidden justify-center fixed bottom-0 w-full 
            bg-charade-900 backdrop-blur-sm rounded-t-3xl transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]
          `}
          animate={{
            height: isExpanded ? `calc(85vh - ${dragHeight}px)` : "70px",
          }}
          transition={{ type: "spring", damping: 20 }}
        >
          {isExpanded && (
            <motion.div
              className="absolute w-full h-full"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              dragDirectionLock
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
            >
              {/* Drag Handle */}
              <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-300 rounded-full cursor-grab" />

              {/* Category List */}
              <div
                className="absolute justify-center items-start top-0 left-0 w-full z-10 
                text-white dark:bg-charade-900 overflow-auto p-8"
                style={{ height: "100%" }}
              >
                <div className="mt-6">
                  <CategoryList locale={locale} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Bar Icons */}
          <div
            className={`flex items-end justify-between w-[90%] px-5 h-full pb-5 ${
              isExpanded ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
          >
            <PiPhone size={33} className="text-white" />

            <PiMagnifyingGlass
              size={33}
              className="text-white cursor-pointer"
              onClick={toggleModal}
            />

            <PiDotsNineBold
              size={isExpanded ? 39 : 33}
              className={`
                transition-transform duration-300
                ${isExpanded ? "text-white scale-130" : "text-accent"}
              `}
              onClick={toggleExpand}
            />

            <PiList
              size={33}
              className="text-white cursor-pointer"
              onClick={toggleList}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Side Menu */}
      <div
        className={`
          md:hidden z-[8] fixed bottom-0 w-[60%] h-[100vh] bg-white dark:bg-charade-950 
          right-0 border-l border-accent flex-auto flex flex-col items-center justify-start 
          transition-transform duration-300 ease-in-out
          ${isListOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="mt-20 p-4 flex flex-col gap-6 justify-start h-full">
          <div className="w-full flex justify-end h-[20%]" />
          <VerticalMenu />
          <Link href={`/${locale}/wishlist`} onClick={closeSidebar}>
            <div className="flex items-center gap-1 mt-10">
              <p>{t("Wishlist")}</p>
              <PiHeart size={24} className="mr-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNavBar;
