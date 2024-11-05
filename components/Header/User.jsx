"use client";

import { PiUser } from "react-icons/pi";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

export default function User() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-normal">
      <PiUser
        size={26}
        className="text-charade-950 dark:text-white md:text-white  mr-4 cursor-pointer hover:text-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div>
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-20 right-2 z-50">
            <AuthModal />
          </div>
        </div>
      )}
    </div>
  );
}
