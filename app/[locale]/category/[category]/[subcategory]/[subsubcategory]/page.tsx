export const revalidate = false;
import { getTranslations, getLocale } from "next-intl/server";
import SubSubCategoryProducts from "./subsubcategoryproducts";
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

async function getSubSubCategoryData(
  subsubcategoryId: string,
  subcategoryId: string,
  categoryId: string
) {
  const [subsubcategoryNames, subcategoryNames, categoryNames] =
    await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/subSubCat?id=${subsubcategoryId}`,
        {
          next: { tags: ["categories"] },
          cache: "force-cache",
        }
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/subCat?id=${subcategoryId}`,
        {
          next: { tags: ["categories"] },
          cache: "force-cache",
        }
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/cat?id=${categoryId}`,
        {
          next: { tags: ["categories"] },
          cache: "force-cache",
        }
      ).then((res) => res.json()),
    ]);

  return { subsubcategoryNames, subcategoryNames, categoryNames };
}

interface Props {
  params: {
    subsubcategory: string;
    subcategory: string;
    category: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const subsubcategorySlug = decodeURIComponent(
    resolvedParams.subsubcategory || ""
  );
  const subcategorySlug = decodeURIComponent(resolvedParams.subcategory || "");
  const categorySlug = decodeURIComponent(resolvedParams.category || "");
  const locale = resolvedParams.locale;

  // Extract all IDs from slugs
  const [subsubcategoryName, subsubcategoryId] = subsubcategorySlug.split("_");
  const [subcategoryName, subcategoryId] = subcategorySlug.split("_");
  const [categoryName, categoryId] = categorySlug.split("_");

  if (!subsubcategoryId || !subcategoryId || !categoryId) {
    return {
      title: "Category Not Found",
    };
  }

  const { subsubcategoryNames, subcategoryNames, categoryNames } =
    await getSubSubCategoryData(subsubcategoryId, subcategoryId, categoryId);

  const getSubSubCategoryTitle = () => {
    if (locale === "ro") {
      return (
        subsubcategoryNames?.data?.Nume_SubSubCategorie_RO ||
        formatCategoryName(subsubcategoryName)
      );
    } else if (locale === "ru") {
      return (
        subsubcategoryNames?.data?.Nume_SubSubCategorie_RU ||
        formatCategoryName(subsubcategoryName)
      );
    }
    return formatCategoryName(subsubcategoryName);
  };

  const fullPath = `/category/${categorySlug}/${subcategorySlug}/${subsubcategorySlug}`;

  return {
    title: `${getSubSubCategoryTitle()} | Gamma`,
    description:
      locale === "ru"
        ? `Лучший выбор ${getSubSubCategoryTitle().toLowerCase()}`
        : `Cea mai bună selecție de ${getSubSubCategoryTitle().toLowerCase()}`,
    openGraph: {
      title: getSubSubCategoryTitle(),
      description:
        locale === "ru"
          ? `Лучший выбор ${getSubSubCategoryTitle().toLowerCase()}`
          : `Cea mai bună selecție de ${getSubSubCategoryTitle().toLowerCase()}`,
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

export default async function SubSubCategoryPage({ params }: any) {
  const t = await getTranslations("shop");
  const locale = await getLocale();

  const resolvedParams = await params;
  const subsubcategorySlug = decodeURIComponent(
    resolvedParams.subsubcategory || ""
  );
  const subcategorySlug = decodeURIComponent(resolvedParams.subcategory || "");
  const categorySlug = decodeURIComponent(resolvedParams.category || "");

  const [subsubcategoryName, subsubcategoryId] = subsubcategorySlug.split("_");
  const [subcategoryName, subcategoryId] = subcategorySlug.split("_");
  const [categoryName, categoryId] = categorySlug.split("_");

  if (!subsubcategoryId || !subcategoryId || !categoryId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalid_category_id")}
        </h1>
        <p className="text-gray-500 mt-2">{t("check_url")}</p>
      </div>
    );
  }

  const { subsubcategoryNames, subcategoryNames, categoryNames } =
    await getSubSubCategoryData(subsubcategoryId, subcategoryId, categoryId);

  const getSubSubCategoryName = () => {
    if (locale === "ro") {
      return (
        subsubcategoryNames?.data?.Nume_SubSubCategorie_RO ||
        formatCategoryName(subsubcategoryName)
      );
    } else if (locale === "ru") {
      return (
        subsubcategoryNames?.data?.Nume_SubSubCategorie_RU ||
        formatCategoryName(subsubcategoryName)
      );
    }
    return formatCategoryName(subsubcategoryName);
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

  const getSubcategoryDisplayName = () => {
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: getSubSubCategoryName(),
    description:
      locale === "ru"
        ? `Лучший выбор ${getSubSubCategoryName().toLowerCase()}`
        : `Cea mai bună selecție de ${getSubSubCategoryName().toLowerCase()}`,
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
          name: formatCategoryName(categoryName),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${categorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: formatCategoryName(subcategoryName),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${categorySlug}/${subcategorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: getSubSubCategoryName(),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/category/${categorySlug}/${subcategorySlug}/${subsubcategorySlug}`,
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="subsubcategory-structured-data"
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
              <Link
                href={`/${locale}/category/${categorySlug}/${subcategorySlug}`}
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {getSubcategoryDisplayName()}
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-200">
                {getSubSubCategoryName()}
              </span>
            </li>
          </ol>
        </nav>

        {/* Add title heading */}
        <h1 className="text-3xl text-charade-900 dark:text-gray-100 font-bold my-6">
          {getSubSubCategoryName()}
        </h1>

        <SubSubCategoryProducts
          subsubcategoryId={subsubcategoryId}
          subcategoryId={subcategoryId}
          categoryId={categoryId}
          categoryName={categoryName}
          subcategoryName={subcategoryName}
          subsubcategoryName={subsubcategoryName}
          locale={locale}
        />
      </div>
    </>
  );
}
