"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PiCaretRight, PiCaretLeft } from "react-icons/pi";
import slugify from "slugify";
import useSWR from "swr";
import {
  PiForkKnife,
  PiBed,
  PiBroom,
  PiShower,
  PiTShirt,
  PiSneaker,
  PiBookOpen,
  PiAirplaneTilt,
  PiBaby,
  PiDesktopTower,
  PiLightbulb,
  PiWrench,
  PiCar,
  PiPaintBrushHousehold,
  PiWashingMachine,
} from "react-icons/pi";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP = {
  "fork-knife": PiForkKnife,
  bed: PiBed,
  "paint-brush-household": PiPaintBrushHousehold,
  broom: PiBroom,
  shower: PiShower,
  "t-shirt": PiTShirt,
  sneaker: PiSneaker,
  "book-open": PiBookOpen,
  "airplane-tilt": PiAirplaneTilt,
  baby: PiBaby,
  "washing-machine": PiWashingMachine,
  "desktop-tower": PiDesktopTower,
  lightbulb: PiLightbulb,
  wrench: PiWrench,
  car: PiCar,
};

const fetcher = (url) => fetch(url).then((res) => res.json());

const CategoryList = ({ locale }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const t = useTranslations("footer");
  const { data: categoriesData, error: categoriesError } = useSWR(
    "/api/categories",
    fetcher
  );

  const {
    data: subcategoriesData,
    error: subcategoriesError,
    isLoading,
  } = useSWR(
    selectedCategory
      ? `/api/subCategories?categoryId=${selectedCategory.id}`
      : null,
    fetcher
  );

  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];

  const createSlug = (text) => {
    return slugify(text, {
      replacement: "-",
      lower: true,
      strict: true,
    }).toLowerCase();
  };

  const getCategoryName = (category) => {
    return locale === "ru"
      ? category.Nume_Categorie_RU
      : category.Nume_Categorie_RO;
  };

  const fetchSubcategories = async (category) => {
    setSelectedCategory(category);
  };

  const goBack = () => {
    setSelectedCategory(null);
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
    if (!selectedCategory || !subcategory) return "";
    const categorySlug = `${createSlug(selectedCategory.Nume_Categorie_RO)}_${
      selectedCategory.id
    }`;
    return `${
      locale === "ru" ? "/ru" : "/ro"
    }/category/${categorySlug}/${createSlug(subcategory.subcategory_name_ro)}_${
      subcategory.id
    }`;
  };

  const generateSubsubcategoryLink = (subcategory, subsub) => {
    if (!selectedCategory || !subcategory || !subsub) return "";
    const categorySlug = `${createSlug(selectedCategory.Nume_Categorie_RO)}_${
      selectedCategory.id
    }`;
    return `${
      locale === "ru" ? "/ru" : "/ro"
    }/category/${categorySlug}/${createSlug(subcategory.subcategory_name_ro)}_${
      subcategory.id
    }/${createSlug(subsub.subsub_name_ro)}_${subsub.id}`;
  };

  const handleImageLoad = (subcategoryId) => {
    setImageLoaded((prev) => ({
      ...prev,
      [subcategoryId]: true,
    }));
  };

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent size={25} /> : null;
  };

  if (!selectedCategory) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4"></h2>
        <ul>
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex gap-2 my-2 justify-between items-center"
            >
              <Link
                href={`${locale === "ru" ? "/ru" : "/ro"}/category/${createSlug(
                  category.Nume_Categorie_RO
                )}_${category.id}`}
                className="text-xl flex items-center gap-5"
              >
                {renderIcon(category.Icons)}
                {getCategoryName(category)}
              </Link>

              <PiCaretRight
                className="cursor-pointer"
                size={23}
                onClick={() => fetchSubcategories(category)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={goBack}
        className="mb-4 hover:underline flex items-center gap-2 mt-10"
      >
        <PiCaretLeft size={23} />
        <p className="text-xl">{t("back")}</p>
      </button>

      <div className="gap-4 p-2 w-full overflow-y-auto">
        {isLoading
          ? [1, 2, 3].map((index) => (
              <div
                key={index}
                className="break-inside-avoid p-3 bg-[#3A3B4A] rounded-lg mb-4"
              >
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-48 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          : subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="break-inside-avoid p-3 bg-[#3A3B4A] rounded-lg mb-4"
              >
                <h3 className="text-xl font-semibold">
                  <Link
                    href={generateSubcategoryLink(subcategory)}
                    className="cursor-pointer hover:text-accent"
                  >
                    {getSubcategoryName(subcategory)}
                  </Link>
                </h3>
                <div className="my-2">
                  <Link
                    href={generateSubcategoryLink(subcategory)}
                    className="block w-full"
                  >
                    {subcategory.images?.length > 0 && (
                      <Image
                        src={subcategory.images[0]}
                        alt={getSubcategoryName(subcategory)}
                        width={400}
                        height={192}
                        className={`w-full h-48 object-cover rounded-md hover:opacity-80 transition-opacity ${
                          !imageLoaded[subcategory.id] ? "hidden" : ""
                        }`}
                        priority
                        onLoad={() => handleImageLoad(subcategory.id)}
                      />
                    )}
                  </Link>
                </div>
                <ul>
                  {subcategory.subSubcategories?.map((subsub) => (
                    <li
                      key={subsub.id}
                      className="text-base text-gray-300 my-1"
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
  );
};

export default CategoryList;
