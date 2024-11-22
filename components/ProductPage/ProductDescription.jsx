"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PiSealPercentFill,
  PiCursorClick,
  PiShoppingCartSimple,
} from "react-icons/pi";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFastOrderStore } from "@/lib/store/useFastOrderStore";
import { useCartStore } from "@/lib/store/useCart";
import useSWR from "swr";

const BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductDescription = ({
  productData,
  variantsData = [],
  locale = "ro",
}) => {
  const router = useRouter();
  const t = useTranslations("product");
  const [selectedModel, setSelectedModel] = useState(
    productData?.Valoare_Atribut || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    productData?.nc_pka4___Culori_id || null
  );
  const [currentProduct, setCurrentProduct] = useState(productData);
  const currentScrollPosition = useRef(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const originalButtonRef = useRef(null);

  const attributeLabel =
    variantsData[0]?.[locale === "ru" ? "Atribut_RU" : "Atribut_RO"] || "";

  const hasAttributes = variantsData.some((variant) => variant.Valoare_Atribut);

  const modelVariantsWithImages = hasAttributes
    ? variantsData.reduce((acc, variant) => {
        const key = variant.Valoare_Atribut;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(variant);
        return acc;
      }, {})
    : {};

  const getVariantImage = (variants) => {
    if (selectedColor) {
      const colorVariant = variants.find(
        (v) => v.nc_pka4___Culori_id === selectedColor
      );
      if (colorVariant?.Imagine_Principala) {
        return JSON.parse(colorVariant.Imagine_Principala)[0];
      }
    }
    return variants[0].Imagine_Principala
      ? JSON.parse(variants[0].Imagine_Principala)[0]
      : null;
  };

  const availableColors = variantsData
    .filter((v) => v.nc_pka4___Culori_id)
    .map((v) => ({
      id: v.nc_pka4___Culori_id,
      name: locale === "ru" ? v.Culoare_RU : v.Culoare_RO,
      code: v.Cod_Culoare,
    }))
    .filter(
      (color, index, self) => index === self.findIndex((c) => c.id === color.id)
    );

  useEffect(() => {
    const matchingProduct = variantsData.find(
      (v) =>
        (selectedModel ? v.Valoare_Atribut === selectedModel : true) &&
        (selectedColor ? v.nc_pka4___Culori_id === selectedColor : true)
    );

    if (matchingProduct && matchingProduct.id !== productData.id) {
      setCurrentProduct(matchingProduct);
      currentScrollPosition.current = window.scrollY;

      const urlFriendlyName = matchingProduct.Nume_Produs_RO.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .replace(/-+/g, "-");

      const newUrl = `/${locale}/product/${urlFriendlyName}_${matchingProduct.id}`;
      router.push(newUrl, { scroll: false });
    }
  }, [
    selectedModel,
    selectedColor,
    variantsData,
    productData.id,
    router,
    locale,
  ]);

  useEffect(() => {
    if (currentScrollPosition.current > 0) {
      window.scrollTo(0, currentScrollPosition.current);
      currentScrollPosition.current = 0;
    }
  }, [currentProduct]);

  const hasDiscount = Boolean(
    currentProduct.Pret_Redus &&
      parseFloat(currentProduct.Pret_Redus) <
        parseFloat(currentProduct.Pret_Standard)
  );

  const getDiscountPercentage = () => {
    if (!hasDiscount) return 0;
    return Math.round(
      ((parseFloat(currentProduct.Pret_Standard) -
        parseFloat(currentProduct.Pret_Redus)) /
        parseFloat(currentProduct.Pret_Standard)) *
        100
    );
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, currentStock));
    setQuantity(newQuantity);
  };

  const setProduct = useFastOrderStore((state) => state.setProduct);

  const handleOrderNow = () => {
    setProduct({
      id: currentProduct.id,
      name:
        locale === "ru"
          ? currentProduct.Nume_Produs_RU
          : currentProduct.Nume_Produs_RO,
      image: currentProduct.Imagine_Principala
        ? `${BASE_URL}/${JSON.parse(currentProduct.Imagine_Principala)[0].path}`
        : null,
      price: currentProduct.Pret_Standard,
      discount: currentProduct.Pret_Redus,
      stock: currentProduct.Stock,
      quantity: quantity,
    });
  };

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    const item = {
      id: currentProduct.id,
      name:
        locale === "ru"
          ? currentProduct.Nume_Produs_RU
          : currentProduct.Nume_Produs_RO,
      price: parseFloat(currentProduct.Pret_Standard),
      discountPrice: currentProduct.Pret_Redus
        ? parseFloat(currentProduct.Pret_Redus)
        : undefined,
      quantity: quantity,
      image: currentProduct.Imagine_Principala
        ? `${BASE_URL}/${JSON.parse(currentProduct.Imagine_Principala)[0].path}`
        : null,
      stock: currentProduct.Stock,
    };

    addItem(item);

    try {
      fetch("/api/facebook-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "AddToCart",
          data: {
            clientUserAgent: navigator.userAgent,
          },
          sourceUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error("Error sending add to cart event:", error);
    }
  };

  // Get the ShowVariantImages value from the first variant
  const showVariantImages = variantsData[0]?.ShowVariantImages ?? false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyButton(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    if (originalButtonRef.current) {
      observer.observe(originalButtonRef.current);
    }

    return () => {
      if (originalButtonRef.current) {
        observer.unobserve(originalButtonRef.current);
      }
    };
  }, []);

  const { data: stockData } = useSWR(
    `/api/products/stock/productpage?id=${currentProduct.id}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 0,
    }
  );

  const currentStock = stockData?.success ? stockData.data.Stock : 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center">
          <span className="font-bold text-xl">
            {hasDiscount
              ? currentProduct.Pret_Redus
              : currentProduct.Pret_Standard}{" "}
            {t("lei")}
          </span>
          {hasDiscount && (
            <>
              <s className="ml-5 text-gray-500 text-xl">
                {currentProduct.Pret_Standard} {t("lei")}
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

        {hasAttributes &&
          Object.entries(modelVariantsWithImages).length > 0 && (
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                {attributeLabel}
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(modelVariantsWithImages).map(
                  ([model, variants]) => {
                    const mainImage = showVariantImages
                      ? getVariantImage(variants)
                      : null;
                    const imagePath = mainImage
                      ? `${BASE_URL}/${mainImage.path}`
                      : null;

                    return (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setSelectedColor(null);
                        }}
                        className={`relative flex flex-col items-center p-2 rounded-lg border transition-all
                      ${
                        selectedModel === model
                          ? "border-accent bg-green-50 dark:bg-green-50/5"
                          : "border-gray-200 dark:border-charade-700 hover:border-accent"
                      }`}
                      >
                        {showVariantImages && (
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2">
                            {imagePath && (
                              <Image
                                src={imagePath}
                                alt={variants[0].Nume_Produs_RO}
                                fill
                                sizes="(max-width: 768px) 33vw, 25vw"
                                className="object-cover rounded-lg"
                                loading="lazy"
                                priority={false}
                              />
                            )}
                          </div>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            !showVariantImages ? "py-2" : ""
                          }`}
                        >
                          {model}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {availableColors.length > 0 && (
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("select_color")}
            </label>
            <div className="flex flex-wrap gap-4">
              {availableColors.map((color) => (
                <div
                  key={color.id}
                  className="flex flex-col items-center gap-2"
                >
                  <button
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-8 h-8 rounded-full border transition-all hover:scale-110
                      ${
                        selectedColor === color.id
                          ? "border-accent ring-1 ring-accent"
                          : "border-gray-300"
                      }
                    `}
                    style={{ backgroundColor: color.code || "#FFFFFF" }}
                    title={color.name || ""}
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-base">
          {quantity >= currentStock && currentStock > 0 ? (
            <span className="text-red-500">
              {currentStock === "1"
                ? `1 ${t("unit")} ${t("in_stock")}`
                : `${currentStock} ${t("units")} ${t("in_stock")}`}
            </span>
          ) : currentStock > 0 ? (
            <span
              className={
                currentStock <= 3 ? "text-yellow-500" : "text-green-500"
              }
            >
              {currentStock <= 3 ? t("low_stock") : t("in_stock")}
            </span>
          ) : (
            <span className="text-red-500">{t("out_of_stock")}</span>
          )}
        </div>

        <div
          ref={originalButtonRef}
          className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4"
        >
          {currentStock > 0 && (
            <div className="flex items-center gap-4 sm:w-auto">
              <label
                htmlFor="quantity-input"
                className="text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                {t("quantity")}
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  aria-label={t("decrease_quantity")}
                  className="px-3 py-1 border border-gray-300 rounded-l-lg hover:bg-gray-100 
                    dark:border-gray-600 dark:hover:bg-gray-700"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-16 text-center border-y border-gray-300 py-1 
                    dark:border-gray-600 dark:bg-charade-800"
                  aria-label={t("quantity")}
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  aria-label={t("increase_quantity")}
                  className="px-3 py-1 border border-gray-300 rounded-r-lg hover:bg-gray-100 
                    dark:border-gray-600 dark:hover:bg-gray-700"
                  disabled={quantity >= currentStock}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 w-full sm:w-full">
            <button
              disabled={currentStock <= 0}
              onClick={handleOrderNow}
              aria-label={t("order_now")}
              className={` dark:bg-accent bg-accent dark:hover:bg-gray-100 
                hover:bg-charade-900 py-[8px] text-charade-950 hover:text-white dark:text-charade-950 text-sm font-semibold px-4 rounded-lg flex
                items-center justify-center content-center w-full transition-colors duration-200
                ${currentStock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("order_now")}
              <PiCursorClick className="ml-2" size={30} />
            </button>
            <button
              disabled={currentStock <= 0}
              onClick={handleAddToCart}
              aria-label={t("add_to_cart")}
              className={`hover:text-[#47e194] transition-colors duration-200
                ${currentStock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <PiShoppingCartSimple size={35} />
            </button>
          </div>
        </div>
      </div>

      {/* Modified Sticky Order Button */}
      <div
        className={`fixed md:hidden bottom-[70px] md:bottom-7 left-0 w-full z-40 px-4 md:px-7 transition-all duration-300 pointer-events-none
          ${
            showStickyButton
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
      >
        <div className="max-w-[80%]">
          <div className="flex justify-end">
            <div className="w-full md:w-auto pointer-events-auto">
              <div className="rounded-lg p-4 md:p-3 flex items-center gap-4">
                <button
                  disabled={currentStock <= 0}
                  onClick={handleOrderNow}
                  aria-label={t("order_now")}
                  className={`dark:bg-accent bg-accent dark:hover:bg-gray-100 
                    hover:bg-charade-900 py-2 text-charade-950 hover:text-white dark:text-charade-950 
                    text-sm font-semibold px-4 rounded-lg flex items-center justify-center content-center 
                    transition-colors duration-200 w-full md:w-auto
                    ${
                      currentStock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {t("order_now")}
                  <PiCursorClick className="ml-2" size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDescription;
