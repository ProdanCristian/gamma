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

// Add generateMetadata
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const category = resolvedParams?.category;
  const locale = resolvedParams.locale;

  const [categoryName, categoryId] = decodeURIComponent(category || "").split(
    "_"
  );

  if (!categoryId) {
    return {
      title: "Category Not Found",
    };
  }

  const { categoryNames } = await getCategoryData(categoryId);

  const getCategoryTitle = () => {
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

  return {
    title: `${getCategoryTitle()} | Your Shop Name`,
    description:
      locale === "ru"
        ? `Исследуйте нашу коллекцию ${getCategoryTitle().toLowerCase()}`
        : `Explorează colecția noastră de ${getCategoryTitle().toLowerCase()}`,
    openGraph: {
      title: getCategoryTitle(),
      description:
        locale === "ru"
          ? `Исследуйте нашу коллекцию ${getCategoryTitle().toLowerCase()}`
          : `Explorează colecția noastră de ${getCategoryTitle().toLowerCase()}`,
      type: "website",
      locale: locale,
      siteName: "Gamma",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/category/${category}`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru/category/${category}`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro/category/${category}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: any) {
  const t = await getTranslations("shop");
  const locale = await getLocale();

  const resolvedParams = await params;
  const category = resolvedParams?.category;
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: getCategoryName(),
    description:
      locale === "ru"
        ? `Исследуйте нашу коллекцию ${getCategoryName().toLowerCase()}`
        : `Explorează colecția noastră de ${getCategoryName().toLowerCase()}`,
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
          name: getCategoryName(),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${category}`,
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="category-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-[1250px] w-[90vw] mx-auto">
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
              <span className="text-gray-900 dark:text-gray-200">
                {getCategoryName()}
              </span>
            </li>
          </ol>
        </nav>

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
    </>
  );
}
