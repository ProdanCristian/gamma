import {
  PiTruckLight,
  PiHandshakeThin,
  PiCreditCardLight,
  PiMessengerLogoLight,
} from "react-icons/pi";
import { useTranslations } from "next-intl";

export default function BenefitsSection() {
  const t = useTranslations("benefits");

  const benefits = [
    {
      icon: PiTruckLight,
      title: t("free_delivery_title"),
      description: t("free_delivery_description"),
    },
    {
      icon: PiHandshakeThin,
      title: t("satisfaction_title"),
      description: t("satisfaction_description"),
    },
    {
      icon: PiCreditCardLight,
      title: t("secure_payment_title"),
      description: t("secure_payment_description"),
    },
    {
      icon: PiMessengerLogoLight,
      title: t("support_title"),
      description: t("support_description"),
    },
  ];

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full my-10">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-green-100 min-h-[90px] items-center rounded-xl flex justify-center p-4 gap-4"
          >
            <div className="flex gap-4 items-center w-[80%] md:w-full">
              <div className="flex-shrink-0 flex items-center justify-center p-2 w-12 h-12 bg-accent rounded-full">
                <benefit.icon className="text-white" size={30} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold dark:text-charade-950 text-charade-900 text-left">
                  {benefit.title}
                </h3>
                <p className="text-[13px] text-gray-500 text-left">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
