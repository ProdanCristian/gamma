"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
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

const TopProductsCarousel = ({ marketingData }) => {
  const t = useTranslations("home");
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const { data: productsData, error } = useSWR(
    "/api/products/bestSellingProducts?limit=12",
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

  const displayProducts = loading ? Array(12).fill({}) : products;

  const computedBanner2Url =
    locale === "ro"
      ? marketingData?.Banner2_RO_?.[0]
      : marketingData?.Banner2_RU_?.[0];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 mt-10 max-w-[1250px] w-[90vw] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-center w-full md:text-left">
          {t("discover_top_products")}!
        </h2>
      </div>

      <div className="block lg:flex gap-4">
        <div className="lg:w-[400px] h-[160px] md:h-[270px] relative flex-shrink-0">
          {computedBanner2Url && (
            <Image
              src={computedBanner2Url}
              alt="Top Products"
              className="rounded-xl"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-14 lg:mt-0 flex-grow">
          <Carousel
            opts={{
              align: "start",
            }}
          >
            <div className="relative">
              <CarouselPrevious className="absolute left-0 -top-7" />
              <Link
                href={`/${locale}/shop/bestsellers`}
                className="absolute left-1/2 -translate-x-1/2 -top-12 w-fit"
              >
                <Button variant="outline">{t("view_all")}</Button>
              </Link>
              <CarouselNext className="absolute right-0 -top-7" />
            </div>
            <CarouselContent className="-ml-2 md:-ml-3 lg:-ml-4 w-[80%] md:w-full">
              {displayProducts.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-3 lg:pl-4 md:basis-1/2 lg:basis-1/2 xl:basis-1/3"
                >
                  <ProductCard product={product} loading={loading} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default TopProductsCarousel;
