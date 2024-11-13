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
import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

const formatCategoryName = (slug: string): string => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getSubcategoryData(subcategoryId: string, categoryId: string) {
  const [subcategoryNames, subSubCategories, categoryNames] = await Promise.all(
    [
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/subCat?id=${subcategoryId}`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subSubCategories?subcategoryId=${subcategoryId}`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/cat?id=${categoryId}`
      ).then((res) => res.json()),
    ]
  );

  return { subcategoryNames, subSubCategories, categoryNames };
}

interface SubSubCategory {
  id: string;
  [key: string]: any;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const subcategorySlug = decodeURIComponent(resolvedParams.subcategory || "");
  const categorySlug = decodeURIComponent(resolvedParams.category || "");
  const locale = resolvedParams.locale;

  const [subcategoryName, subcategoryId] = subcategorySlug.split("_");
  const [categoryName, categoryId] = categorySlug.split("_");

  if (!subcategoryId) {
    return {
      title: "Subcategory Not Found",
    };
  }

  const { subcategoryNames, categoryNames } = await getSubcategoryData(
    subcategoryId,
    categoryId
  );

  const getSubcategoryTitle = () => {
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

  const fullPath = `/category/${categorySlug}/${subcategorySlug}`;

  return {
    title: `${getSubcategoryTitle()} | Gamma`,
    description:
      locale === "ru"
        ? `Широкий выбор ${getSubcategoryTitle().toLowerCase()}`
        : `Gamă largă de ${getSubcategoryTitle().toLowerCase()}`,
    openGraph: {
      title: getSubcategoryTitle(),
      description:
        locale === "ru"
          ? `Широкий выбор ${getSubcategoryTitle().toLowerCase()}`
          : `Gamă largă de ${getSubcategoryTitle().toLowerCase()}`,
      type: "website",
      locale: locale,
      siteName: "Gamma",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}${fullPath}`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru${fullPath}`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro${fullPath}`,
      },
    },
  };
}

export default async function SubcategoryPage({ params }: any) {
  const t = await getTranslations("shop");
  const locale = await getLocale();

  const resolvedParams = await params;
  const subcategorySlug = decodeURIComponent(resolvedParams.subcategory || "");
  const categorySlug = decodeURIComponent(resolvedParams.category || "");

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

  const { subcategoryNames, subSubCategories, categoryNames } =
    await getSubcategoryData(subcategoryId, categoryId);

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

  const getCategoryDisplayName = () => {
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: getSubcategoryName(),
    description:
      locale === "ru"
        ? `Широкий выбор ${getSubcategoryName().toLowerCase()}`
        : `Gamă largă de ${getSubcategoryName().toLowerCase()}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "ru" ? "Главная" : "Acasă",
          item: process.env.NEXT_PUBLIC_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: getCategoryDisplayName(),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${categorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: getSubcategoryName(),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${categorySlug}/${subcategorySlug}`,
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="subcategory-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-[1250px] w-[90vw] mx-auto">
        {/* Add breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {locale === "ru" ? "Главная" : "Acasă"}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/${locale}/category/${categorySlug}`}
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {getCategoryDisplayName()}
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-200">
                {getSubcategoryName()}
              </span>
            </li>
          </ol>
        </nav>

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
    </>
  );
}
