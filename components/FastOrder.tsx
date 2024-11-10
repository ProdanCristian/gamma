"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useFastOrderStore } from "@/lib/store/useFastOrderStore";
import { PiSealPercentFill } from "react-icons/pi";
import { useSession } from "next-auth/react";
import { DeliveryZone, DELIVERY_RULES } from "@/lib/store/useCart";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useOrderStore } from "@/lib/store/useOrderStore";
import {
  formatPhoneNumber,
  stripPhonePrefix,
  handlePhoneKeyDown,
} from "@/lib/utils/phoneUtils";

interface UserProfile {
  Nume: string;
  Prenume: string;
  Numar_Telefon: string;
  Provider?: string;
}

export default function FastOrder() {
  const t = useTranslations("FastOrder");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+373 ");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("in_city");
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { isOpen, product, setOpen } = useFastOrderStore();
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();
  const params = useParams();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/auth/profile");
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.user);
            setName(`${data.user.Nume} ${data.user.Prenume}`.trim());
            setPhone(formatPhoneNumber(data.user.Numar_Telefon || ""));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  useEffect(() => {
    if (product?.quantity) {
      setQuantity(parseInt(product.quantity));
    } else {
      setQuantity(1);
    }
  }, [product]);

  const handleQuantityChange = (value: number) => {
    if (!product) return;
    const stockNum = parseInt(product.stock);
    const newQuantity = Math.max(1, Math.min(value, stockNum));
    setQuantity(newQuantity);
  };

  const hasDiscount =
    product?.discount &&
    parseFloat(product.discount) < parseFloat(product.price);

  const getDiscountPercentage = () => {
    if (!hasDiscount) return 0;
    return Math.round(
      ((parseFloat(product!.price) - parseFloat(product!.discount!)) /
        parseFloat(product!.price)) *
        100
    );
  };

  const setOrderData = useOrderStore((state) => state.setOrderData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    if (!name.trim() || phone.length < 13) {
      return;
    }

    if (session?.user && (!userProfile?.Numar_Telefon || !userProfile?.Nume)) {
      try {
        const [firstName, ...restName] = name.trim().split(" ");
        const lastName = restName.join(" ");

        await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Nume: lastName || firstName,
            Prenume: lastName ? firstName : "",
            Numar_Telefon: stripPhonePrefix(phone),
            Email: session.user.email,
            Provider: userProfile?.Provider || "credentials",
          }),
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
    const productPrice = hasDiscount
      ? parseFloat(product.discount!)
      : parseFloat(product.price);

    const total = productPrice * quantity;
    const currentDeliveryRules = DELIVERY_RULES[deliveryZone];
    const isFreeDelivery = total >= currentDeliveryRules.freeDeliveryThreshold;
    const deliveryCost = isFreeDelivery ? 0 : currentDeliveryRules.cost;

    try {
      const response = await fetch("/api/orders/fastOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          numePrenume: name,
          numarTelefon: stripPhonePrefix(phone),
          productId: product.id,
          quantity: quantity,
          deliveryZone: deliveryZone,
          isFreeDelivery,
          locale: params.locale,
          productPrice: productPrice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOpen(false);

        const getLocalizedPaymentMethod = (locale: string) => {
          switch (locale) {
            case "ru":
              return "Оплата при доставке";
            case "ro":
              return "Plata la livrare";
            default:
              return "Cash on delivery";
          }
        };

        const getLocalizedAddressMessage = (locale: string) => {
          switch (locale) {
            case "ru":
              return "Адрес будет подтвержден";
            case "ro":
              return "Adresa va fi confirmată";
            default:
              return "Address to be confirmed";
          }
        };

        const orderConfirmation = {
          products: [
            {
              id: product.id,
              name: product.name,
              image: product.image,
              quantity: quantity,
              price: parseFloat(product.price),
              discountPrice: product.discount
                ? parseFloat(product.discount)
                : undefined,
            },
          ],
          deliveryCost: deliveryCost,
          total: total + deliveryCost,
          couponDiscount: 0,
          ...(data.address && { address: data.address }),
          orderIds: [data.orderId],
          paymentMethod: getLocalizedPaymentMethod(params.locale as string),
        };

        localStorage.setItem(
          "orderConfirmation",
          JSON.stringify(orderConfirmation)
        );
        router.push(`/${params.locale}/checkout/order`);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const currentDeliveryRules = DELIVERY_RULES[deliveryZone];
  const total = product
    ? parseFloat(product.discount || product.price) * quantity
    : 0;
  const remainingForFreeDelivery = Math.max(
    0,
    currentDeliveryRules.freeDeliveryThreshold - total
  );

  const finalTotal =
    total + (remainingForFreeDelivery > 0 ? currentDeliveryRules.cost : 0);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px] max-w-[90vw] dark:bg-charade-900 bg-white border-none rounded-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex w-full gap-4">
          <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
          <div className="flex items-center justify-between gap-2 w-full">
            <DialogTitle className="text-left">{product?.name}</DialogTitle>
            <img
              src={product?.image}
              alt={product?.name}
              width={160}
              height={160}
            />
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {product && (
            <>
              <div className="space-y-2">
                <div className="flex items-center mb-6">
                  <span className="font-bold text-xl">
                    {hasDiscount ? product.discount : product.price} {t("lei")}
                  </span>
                  {hasDiscount && (
                    <>
                      <s className="ml-5 text-gray-500 text-xl">
                        {product.price} {t("lei")}
                      </s>
                      <div className="flex items-center ml-10">
                        <span className="text-red-500 mr-2 text-xl">
                          {getDiscountPercentage()}%
                        </span>
                        <PiSealPercentFill size={30} className="text-red-500" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-500">
                    {t("quantity")}:
                  </label>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="px-3 py-1 border border-gray-300 rounded-l-lg hover:bg-gray-100 
                          dark:border-gray-600 dark:hover:bg-gray-700"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={parseInt(product.stock)}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const stockNum = parseInt(product.stock);
                          if (val >= stockNum) {
                            handleQuantityChange(stockNum);
                          } else {
                            handleQuantityChange(val);
                          }
                        }}
                        className="w-16 text-center border-y border-gray-300 py-1 
                          dark:border-gray-600 dark:bg-charade-800"
                        tabIndex={-1}
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-3 py-1 border border-gray-300 rounded-r-lg hover:bg-gray-100 
                          dark:border-gray-600 dark:hover:bg-gray-700"
                        disabled={quantity >= parseInt(product.stock)}
                      >
                        +
                      </button>
                    </div>
                    {quantity >= parseInt(product.stock) && (
                      <span className="text-sm text-red-500">
                        {product.stock}{" "}
                        {product.stock === "1" ? t("unit") : t("units")}{" "}
                        {t("in_stock")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    {t("delivery_zone")}:
                  </label>
                  <select
                    value={deliveryZone}
                    onChange={(e) =>
                      setDeliveryZone(e.target.value as DeliveryZone)
                    }
                    className="bg-gray-50 dark:bg-charade-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="in_city">{t("in_city_Chisinau")}</option>
                    <option value="outside_city">
                      {t("outside_city_Chisinau")}
                    </option>
                  </select>
                </div>

                <div className="bg-gray-50 dark:bg-charade-950 p-2.5 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("subtotal")}:
                    </span>
                    <span>
                      {total.toFixed(2)} {t("currency")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("delivery")}:
                    </span>
                    {remainingForFreeDelivery > 0 ? (
                      <span>
                        {currentDeliveryRules.cost} {t("currency")}
                      </span>
                    ) : (
                      <span className="text-green-500">
                        {t("free_delivery")}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between font-medium pt-2 border-t dark:border-gray-700">
                    <span>{t("total_with_delivery")}:</span>
                    <span>
                      {finalTotal.toFixed(2)} {t("currency")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="grid gap-2 mt-4">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("name_placeholder")}
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              required
              autoFocus={false}
            />
          </div>
          <div className="grid gap-2">
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              maxLength={13}
              placeholder={t("phone_placeholder")}
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              required
              autoFocus={false}
            />
            <p className="text-sm text-gray-500">
              {t("phone_format", { fallback: "Format: +373 XXXXXXXX" })}
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-charade-900 text-white font-bold py-2 px-4 rounded-lg 
              dark:bg-accent dark:hover:bg-white dark:hover:text-charade-900"
          >
            {t("get_call_now")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
