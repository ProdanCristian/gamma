import { getTranslations, getLocale } from "next-intl/server";
import SubCategoryProducts from "./subcategoryproducts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SubSubCategoryCard from "@/components/CategoriesCards/SubSubCategoryCard";

const formatCategoryName = (slug: string): string => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getSubcategoryData(subcategoryId: string) {
  const [subcategoryNames, subSubCategories] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/subCat?id=${subcategoryId}`
    ).then((res) => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subSubCategories?subcategoryId=${subcategoryId}`
    ).then((res) => res.json()),
  ]);

  return { subcategoryNames, subSubCategories };
}

interface SubcategoryPageProps {
  params: {
    subcategory?: string;
    category?: string;
    locale?: string;
  };
}

interface SubSubCategory {
  id: string;
  [key: string]: any;
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const t = await getTranslations("shop");

  // Await params before accessing properties
  const parameters = await params;
  const subcategorySlug = decodeURIComponent(parameters.subcategory || "");
  const categorySlug = decodeURIComponent(parameters.category || "");
  const locale = await getLocale();

  const [subcategoryName, subcategoryId] = subcategorySlug.split("_");
  const [categoryName, categoryId] = categorySlug.split("_");

  if (!subcategoryId || !categoryId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalid_category_id")}
        </h1>
        <p className="text-gray-500 mt-2">{t("check_url")}</p>
      </div>
    );
  }

  const { subcategoryNames, subSubCategories } = await getSubcategoryData(
    subcategoryId
  );

  const getSubcategoryName = () => {
    if (locale === "ro") {
      return (
        subcategoryNames?.data?.Nume_SubCategorie_RO ||
        formatCategoryName(subcategoryName)
      );
    } else if (locale === "ru") {
      return (
        subcategoryNames?.data?.Nume_SubCategorie_RU ||
        formatCategoryName(subcategoryName)
      );
    }
    return formatCategoryName(subcategoryName);
  };

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto">
      <h1 className="text-3xl text-charade-900 dark:text-gray-100 font-bold mt-6">
        {getSubcategoryName()}
      </h1>

      {subSubCategories?.data?.length > 0 && (
        <Carousel
          className="relative w-full px-0 py-8"
          opts={{
            align: "start",
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4 w-[60%] md:w-full">
            {subSubCategories.data.map((subSubCategory: SubSubCategory) => (
              <CarouselItem
                key={subSubCategory.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/6"
              >
                <SubSubCategoryCard
                  subSubCategory={subSubCategory}
                  locale={locale}
                  path={`/${locale}/category/${categorySlug}/${subcategorySlug}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="absolute -left-4 md:-left-10" />
            <CarouselNext className="absolute -right-4 md:-right-10" />
          </div>
        </Carousel>
      )}

      <SubCategoryProducts
        subcategoryId={subcategoryId}
        categoryId={categoryId}
        categoryName={categoryName}
        subcategoryName={subcategoryName}
        locale={locale}
      />
    </div>
  );
}
