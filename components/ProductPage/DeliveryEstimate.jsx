"use client";
import { motion } from "framer-motion";
import { PiTruck } from "react-icons/pi";

function calculateDeliveryDates() {
  const today = new Date();
  const deliveryDates = [];
  let currentDate = new Date(today);

  while (deliveryDates.length < 3) {
    currentDate.setDate(currentDate.getDate() + 1);

    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      deliveryDates.push(new Date(currentDate));
    }
  }

  return {
    earliest: deliveryDates[0],
    latest: deliveryDates[2],
  };
}

export default function DeliveryEstimate({ locale }) {
  const { earliest, latest } = calculateDeliveryDates();

  const formatDate = (date) => {
    return date.toLocaleDateString(locale === "ru" ? "ru-RU" : "ro-RO", {
      day: "numeric",
      month: "long",
    });
  };

  const deliveryText =
    locale === "ru"
      ? `Ожидаемая доставка: ${formatDate(earliest)} - ${formatDate(
          latest
        )} (1-3 рабочих дня)`
      : `Livrare estimată: ${formatDate(earliest)} - ${formatDate(
          latest
        )} (1-3 zile lucrătoare)`;

  return (
    <div className="flex items-center gap-3 bg-green-50 dark:bg-charade-800 p-4 rounded-lg my-4">
      <motion.div
        initial={{ x: -10 }}
        animate={{ x: 10 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <PiTruck size={24} className="text-green-600 dark:text-green-400" />
      </motion.div>
      <p className="text-green-700 dark:text-green-300 font-medium">
        {deliveryText}
      </p>
    </div>
  );
}
