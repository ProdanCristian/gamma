import React from "react";
import { getTranslations } from "next-intl/server";

const formatCategoryName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function getSubSubCategoryNames(id) {
  try {
    const baseUrl = "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/catNames/subSubCat?id=${id}`, { revalidate: 3600 }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching subsubcategory names:", error);
    return null;
  }
}

export default async function SubSubCategoryPage(props) {
  const t = await getTranslations("Category");
  const params = await props.params;
  const subsubcategorySlug = decodeURIComponent(params.subsubcategory);
  const locale = params.locale;

  const subsubcategoryId = subsubcategorySlug.split("_")[1];

  if (!subsubcategoryId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("invalidSubSubCategoryId")}
        </h1>
        <p className="text-gray-500 mt-2">{t("checkUrlAndTryAgain")}</p>
      </div>
    );
  }

  try {
    const subsubcategoryNames = await getSubSubCategoryNames(subsubcategoryId);

    const getSubSubCategoryName = () => {
      if (locale === "ro") {
        return (
          subsubcategoryNames?.Nume_SubSubCategorie_RO ||
          formatCategoryName(subsubcategorySlug.split("_")[0])
        );
      } else if (locale === "ru") {
        return (
          subsubcategoryNames?.Nume_SubSubCategorie_RU ||
          formatCategoryName(subsubcategorySlug.split("_")[0])
        );
      }
      return formatCategoryName(subsubcategorySlug.split("_")[0]);
    };

    return (
      <div className="max-w-[1250px] w-[90vw] mx-auto">
        <h1 className="text-2xl text-charade-900 dark:text-gray-100 font-bold mt-6">
          {getSubSubCategoryName()}
        </h1>
        {/* Add your subsubcategory content here */}
      </div>
    );
  } catch (error) {
    console.error("Error in SubSubCategoryPage:", error);
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-500">
          {t("errorLoadingSubSubCategory")}
        </h1>
        <p className="text-gray-500 mt-2">{t("tryAgainLater")}</p>
      </div>
    );
  }
}
