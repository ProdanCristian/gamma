"use client";

import { useState, useRef, useEffect } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { useTranslations } from "next-intl";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const t = useTranslations("search");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      searchInputRef.current?.focus();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center h-screen">
      <div
        ref={modalRef}
        className="bg-white w-[85%] min-w-[60%] dark:bg-charade-900 max-w-4xl rounded-lg shadow-lg py-10 p-6 md:p-10 relative"
      >
        <div className="flex items-center mb-6 w-full justify-between">
          <PiMagnifyingGlass
            size={24}
            className="text-primary dark:text-white mr-2"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-transparent outline-none text-primary dark:text-white text-xl placeholder-primary/50 dark:placeholder-white/50"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
          >
            <PiX size={24} />
          </button>
        </div>
        <div className="text-primary dark:text-white">
          <p>
            {t("searchResults")}: {searchTerm}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
