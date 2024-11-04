import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SubCategoryCard from "@/components/CategoriesCards/SubCategoryCard";
import { getTranslations } from "next-intl/server";

const formatCategoryName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getCategoryNames(id) {
  try {
    const baseUrl = "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/catNames/cat?id=${id}`, {
      revalidate: 3600,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching category names:", error);
    return null;
  }
}

async function getSubcategories(categoryId) {
  try {
    const baseUrl = "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/subCategories?categoryId=${categoryId}`,
      { revalidate: 3600 }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export default async function CategoryPage(props) {
  const t = await getTranslations("category");
  const params = await props.params;
  const categorySlug = decodeURIComponent(params.category);
  const locale = params.locale;
  const categoryId = categorySlug.split("_");

  if (!categoryId[1]) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalid_category_id")}
        </h1>
        <p className="text-gray-500 mt-2">{t("check_url")}</p>
      </div>
    );
  }

  try {
    const [categoryNames, subcategories] = await Promise.all([
      getCategoryNames(categoryId[1]),
      getSubcategories(categoryId[1]),
    ]);

    const getCategoryName = () => {
      if (locale === "ro") {
        return (
          categoryNames?.Nume_Categorie_RO || formatCategoryName(categoryId[0])
        );
      } else if (locale === "ru") {
        return (
          categoryNames?.Nume_Categorie_RU || formatCategoryName(categoryId[0])
        );
      }
      return formatCategoryName(categoryId[0]);
    };

    return (
      <div className="max-w-[1250px] w-[90vw] mx-auto">
        <h1 className="text-3xl text-charade-900 dark:text-gray-100 font-bold mt-6">
          {getCategoryName()}
        </h1>

        {subcategories && subcategories.length > 0 ? (
          <Carousel
            className="relative w-full px-0 py-8"
            opts={{
              align: "start",
              dragFree: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4 w-[60%] md:w-full">
              {subcategories.map((subcategory) => (
                <CarouselItem
                  key={subcategory.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                >
                  <SubCategoryCard
                    subcategory={subcategory}
                    locale={locale}
                    path={`/${locale}/category/${categoryId[0]}_${categoryId[1]}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="absolute -left-4 md:-left-10" />
              <CarouselNext className="absolute -right-4 md:-right-10" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">{t("no_subcategories_found")}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in CategoryPage:", error);
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("error_loading_category_data")}
        </h1>
        <p className="text-gray-500 mt-2">{t("please_try_again")}</p>
      </div>
    );
  }
}
