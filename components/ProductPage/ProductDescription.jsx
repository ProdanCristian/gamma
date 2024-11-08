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

const BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

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

  const attributeLabel =
    variantsData[0]?.[locale === "ru" ? "Atribut_RU" : "Atribut_RO"] || "";

  const modelVariantsWithImages = variantsData.reduce((acc, variant) => {
    const key = variant.Valoare_Atribut;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(variant);
    return acc;
  }, {});

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
    .filter((v) => v.Valoare_Atribut === selectedModel)
    .filter((v) => v.nc_pka4___Culori_id)
    .map((v) => ({
      id: v.nc_pka4___Culori_id,
      name: locale === "ru" ? v.Culoare_RU : v.Culoare_RO,
      code: v.Cod_Culoare,
    }));

  useEffect(() => {
    const matchingProduct = variantsData.find(
      (v) =>
        v.Valoare_Atribut === selectedModel &&
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
    const newQuantity = Math.max(1, Math.min(value, currentProduct.Stock));
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
  };

  return (
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

      {Object.entries(modelVariantsWithImages).length > 0 && (
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            {attributeLabel}
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(modelVariantsWithImages).map(
              ([model, variants]) => {
                const mainImage = getVariantImage(variants);
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
                    <div className="relative w-full pt-[100%] rounded-lg overflow-hidden mb-2">
                      {imagePath && (
                        <Image
                          src={imagePath}
                          alt={variants[0].Nume_Produs_RO}
                          fill
                          className="object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium">{model}</span>
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
              <div key={color.id} className="flex flex-col items-center gap-2">
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
        <span
          className={
            currentProduct.Stock > 0 ? "text-green-500" : "text-red-500"
          }
        >
          {currentProduct.Stock > 0 ? t("in_stock") : t("out_of_stock")}
        </span>
        {currentProduct.Stock > 0 && (
          <span className="ml-2 text-gray-500">
            ({currentProduct.Stock}{" "}
            {currentProduct.Stock === "1" ? t("unit") : t("units")})
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4">
        {currentProduct.Stock > 0 && (
          <div className="flex  items-center gap-4 sm:w-auto">
            <label className="text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t("quantity")}
            </label>
            <div className="flex items-center">
              <button
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
                max={currentProduct.Stock}
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-16 text-center border-y border-gray-300 py-1 
                  dark:border-gray-600 dark:bg-charade-800"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-1 border border-gray-300 rounded-r-lg hover:bg-gray-100 
                  dark:border-gray-600 dark:hover:bg-gray-700"
                disabled={quantity >= currentProduct.Stock}
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 w-full sm:w-full">
          <button
            disabled={currentProduct.Stock <= 0}
            onClick={handleOrderNow}
            className={`dark:bg-accent bg-accent dark:hover:bg-gray-100
              hover:bg-charade-900 py-[8px] text-charade-950 hover:text-white dark:text-charade-950 text-sm font-semibold px-4 rounded-lg flex
              items-center justify-center content-center w-full transition-colors duration-200
              ${
                currentProduct.Stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {t("order_now")}
            <PiCursorClick className="ml-2" size={30} />
          </button>
          <button
            disabled={currentProduct.Stock <= 0}
            onClick={handleAddToCart}
            className={`hover:text-[#47e194] transition-colors duration-200
              ${
                currentProduct.Stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <PiShoppingCartSimple size={35} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
