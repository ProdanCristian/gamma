"use client";

import { useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useTranslations } from "next-intl";
import SearchModal from "./SearchModal";

export default function SearchComponent() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const t = useTranslations("search");

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <div>
      <div
        className="flex items-center justify-center bg-white/10 rounded-xl px-4 py-3 cursor-pointer w-[300px] lg:w-[400px] transition-colors hover:bg-white/20"
        onClick={toggleModal}
      >
        <PiMagnifyingGlass size={25} className="text-white/50 mr-2" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="bg-transparent outline-none placeholder-white/50 w-full"
          readOnly
        />
      </div>
      <SearchModal isOpen={isModalVisible} onClose={toggleModal} />
    </div>
  );
}
