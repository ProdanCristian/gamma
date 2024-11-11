import { getTranslations, getLocale } from "next-intl/server";
import CategoryProducts from "./categoryproducts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SubCategoryCard from "@/components/CategoriesCards/SubCategoryCard";

const formatCategoryName = (slug: string): string => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getCategoryData(categoryId: string) {
  const [categoryNames, subcategories] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/cat?id=${categoryId}`
    ).then((res) => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subCategories?categoryId=${categoryId}`
    ).then((res) => res.json()),
  ]);

  return { categoryNames, subcategories };
}

interface CategoryPageProps {
  params: {
    category?: string;
    locale?: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const t = await getTranslations("shop");
  const locale = await getLocale();

  // Await params before accessing category
  const category = (await params)?.category;
  const categorySlug = decodeURIComponent(category || "");

  // Split the category slug into name and ID parts
  const [categoryName, categoryId] = categorySlug.split("_");

  if (!categoryId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalid_category_id")}
        </h1>
        <p className="text-gray-500 mt-2">{t("check_url")}</p>
      </div>
    );
  }

  const { categoryNames, subcategories } = await getCategoryData(categoryId);

  const getCategoryName = () => {
    if (locale === "ro") {
      return (
        categoryNames?.data?.Nume_Categorie_RO ||
        formatCategoryName(categoryName)
      );
    } else if (locale === "ru") {
      return (
        categoryNames?.data?.Nume_Categorie_RU ||
        formatCategoryName(categoryName)
      );
    }
    return formatCategoryName(categoryName);
  };

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto">
      <h1 className="text-3xl text-charade-900 dark:text-gray-100 font-bold mt-6">
        {getCategoryName()}
      </h1>

      {subcategories?.data?.length > 0 && (
        <Carousel
          className="relative w-full px-0 py-8"
          opts={{
            align: "start",
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4 w-[60%] md:w-full">
            {subcategories.data.map((subcategory: any) => (
              <CarouselItem
                key={subcategory.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
              >
                <SubCategoryCard
                  subcategory={subcategory}
                  locale={locale}
                  path={`/${locale}/category/${categoryName}_${categoryId}`}
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

      <CategoryProducts
        categoryId={categoryId}
        categoryName={categoryName}
        locale={locale}
      />
    </div>
  );
}
