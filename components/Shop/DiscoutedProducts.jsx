"use client";

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

const DiscountCarousel = ({ marketingData, products }) => {
  const t = useTranslations("home");
  const locale = useLocale();

  const productIds = products.map((product) => product.id);
  const queryString = productIds.map((id) => `ids=${id}`).join("&");

  const { data: stockData } = useSWR(
    `/api/products/stock?${queryString}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
    }
  );

  const productsWithStock = products.map((product) => ({
    ...product,
    Stock: stockData?.data?.[product.id] ?? product.Stock,
  }));

  const firstRow = productsWithStock.slice(0, productsWithStock.length / 2);
  const secondRow = productsWithStock.slice(productsWithStock.length / 2);

  const computedBanner1Url =
    locale === "ro"
      ? marketingData?.Banner1_RO_?.[0]
      : marketingData?.Banner1_RU_?.[0];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 max-w-[1250px] w-[90vw] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-center md:text-left w-full">
          {t("discounted_products_title")}!
        </h2>
      </div>

      <div className="rounded-2xl overflow-hidden mb-4">
        {computedBanner1Url && (
          <Image
            src={computedBanner1Url}
            alt="Reduceri de Nerefuzat!"
            className="h-[125px] object-cover w-full md:h-[270px]"
            width={1500}
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
            {firstRow.map((product, index) => (
              <CarouselItem
                key={`row1-${index}`}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/5"
              >
                <div className="space-y-4">
                  <ProductCard product={product} />
                  {secondRow[index] && (
                    <ProductCard product={secondRow[index]} />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default DiscountCarousel;
