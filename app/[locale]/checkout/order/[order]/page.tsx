"use client";

import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { PiSealPercentFill } from "react-icons/pi";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { IoArrowBack } from "react-icons/io5";

interface OrderPageProps {
  params: {
    order: string;
    locale: string;
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  const t = useTranslations("Checkout");
  const orderData = useOrderStore((state) => state.orderData);
  const router = useRouter();

  if (!orderData) {
    notFound();
  }

  const hasDiscount =
    orderData.Pret_Redus &&
    parseFloat(orderData.Pret_Redus) < parseFloat(orderData.Pret_Standard);

  const getDiscountPercentage = () => {
    if (!hasDiscount) return 0;
    return Math.round(
      ((parseFloat(orderData.Pret_Standard) -
        parseFloat(orderData.Pret_Redus!)) /
        parseFloat(orderData.Pret_Standard)) *
        100
    );
  };

  const productPrice = hasDiscount
    ? orderData.Pret_Redus!
    : orderData.Pret_Standard;
  const subtotal = parseFloat(productPrice) * orderData.Cantitate;
  const deliveryPrice =
    orderData.Pret_Livrare === "Gratis"
      ? 0
      : parseFloat(orderData.Pret_Livrare);
  const total = subtotal + deliveryPrice;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="py-8 px-4 sm:px-6 lg:px-8 w-full md:w-[80%] xl:w-[70%] rounded-lg overflow-hidden border p-4 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col  gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <IoArrowBack className="text-xl" />
            {t("go_back")}
          </button>
          <h1 className="text-2xl font-bold">{t("order_confirmation")}</h1>
        </div>

        <div className="border-b dark:border-charade-700 pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">{t("order_details")}</h2>
          <p>
            {t("order_number")}: {orderData.id}
          </p>
        </div>

        <div className="border-b dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {t("customer_details")}
          </h2>
          <p>
            {t("name")}: {orderData.Nume_Prenume}
          </p>
          <p>
            {t("phone")}: +373 {orderData.Numar_telefon}
          </p>
        </div>

        <div className="border-b dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">{t("product_details")}</h2>
          <div className="flex items-center gap-4">
            <Image
              src={orderData.Imagine_Principala}
              alt={`${t("product_image")} - ${orderData.Nume_Produs}`}
              width={100}
              height={100}
              className="rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {orderData.Nume_Produs}
              </h3>
              <p>
                {t("quantity")}: {orderData.Cantitate}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold">
                  {productPrice} {t("currency")}
                </span>
                {hasDiscount && (
                  <>
                    <s className="text-gray-500">
                      {orderData.Pret_Standard} {t("currency")}
                    </s>
                    <div className="flex items-center">
                      <span className="text-red-500 mr-1">
                        -{getDiscountPercentage()}%
                      </span>
                      <PiSealPercentFill className="text-red-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t("subtotal")}:</span>
            <span>
              {subtotal.toFixed(2)} {t("currency")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("delivery")}:</span>
            <span>
              {orderData.Pret_Livrare === "Gratis"
                ? t("free_delivery")
                : `${orderData.Pret_Livrare} ${t("currency")}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
            <span>{t("total")}:</span>
            <span>
              {total.toFixed(2)} {t("currency")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
