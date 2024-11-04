import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SubSubCategoryCard from "@/components/CategoriesCards/SubSubCategoryCard";
import { getTranslations } from "next-intl/server";

const formatCategoryName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getSubcategoryNames(id) {
  try {
    const baseUrl = "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/catNames/subCat?id=${id}`, {
      revalidate: 3600,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching subcategory names:", error);
    return null;
  }
}

async function getSubSubCategories(categoryId, subcategoryId) {
  try {
    const baseUrl = "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/subSubCategories?subcategoryId=${subcategoryId}`,
      { revalidate: 3600 }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) return [];

    return (
      data.data?.map((sub) => ({
        id: sub.id,
        subsub_name_ro: sub.subsub_name_ro,
        subsub_name_ru: sub.subsub_name_ru,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching sub-subcategories:", error);
    return [];
  }
}

export default async function SubcategoryPage(props) {
  const t = await getTranslations("Category");
  const params = await props.params;
  const subcategorySlug = decodeURIComponent(params.subcategory);
  const categorySlug = decodeURIComponent(params.category);
  const locale = params.locale;

  const subcategoryId = subcategorySlug.split("_")[1];
  const categoryId = categorySlug.split("_")[1];

  if (!subcategoryId || !categoryId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalidCategoryId")}
        </h1>
        <p className="text-gray-500 mt-2">{t("checkUrlAndTryAgain")}</p>
      </div>
    );
  }

  try {
    const [subcategoryNames, subSubCategories] = await Promise.all([
      getSubcategoryNames(subcategoryId),
      getSubSubCategories(categoryId, subcategoryId),
    ]);

    const getSubcategoryName = () => {
      if (locale === "ro") {
        return (
          subcategoryNames?.Nume_SubCategorie_RO ||
          formatCategoryName(subcategorySlug.split("_")[0])
        );
      } else if (locale === "ru") {
        return (
          subcategoryNames?.Nume_SubCategorie_RU ||
          formatCategoryName(subcategorySlug.split("_")[0])
        );
      }
      return formatCategoryName(subcategorySlug.split("_")[0]);
    };

    return (
      <div className="max-w-[1250px] w-[90vw] mx-auto">
        <h1 className="text-2xl text-charade-900 dark:text-gray-100 font-bold mt-6">
          {getSubcategoryName()}
        </h1>

        {subSubCategories && subSubCategories.length > 0 ? (
          <Carousel
            className="relative w-full px-0 py-8"
            opts={{
              align: "start",
              dragFree: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4 w-[60%] md:w-full">
              {subSubCategories.map((subSubCategory) => (
                <CarouselItem
                  key={subSubCategory.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/6"
                >
                  <SubSubCategoryCard
                    subSubCategory={{
                      id: subSubCategory.id,
                      subsub_name_ro: subSubCategory.subsub_name_ro,
                      subsub_name_ru: subSubCategory.subsub_name_ru,
                    }}
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">{t("noSubSubCategories")}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in SubcategoryPage:", error);
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("errorLoadingData")}
        </h1>
        <p className="text-gray-500 mt-2">{t("tryAgainLater")}</p>
      </div>
    );
  }
}
