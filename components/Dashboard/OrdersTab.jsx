import React from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";

const OrdersTab = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations();

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

  if (error) {
    toast({
      title: t("Order.error"),
      description: t("Order.failed_to_load"),
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4">
      {!orders ? (
        <p>{t("Order.no_orders_found")}</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="p-4 dark:bg-[#4A4B59] rounded-lg bg-white shadow-none"
          >
            <div className="flex items-start gap-4">
              {order.Imagine_Principala && (
                <div className="relative w-24 h-24">
                  <Image
                    src={order.Imagine_Principala}
                    alt={order.Nume_Produs_RO}
                    width={96}
                    height={96}
                    className="object-cover rounded-md"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">
                    {order.Nume_Produs_RO ||
                      t("Order.product_name_not_available")}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
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
                    {t("Order.total")}: {order.Total} {t("Order.currency")}
                  </p>
                  <p>
                    {t("Order.delivery_price")}: {order.Pret_Livrare}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersTab;
