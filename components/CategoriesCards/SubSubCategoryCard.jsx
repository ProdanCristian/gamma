"use client";

import Link from "next/link";
import slugify from "slugify";

const SubSubCategoryCard = ({ subSubCategory, locale, path }) => {
  const getName = () => {
    return locale === "ru"
      ? subSubCategory.subsub_name_ru
      : subSubCategory.subsub_name_ro;
  };

  const generateSubSubcategoryLink = () => {
    return `${path}/${slugify(subSubCategory.subsub_name_ro, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    })}_${subSubCategory.id}`;
  };

  return (
    <Link href={generateSubSubcategoryLink()}>
      <div className="group flex bg-transparent flex-col items-center border border-gray-200 dark:border-gray-700 hover:border-accent dark:hover:border-accent h-full rounded-xl overflow-hidden p-4 transition-colors duration-200">
        <h2 className="text-center font-bold text-base text-charade-900 dark:text-gray-100 group-hover:text-accent transition-colors duration-200">
          {getName()}
        </h2>
      </div>
    </Link>
  );
};

export default SubSubCategoryCard;
