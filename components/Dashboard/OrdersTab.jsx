"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import useSWR from "swr";
import { PiEye } from "react-icons/pi";
import slugify from "slugify";

const createSlug = (text) => {
  return slugify(text, {
    replacement: "-",
    lower: true,
    strict: true,
  }).toLowerCase();
};

const OrdersTab = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const translateStatus = (status) => {
    const statusTranslations = {
      "De Confirmat": t("Order.status.pending"),
      Confirmat: t("Order.status.confirmed"),
      Anulata: t("Order.status.cancelled"),
    };
    return statusTranslations[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "De Confirmat":
        return "bg-blue-600";
      case "Confirmat":
        return "bg-green-600";
      case "Anulata":
        return "bg-red-600";
      default:
        return "bg-charade-900";
    }
  };

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }
    return res.json();
  };

  const { data: orders, error } = useSWR(
    session ? "/api/orders/dashBoardOrders" : null,
    fetcher
  );

  const groupedOrders = React.useMemo(() => {
    if (!orders) return {};

    return orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});
  }, [orders]);

  const handleProductClick = (order) => {
    const slug = createSlug(order.Nume_Produs_RO);
    router.push(`/${locale}/product/${slug}_${order.product_id}`);
  };

  if (error) {
    toast({
      title: t("Order.error"),
      description: t("Order.failed_to_load"),
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedOrders).map(([date, dateOrders]) => (
        <div key={date} className="space-y-4">
          <h2 className="font-semibold text-lg">{date}</h2>
          {dateOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 dark:bg-[#4A4B59] rounded-lg bg-white shadow-none"
            >
              <div className="flex items-start gap-4">
                {order.Imagine_Principala && (
                  <div
                    className="relative w-24 h-24 group cursor-pointer border border-gray-200 dark:border-charade-600 rounded-md p-2"
                    onClick={() => handleProductClick(order)}
                  >
                    <Image
                      src={order.Imagine_Principala}
                      alt={order.Nume_Produs_RO}
                      width={96}
                      height={96}
                      className="object-cover rounded-md"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
                      <PiEye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      {(locale === "ro"
                        ? order.Nume_Produs_RO
                        : order.Nume_Produs_RU) ||
                        t("Order.product_name_not_available")}
                    </h3>
                  </div>
                  <div className="mt-2 space-y-1 text-sm relative">
                    <p
                      className={`${getStatusColor(
                        order.Status
                      )} text-white rounded-full w-fit p-1`}
                    >
                      {t("Order.Status")}:{" "}
                      <span className="font-medium">
                        {translateStatus(order.Status)}
                      </span>
                    </p>
                    <p>
                      {t("Order.quantity")}: {order.Cantitate}
                    </p>
                    <p>
                      {t("Order.product_price")}: {order.Pret_Produs}{" "}
                      {t("Order.currency")}
                    </p>
                    <p>
                      {t("Order.delivery_price")}:{" "}
                      {order.Pret_Livrare === "Gratis"
                        ? locale === "ro"
                          ? "Gratis"
                          : "Бесплатно"
                        : order.Pret_Livrare}
                    </p>

                    {order.Cupon_Aplicat && (
                      <p className="text-green-600">
                        {t("Order.coupon_applied")}: {order.Cupon_Aplicat}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {orders && orders.length === 0 && (
        <p className="text-center text-muted-foreground">
          {t("Order.no_orders")}
        </p>
      )}
    </div>
  );
};

export default OrdersTab;
