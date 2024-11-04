"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import slugify from "slugify";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function TopCategories({ categories }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("TopCategories");

  const navigateToCategory = (category) => {
    if (!category.mainCategory) return;

    const mainCategorySlug = `${slugify(category.mainCategory.nameRo)}_${
      category.mainCategory.id
    }`;
    const subCategorySlug = `${slugify(category.nameRo)}_${category.id}`;
    const langPrefix = locale === "ru" ? "/ru" : "ro";
    const url = `${langPrefix}/category/${mainCategorySlug}/${subCategorySlug}`;
    router.push(url);
  };

  return (
    <div className="mt-10 mb-12">
      <div className="flex mb-10 justify-center">
        <h1 className="text-4xl font-bold text-center">{t("title")}</h1>
      </div>

      <Carousel>
        <CarouselContent className="w-[85%] md:w-[80%]">
          {categories.map((category) => (
            <CarouselItem
              key={category.id}
              className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/3 px-4 ml-4 md:ml-12 "
            >
              <div
                onClick={() => navigateToCategory(category)}
                className="flex p-4 justify-between cursor-pointer dark:bg-charade-800 border border-charade-900 hover:border-accent bg-charade-950 w-full md:w-[340px] h-[110px] rounded-xl shrink-0"
              >
                <div className="flex-1">
                  <p className="text-white text-sm mb-2">{t("category")}</p>
                  <p className="text-white text-[16px] mb-2">
                    {locale === "ru" ? category.nameRu : category.nameRo}
                  </p>
                  <div className="w-20 h-[1px] bg-white"></div>
                </div>
                <div className="w-16 md:w-20 h-16 md:h-20 flex items-center justify-center ml-4">
                  <Image
                    width={100}
                    height={100}
                    src={category.imagePath}
                    alt={locale === "ru" ? category.nameRu : category.nameRo}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
