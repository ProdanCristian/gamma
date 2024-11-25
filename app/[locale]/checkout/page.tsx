"use client";

import React, { useEffect, useState } from "react";
import { useCartStore, DELIVERY_RULES, CartItem } from "@/lib/store/useCart";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { PiSealPercentFill } from "react-icons/pi";
import { AddressTab } from "@/components/Dashboard/AdressTab";
import { LoginForm } from "@/components/auth/LoginForm";
import { CouponSection } from "@/components/Checkout/CouponSection";
import { UserInfoForm } from "@/components/Checkout/UserInfoForm";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import useSWR from "swr";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string;
  phone?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

interface StockData {
  [key: number]: number;
}

const fetcher = async (url: string): Promise<StockData> => {
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data.data as StockData;
};

const CheckoutPage = () => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();
  const params = useParams();

  const [mounted, setMounted] = useState(false);
  const { items, deliveryZone, clearCart, removeItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestName, setGuestName] = useState("");
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponName, setAppliedCouponName] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState(
    params.locale === "ro"
      ? "Plata la livrare"
      : params.locale === "ru"
      ? "Оплата при доставке"
      : "cash_on_delivery"
  );

  const setOrderData = useOrderStore((state) => state.setOrderData);

  const queryString = items.map((item) => `ids=${item.id}`).join("&");

  const { data: stockData, isLoading: isCheckingStock } = useSWR<StockData>(
    items.length > 0 ? `/api/products/stock?${queryString}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 0,
      shouldRetryOnError: false,
    }
  );

  const outOfStockItems = React.useMemo(() => {
    if (!stockData) return [];

    return Object.entries(stockData).reduce<number[]>((acc, [idStr, stock]) => {
      const id = parseInt(idStr, 10);
      const item = items.find((item) => item.id === id);
      if (item && stock < item.quantity) {
        acc.push(id);
      }
      return acc;
    }, []);
  }, [items, stockData]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setMounted(true);
      window.scrollTo(0, 0);

      const sendInitiateCheckoutEvent = async () => {
        try {
          await fetch("/api/facebook-event", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: "InitiateCheckout",
              data: {
                clientUserAgent: navigator.userAgent,
              },
              sourceUrl: window.location.href,
            }),
          });
        } catch (error) {
          console.error("Error sending initiate checkout event:", error);
        }
      };

      sendInitiateCheckoutEvent();
    }
    return () => {
      mounted = false;
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      setGuestName(session.user.name || "");
      setGuestPhone(session.user.phone || "");
      setGuestEmail(session.user.email || "");
    }
  }, [session]);

  const {
    subtotal,
    deliveryCost,
    total,
    discountPercentage,
    couponDiscountAmount,
    finalSubtotal,
  } = React.useMemo(() => {
    if (!mounted)
      return {
        subtotal: 0,
        deliveryCost: 0,
        total: 0,
        discountPercentage: 0,
        couponDiscountAmount: 0,
        finalSubtotal: 0,
      };

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discountedSubtotal = items.reduce(
      (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
      0
    );

    const deliveryRules = DELIVERY_RULES[deliveryZone];
    const deliveryCost =
      discountedSubtotal >= deliveryRules.freeDeliveryThreshold
        ? 0
        : deliveryRules.cost;

    const couponDiscountAmount =
      couponDiscount > 0 ? discountedSubtotal * (couponDiscount / 100) : 0;

    const finalSubtotal = discountedSubtotal - couponDiscountAmount;

    const total = finalSubtotal + deliveryCost;

    const discountPercentage =
      subtotal > 0
        ? Math.round(((subtotal - discountedSubtotal) / subtotal) * 100)
        : 0;

    return {
      subtotal,
      deliveryCost,
      total,
      discountPercentage,
      couponDiscountAmount,
      finalSubtotal,
    };
  }, [items, deliveryZone, mounted, couponDiscount]);

  const handleAddressChange = (newAddress: string) => {
    if (session) {
      setUserAddress(newAddress);
    } else {
      setGuestAddress(newAddress);
    }
  };

  const handleCouponApplied = (discount: number, couponName: string) => {
    setCouponDiscount(discount);
    setAppliedCouponName(couponName);
  };

  const validateFields = () => {
    // Check for empty fields
    if (!guestName.trim()) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.name_required"),
        variant: "destructive",
      });
      return false;
    }

    if (!guestEmail.trim()) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.email_required"),
        variant: "destructive",
      });
      return false;
    }

    if (!guestPhone.trim() || guestPhone.length < 13) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.phone_required"),
        variant: "destructive",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.invalid_email"),
        variant: "destructive",
      });
      return false;
    }

    // Validate phone format more strictly
    const phoneRegex = /^\+373\s\d{8}$/;
    if (!phoneRegex.test(guestPhone)) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.invalid_phone_format"),
        variant: "destructive",
      });
      return false;
    }

    // Check delivery address
    if (!userAddress && !guestAddress) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.address_required"),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateFields()) {
      return;
    }

    // Check if any items are out of stock
    if (stockData) {
      const outOfStockItems = Object.entries(stockData).reduce<number[]>(
        (acc, [idStr, stock]) => {
          const id = parseInt(idStr, 10);
          const item = items.find((item) => item.id === id);
          if (item && stock < item.quantity) {
            acc.push(id);
          }
          return acc;
        },
        []
      );

      if (outOfStockItems.length > 0) {
        outOfStockItems.forEach((itemId) => {
          const item = items.find((i) => i.id === itemId);
          if (item) {
            removeItem(item.id);
          }
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (session?.user?.id) {
        const shouldUpdateProfile =
          session.user.name !== guestName || session.user.phone !== guestPhone;

        if (shouldUpdateProfile) {
          const [firstName, ...lastNameParts] = guestName.trim().split(" ");
          const lastName = lastNameParts.join(" ");

          await fetch("/api/auth/update-profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Nume: lastName || firstName,
              Prenume: lastNameParts.length > 0 ? firstName : "",
              Numar_Telefon: guestPhone
                .replace(/\s/g, "")
                .replace(/^\+373/, "")
                .replace(/^373/, ""),
              Provider: session.user.provider || "credentials",
            }),
          });
        }
      }

      const products = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const formattedPhone = guestPhone
        .replace(/\s/g, "")
        .replace(/^\+373/, "")
        .replace(/^373/, "");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id || null,
          numePrenume: guestName,
          numarTelefon: formattedPhone,
          email: guestEmail,
          products: products,
          deliveryZone,
          isFreeDelivery: deliveryCost === 0,
          address: session ? userAddress : guestAddress,
          couponCode: appliedCouponName,
          couponDiscount: couponDiscount,
          total: total,
          paymentMethod,
          locale: params.locale,
        }),
      });

      if (!response.ok) {
        throw new Error(t("checkout.order_failed"));
      }

      // Update stock for all products
      const stockUpdatePromises = items.map((item) =>
        fetch(`/api/products/stock?productId=${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: item.quantity,
          }),
        })
      );

      try {
        const stockResponses = await Promise.all(stockUpdatePromises);
        const failedUpdates = stockResponses.filter((response) => !response.ok);

        if (failedUpdates.length > 0) {
          console.error(
            `Failed to update stock for ${failedUpdates.length} products`
          );
        }
      } catch (error) {
        console.error("Error updating stock:", error);
      }

      const data = await response.json();

      const orderConfirmationData = {
        products: items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          discountPrice: item.discountPrice,
        })),
        deliveryCost,
        total: total,
        couponDiscount: couponDiscount,
        address: session ? userAddress : guestAddress,
        orderIds: data.orderIds,
        paymentMethod,
      };

      // Set localStorage first
      localStorage.setItem(
        "orderConfirmation",
        JSON.stringify(orderConfirmationData)
      );

      // Set order data
      setOrderData({
        Status: "Pending",
        Nume_Prenume: guestName,
        Numar_telefon: parseInt(formattedPhone),
        Pret_Livrare: deliveryCost.toString(),
        Cantitate: items.reduce((sum, item) => sum + item.quantity, 0),
        Produs_Id: items[0].id,
        Nume_Produs: items[0].name,
        Pret_Standard: items[0].price.toString(),
        Pret_Redus: items[0].discountPrice?.toString() || null,
        Imagine_Principala: items[0].image,
      });

      // Clear cart before navigation
      clearCart();

      // Show success toast
      toast({
        title: t("checkout.success"),
        description: t("checkout.order_placed"),
      });

      // Add a small delay before navigation to ensure localStorage is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to order page
      router.push(`/${params.locale}/checkout/order`);

      // In handlePlaceOrder after successful order creation:
      try {
        await fetch("/api/amoCrm/addLead", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: guestName,
            email: guestEmail,
            phone: formattedPhone,
            products: items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              discountPrice: item.discountPrice,
            })),
            orderIds: data.orderIds,
            total: total,
            address: session ? userAddress : guestAddress,
            deliveryCost: deliveryCost,
          }),
        });
      } catch (error) {
        console.error("Error creating amoCRM lead:", error);
      }
    } catch (error) {
      toast({
        title: t("checkout.error"),
        description:
          error instanceof Error ? error.message : t("checkout.generic_error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => {
    if (!showLoginForm) return null;
    return <LoginForm onClose={() => setShowLoginForm(false)} />;
  };

  const handleRemoveOutOfStock = (item: CartItem) => {
    removeItem(item.id);
  };

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">{t("checkout.empty_cart")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{t("checkout.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {t("checkout.order_summary")}
            </h2>
            {items.map((item) => {
              const isOutOfStock =
                stockData &&
                stockData[item.id] !== undefined &&
                stockData[item.id] < item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 border-b dark:border-charade-700 py-4"
                >
                  <div className="relative w-20 h-20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("checkout.quantity")}: {item.quantity}
                    </p>
                    {isOutOfStock && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-red-500">
                          {t("checkout.out_of_stock")}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveOutOfStock(item)}
                          className="text-xs py-1 h-7"
                        >
                          {t("checkout.remove_item")}
                        </Button>
                      </div>
                    )}
                    <div className="mt-2">
                      {item.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.discountPrice} {t("checkout.currency")}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {item.price} {t("checkout.currency")}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">
                          {item.price} {t("checkout.currency")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 space-y-3">
              {couponDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/10 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <PiSealPercentFill className="text-green-500" size={18} />
                    <span className="font-medium">
                      {t("checkout.coupon_discount", {})} ({couponDiscount}%)
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-500">
                      -{couponDiscountAmount.toFixed(2)}{" "}
                      {t("checkout.currency")}
                    </span>
                  </div>
                </div>
              )}
              {subtotal !== finalSubtotal && (
                <div className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <PiSealPercentFill className="text-red-500" size={18} />
                    <span className="font-medium">
                      {t("checkout.total_discount")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-red-500">
                      -{(subtotal - finalSubtotal).toFixed(2)}{" "}
                      {t("checkout.currency")}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-charade-950 p-2.5 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("checkout.subtotal")}:
                    </span>
                    <span>
                      {subtotal.toFixed(2)} {t("checkout.currency")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("checkout.delivery")}:
                    </span>
                    <span>
                      {deliveryCost === 0 ? (
                        <span className="text-green-500">
                          {t("checkout.free")}
                        </span>
                      ) : (
                        `${deliveryCost.toFixed(2)} ${t("checkout.currency")}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                    <span className="font-medium">{t("checkout.total")}:</span>
                    <span className="font-bold">
                      {total.toFixed(2)} {t("checkout.currency")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!session && (
            <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <p>{t("checkout.have_account")}</p>
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="text-accent hover:text-charade-900 dark:text-accent dark:hover:text-gray-100 font-medium"
                >
                  {t("checkout.login_button")}
                </button>
              </div>
              {showLoginForm && (
                <LoginForm onClose={() => setShowLoginForm(false)} />
              )}
            </div>
          )}
          <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {t("checkout.user_info")}
            </h2>
            <UserInfoForm
              guestName={guestName}
              setGuestName={setGuestName}
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
              guestPhone={guestPhone}
              setGuestPhone={setGuestPhone}
            />
          </div>

          <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {t("checkout.delivery_address")}
            </h2>

            <AddressTab
              onAddressChange={handleAddressChange}
              isCheckout={true}
              guestMode={!session}
            />
          </div>

          <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {t("checkout.payment_method")}
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cash"
                name="payment"
                value={
                  params.locale === "ro"
                    ? "Plata la livrare"
                    : params.locale === "ru"
                    ? "Оплата при доставке"
                    : "cash_on_delivery"
                }
                checked={
                  paymentMethod ===
                  (params.locale === "ro"
                    ? "Plata la livrare"
                    : params.locale === "ru"
                    ? "Оплата при доставке"
                    : "cash_on_delivery")
                }
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-radio"
              />
              <label htmlFor="cash">{t("checkout.cash_on_delivery")}</label>
            </div>
          </div>

          <CouponSection onDiscountApplied={handleCouponApplied} />

          <Button
            onClick={handlePlaceOrder}
            disabled={
              isLoading ||
              isCheckingStock ||
              outOfStockItems.length > 0 ||
              (session ? !userAddress : !guestAddress) ||
              !guestName ||
              !guestEmail ||
              !guestPhone ||
              stockData === undefined
            }
            className="w-full bg-accent hover:bg-charade-900 hover:text-white text-charade-900 
              dark:hover:bg-gray-100 dark:hover:text-charade-900 h-10 text-sm font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                {t("checkout.processing")}
              </>
            ) : isCheckingStock ? (
              <>
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                {t("checkout.checking_stock")}
              </>
            ) : (
              t("checkout.place_order")
            )}
          </Button>
        </div>
      </div>
      {renderLoginForm()}
    </div>
  );
};

export default CheckoutPage;
