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

export default function FastOrder() {
  const t = useTranslations("FastOrder");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { isOpen, product, setOpen } = useFastOrderStore();
  const [quantity, setQuantity] = useState(1);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw] dark:bg-charade-950 bg-white border-none rounded-xl">
        <DialogHeader className="flex w-full gap-4">
          <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
          <div className="flex items-center justify-between gap-2 w-full">
            <DialogTitle>{product?.name}</DialogTitle>
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
          )}
          <div className="grid gap-2 mt-4">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("name_placeholder")}
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phone_placeholder")}
              className="dark:bg-[#4a4b59] bg-gray-100 rounded-lg p-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-charade-900 text-white font-bold py-2 px-4 rounded-lg mt-4
              dark:bg-accent dark:hover:bg-charade-900"
          >
            {t("get_call_now")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
