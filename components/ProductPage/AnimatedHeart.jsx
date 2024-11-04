"use client";

import { PiStarFill } from "react-icons/pi";
import { motion } from "framer-motion";

export default function AnimatedHeart() {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <PiStarFill className="text-xl" />
    </motion.div>
  );
}
