import { getTranslations, getLocale } from "next-intl/server";
import SubSubCategoryProducts from "./subsubcategoryproducts";

const formatCategoryName = (slug: string): string => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getSubSubCategoryData(subsubcategoryId: string) {
  const subsubcategoryNames = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/catNames/subSubCat?id=${subsubcategoryId}`
  ).then((res) => res.json());

  return { subsubcategoryNames };
}

interface Props {
  params: {
    subsubcategory: string;
    subcategory: string;
    category: string;
    locale: string;
  };
}

export default async function SubSubCategoryPage({
  params,
}: any) {
  const t = await getTranslations("shop");
  
  // Remove await for params since it's no longer a Promise
  const subsubcategorySlug = decodeURIComponent(params.subsubcategory || "");
  const subcategorySlug = decodeURIComponent(params.subcategory || "");
  const categorySlug = decodeURIComponent(params.category || "");
  const locale = await getLocale();

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

  const { subsubcategoryNames } = await getSubSubCategoryData(subsubcategoryId);

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

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto">
      <h1 className="text-3xl text-charade-900 dark:text-gray-100 font-bold mt-6">
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
  );
}