"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import slugify from "slugify";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubcategoriesGrid({ categoryId, categorySlug }) {
  const [subcategories, setSubcategories] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/subCategories?categoryId=${categoryId}`
        );
        const data = await response.json();

        if (data.success) {
          setSubcategories(data.data);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError(error.message);
        setSubcategories(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  const createSlug = (item, isSubsub = false) => {
    const name = isSubsub ? item.subsub_name_ro : item.subcategory_name_ro;
    return slugify(name, {
      replacement: "-",
      lower: true,
      strict: true,
    });
  };

  const getSubcategoryName = (subcategory) => {
    return locale === "ru"
      ? subcategory.subcategory_name_ru || "Unnamed"
      : subcategory.subcategory_name_ro || "Unnamed";
  };

  const getSubsubName = (subsub) => {
    return locale === "ru"
      ? subsub.subsub_name_ru || "Unnamed"
      : subsub.subsub_name_ro || "Unnamed";
  };

  const generateSubcategoryLink = (subcategory) => {
    if (!categorySlug || !subcategory) return "";
    return `/${locale}/category/${categorySlug}/${createSlug(subcategory)}_${
      subcategory.id
    }`;
  };

  const generateSubsubcategoryLink = (subcategory, subsub) => {
    if (!categorySlug || !subcategory || !subsub) return "";
    return `/${locale}/category/${categorySlug}/${createSlug(subcategory)}_${
      subcategory.id
    }/${createSlug(subsub, true)}_${subsub.id}`;
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!subcategories) {
    return null;
  }

  return (
    <div className="flex w-[calc(100%-314px)]">
      <div className="flex-1 p-2 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
          {subcategories?.map((subcategory) => (
            <div
              key={subcategory.id}
              className="p-3 bg-gray-100 dark:bg-[#3A3B4A] rounded-md mb-4"
            >
              <h3 className="text-xl font-semibold">
                <Link
                  href={generateSubcategoryLink(subcategory)}
                  className="cursor-pointer hover:text-accent"
                >
                  {getSubcategoryName(subcategory)}
                </Link>
              </h3>

              <div className="my-2 relative">
                <Link
                  href={generateSubcategoryLink(subcategory)}
                  className="block w-full h-48"
                >
                  {isLoading ? (
                    <Skeleton className="w-full h-48 rounded-md" />
                  ) : subcategory.images[0] ? (
                    <Image
                      src={subcategory.images[0]}
                      alt={getSubcategoryName(subcategory)}
                      fill
                      className="object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <Skeleton className="w-full h-48 rounded-md" />
                  )}
                </Link>
              </div>

              <ul>
                {subcategory.subSubcategories.map((subsub) => (
                  <li
                    key={subsub.id}
                    className="text-gray-600 dark:text-gray-300 text-base my-1"
                  >
                    <Link
                      href={generateSubsubcategoryLink(subcategory, subsub)}
                      className="cursor-pointer hover:text-accent"
                    >
                      {getSubsubName(subsub)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
