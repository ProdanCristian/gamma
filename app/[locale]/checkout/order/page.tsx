"use client";

import { useTranslations } from "next-intl";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const t = useTranslations("Order");
  const orderData = useOrderStore((state) => state.orderData);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!orderData) {
      router.push("/");
    }
  }, [orderData, router]);

  if (!isClient) return null;
  if (!orderData) return null;

  const productPrice = orderData.Pret_Redus || orderData.Pret_Standard;
  const subtotal = parseFloat(productPrice) * orderData.Cantitate;
  const deliveryPrice =
    orderData.Pret_Livrare === "Gratis"
      ? 0
      : parseFloat(orderData.Pret_Livrare);
  const total = subtotal + deliveryPrice;

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto my-10">
      <h1 className="text-2xl font-bold mb-6">{t("order_confirmation")}</h1>

      <div className="bg-white dark:bg-charade-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("order_details")}</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {orderData.Imagine_Principala && (
              <img
                src={orderData.Imagine_Principala}
                alt={orderData.Nume_Produs}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-medium">{orderData.Nume_Produs}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("quantity")}: {orderData.Cantitate}
              </p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <div className="flex justify-between mb-2">
              <span>{t("subtotal")}:</span>
              <span>{subtotal.toFixed(2)} MDL</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t("delivery")}:</span>
              <span>{orderData.Pret_Livrare}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{t("total")}:</span>
              <span>{total.toFixed(2)} MDL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6">
        <p className="text-green-700 dark:text-green-400">
          {t("order_success_message")}
        </p>
      </div>
    </div>
  );
}
