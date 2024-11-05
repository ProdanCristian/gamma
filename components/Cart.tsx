"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/useCart";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  PiMinus,
  PiPlus,
  PiTrash,
  PiTruck,
  PiSealPercentFill,
} from "react-icons/pi";
import { useCallback, useMemo, useEffect, useState } from "react";
import { DeliveryZone, DELIVERY_RULES } from "@/lib/store/useCart";

export default function Cart() {
  const t = useTranslations("Cart");
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const deliveryZone = useCartStore((state) => state.deliveryZone);
  const setDeliveryZone = useCartStore((state) => state.setDeliveryZone);

  // Calculate totals and discounts
  const { total, regularTotal, totalDiscount, discountPercentage } =
    useMemo(() => {
      if (!mounted)
        return {
          total: 0,
          regularTotal: 0,
          totalDiscount: 0,
          discountPercentage: 0,
        };

      const calculatedTotals = items.reduce(
        (acc, item) => {
          const regularPrice = item.price * item.quantity; // Calculate regular price
          const discountedPrice =
            (item.discountPrice || item.price) * item.quantity; // Calculate discounted price

          return {
            total: acc.total + discountedPrice,
            regularTotal: acc.regularTotal + regularPrice,
            totalDiscount: acc.totalDiscount + (regularPrice - discountedPrice),
          };
        },
        { total: 0, regularTotal: 0, totalDiscount: 0 }
      );

      const percentage =
        calculatedTotals.regularTotal > 0
          ? Math.round(
              (calculatedTotals.totalDiscount / calculatedTotals.regularTotal) *
                100
            )
          : 0;

      return {
        ...calculatedTotals,
        discountPercentage: percentage,
      };
    }, [items, mounted]);

  // Delivery rules and calculations
  const currentDeliveryRules = DELIVERY_RULES[deliveryZone];
  const remainingForFreeDelivery = Math.max(
    0,
    currentDeliveryRules.freeDeliveryThreshold - total
  );
  const progressPercentage = Math.min(
    100,
    (total / currentDeliveryRules.freeDeliveryThreshold) * 100
  );

  // Effect to manage component mount state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle quantity changes for items in the cart
  const handleQuantityChange = useCallback(
    (itemId: number, currentQuantity: number, change: number) => {
      const newQuantity = currentQuantity + change; // Calculate new quantity
      const item = items.find((i) => i.id === itemId);
      if (item && newQuantity >= 1 && newQuantity <= item.stock) {
        updateQuantity(itemId, newQuantity); // Update quantity if valid
      }
    },
    [items, updateQuantity]
  );

  // Prevent rendering if not mounted
  if (!mounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] border-none dark:bg-charade-900 flex flex-col"
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{t("title")}</SheetTitle>
          <div className="mt-4">
            {/* Delivery zone selection */}
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">
                {t("delivery_zone")}:
              </label>
              <select
                value={deliveryZone}
                onChange={(e) =>
                  setDeliveryZone(e.target.value as DeliveryZone)
                }
                className="bg-gray-50 dark:bg-charade-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="in_city">{t("in_city_Chisinau")}</option>
                <option value="outside_city">
                  {t("outside_city_Chisinau")}
                </option>
              </select>
            </div>
            {total > 0 && (
              <div className="space-y-3">
                {/* Free delivery progress indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <PiTruck className="text-accent" size={20} />
                  {remainingForFreeDelivery > 0 ? (
                    <span>
                      {t("add_more_for_free_delivery", {
                        amount: remainingForFreeDelivery.toFixed(2),
                      })}
                    </span>
                  ) : (
                    <span className="text-green-500">
                      {t("free_delivery_eligible")}
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-4">
            {/* Cart items list */}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b dark:border-charade-700 pb-4"
              >
                <div className="relative w-20 h-20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {/* Quantity control buttons */}
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, -1)
                          }
                          className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800"
                        >
                          <PiMinus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, 1)
                          }
                          className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800"
                        >
                          <PiPlus size={16} />
                        </button>
                      </div>
                      {item.quantity >= item.stock && (
                        <span className="text-sm text-red-500">
                          {item.stock}{" "}
                          {item.stock === 1 ? t("unit") : t("units")}{" "}
                          {t("in_stock")}
                        </span>
                      )}
                    </div>
                    {/* Remove item button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <PiTrash size={18} />
                    </button>
                  </div>
                  <div className="mt-2">
                    {/* Price display */}
                    {item.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.discountPrice} {t("currency")}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {item.price} {t("currency")}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {item.price} {t("currency")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 rounded-lg  space-y-3">
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <PiSealPercentFill className="text-red-500" size={18} />
                <span className="font-medium">{t("total_discount")}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-red-500 font-bold">
                  -{discountPercentage}%
                </span>
                <span className="text-red-500">
                  -{totalDiscount.toFixed(2)} {t("currency")}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-charade-950 p-2.5 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {t("subtotal")}:
              </span>
              <div className="text-right">
                {totalDiscount > 0 && (
                  <span className="text-xs text-gray-500 line-through block">
                    {regularTotal.toFixed(2)} {t("currency")}
                  </span>
                )}
                <span className="font-bold text-base">
                  {total.toFixed(2)} {t("currency")}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {/* Delivery cost display */}
              {remainingForFreeDelivery > 0 ? (
                <span>
                  {t("delivery_cost")}: {currentDeliveryRules.cost}{" "}
                  {t("currency")}
                </span>
              ) : (
                <span className="text-green-500">{t("free_delivery")}</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
              <span className="font-medium text-sm">
                {t("total_with_delivery")}:
              </span>
              <span className="font-bold text-base">
                {(
                  total +
                  (remainingForFreeDelivery > 0 ? currentDeliveryRules.cost : 0)
                ).toFixed(2)}{" "}
                {t("currency")}
              </span>
            </div>
          </div>

          {/* Finalize order button */}
          <Button
            className="w-full bg-accent hover:bg-charade-900 hover:text-white text-charade-900 dark:hover:bg-gray-100 dark:hover:text-charade-900 h-10 text-sm font-semibold"
            disabled={items.length === 0}
          >
            {t("finalize_order")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
