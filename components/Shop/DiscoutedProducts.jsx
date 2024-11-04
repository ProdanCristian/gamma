"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import useSWR from "swr";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/Shop/ProductCard";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const DiscountCarousel = ({ marketingData }) => {
  const t = useTranslations("home");
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const { data: productsData, error } = useSWR(
    "/api/products/discountedProducts?limit=20",
    fetcher
  );

  useEffect(() => {
    if (productsData?.success && productsData.products) {
      setProducts(productsData.products);
      setLoading(false);
    }
  }, [productsData]);

  if (error) {
    console.error("Failed to fetch products:", error);
  }

  const displayProducts = loading ? Array(20).fill({}) : products;

  const computedBanner1Url =
    locale === "ro"
      ? marketingData?.Banner1_RO_?.[0]
      : marketingData?.Banner1_RU_?.[0];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 max-w-[1250px] w-[90vw] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {t("discounted_products_title")}!
        </h2>
      </div>

      <div className="rounded-2xl overflow-hidden mb-4">
        {computedBanner1Url && (
          <Image
            src={computedBanner1Url}
            alt="Reduceri de Nerefuzat!"
            className="h-[200px] object-cover w-full md:h-[260px]"
            width={1200}
            height={260}
            priority
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 mt-14">
        <Carousel>
          <div className="relative">
            <CarouselPrevious className="absolute left-0 -top-7" />
            <Link
              href={`/${locale}/shop/discounts`}
              className="absolute left-1/2 -translate-x-1/2 -top-12 w-fit"
            >
              <Button variant="outline">{t("view_all")}</Button>
            </Link>
            <CarouselNext className="absolute right-0 -top-7" />
          </div>
          <CarouselContent className="w-[80%] md:w-full">
            {displayProducts.map((product, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/5"
              >
                <ProductCard product={product} loading={loading} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default DiscountCarousel;
