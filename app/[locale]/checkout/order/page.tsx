"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface OrderProduct {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

interface OrderConfirmationData {
  products: OrderProduct[];
  deliveryCost: number;
  total: number;
  couponDiscount: number;
  address: string;
  orderIds: number[];
  paymentMethod: string;
}

export default function OrderPage() {
  const t = useTranslations("Order");
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();

  const [orderData] = useState<OrderConfirmationData | null>(() => {
    if (typeof window !== "undefined") {
      const savedOrderData = localStorage.getItem("orderConfirmation");
      if (savedOrderData) {
        localStorage.removeItem("orderConfirmation");
        return JSON.parse(savedOrderData);
      }
    }
    return null;
  });

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);

    if (orderData) {
      const sendPurchaseEvent = async () => {
        try {
          let phoneNumber = "";
          let firstName = "";
          let lastName = "";

          if (session?.user) {
            // For logged-in users, fetch phone from profile
            try {
              const response = await fetch("/api/auth/profile");
              if (response.ok) {
                const data = await response.json();
                phoneNumber = data.user.Numar_Telefon || "";
                firstName =
                  data.user.Prenume || session.user.name?.split(" ")[0] || "";
                lastName =
                  data.user.Nume ||
                  session.user.name?.split(" ").slice(1).join(" ") ||
                  "";
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          } else {
            // For non-logged-in users, get data from localStorage
            const customerData = JSON.parse(
              localStorage.getItem("customerData") || "{}"
            );
            phoneNumber = customerData.phone || "";
            firstName = customerData.firstName || "";
            lastName = customerData.lastName || "";
          }

          await fetch("/api/facebook-event", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: "Purchase",
              data: {
                firstName,
                lastName,
                phone: phoneNumber,
                email: session?.user?.email || "",
                clientUserAgent: navigator.userAgent,
                currency: "MDL",
                value: orderData.total,
                city: orderData.address?.split(",")[0] || "",
                state: "",
                zipCode: "2000",
              },
              sourceUrl: window.location.href,
            }),
          });
        } catch (error) {
          console.error("Error sending purchase event:", error);
        }
      };

      sendPurchaseEvent();
    }
  }, [orderData, session]);

  const [mounted, setMounted] = useState(false);

  if (!mounted) return null;

  if (!orderData) {
    return (
      <div className="max-w-[1250px] w-[90vw] mx-auto my-10">
        <p className="text-center">{t("no_order_data")}</p>
      </div>
    );
  }

  const subtotal = orderData.products.reduce((sum, product) => {
    const price = product.discountPrice || product.price;
    return sum + price * product.quantity;
  }, 0);

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto my-10">
      <h1 className="text-2xl font-bold mb-6">{t("order_confirmation")}</h1>

      <div className="bg-white dark:bg-charade-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("order_details")}</h2>

        <div className="space-y-4">
          {orderData.products.map((product) => (
            <div key={product.id} className="flex items-center gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("quantity")}: {product.quantity}
                </p>
                <div className="mt-1">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {product.discountPrice} {t("currency")}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.price} {t("currency")}
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {product.price} {t("currency")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t dark:border-gray-700 pt-4">
            <div className="flex justify-between mb-2">
              <span>{t("subtotal")}:</span>
              <span>
                {subtotal.toFixed(2)} {t("currency")}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t("delivery")}:</span>
              <span>
                {orderData.deliveryCost === 0 ? (
                  <span className="text-green-500">{t("free")}</span>
                ) : (
                  `${orderData.deliveryCost} ${t("currency")}`
                )}
              </span>
            </div>
            {orderData.couponDiscount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>{t("coupon_discount")}:</span>
                <span>-{orderData.couponDiscount}%</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-700">
              <span>{t("total")}:</span>
              <span>
                {orderData.total.toFixed(2)} {t("currency")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {orderData.address && (
        <div className="bg-white dark:bg-charade-900 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("delivery_address")}
          </h2>
          <p>{orderData.address}</p>
        </div>
      )}

      <div className="bg-white dark:bg-charade-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("payment_method")}</h2>
        <p>{orderData.paymentMethod}</p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6">
        <p className="text-green-700 dark:text-green-400">
          {t("order_success_message")}
        </p>
      </div>

      {session && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.push(`/${locale}/dashboard?tab=orders`)}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {t("view_orders_in_dashboard")}
          </Button>
        </div>
      )}
    </div>
  );
}
