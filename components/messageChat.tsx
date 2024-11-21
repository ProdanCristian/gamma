"use client";

import { useState, useEffect, useRef } from "react";
import { BsMessenger } from "react-icons/bs";
import { FaInstagram, FaTelegram, FaViber } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

const MessageChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const socialLinks = [
    {
      name: "Instagram",
      icon: <FaInstagram className="w-6 h-6" />,
      url: "https://ig.me/m/gamma.moldova",
      color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
    },
    {
      name: "Facebook",
      icon: <BsMessenger className="w-6 h-6" />,
      url: "https://m.me/gammamarketplace",
      color: "bg-blue-500",
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="w-6 h-6" />,
      url: "https://t.me/gamma_md",
      color: "bg-sky-500",
    },
    {
      name: "Viber",
      icon: <FaViber className="w-6 h-6" />,
      url: "viber://chat?number=%2B37369777222",
      color: "bg-purple-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-7 right-7 z-40"
      ref={containerRef}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="absolute bottom-16 right-0 mb-2 space-y-2"
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400 },
                }}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2 text-white rounded-lg shadow-lg backdrop-blur-sm ${link.color}`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {link.icon}
                </motion.div>
                <span className="text-sm font-medium">{link.name}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(var(--accent) / 0.3)",
            "0 0 0 20px rgba(var(--accent) / 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-full"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          className="p-3 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <IoMdClose className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <IoChatbubbleEllipsesOutline className="w-8 h-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MessageChat;
