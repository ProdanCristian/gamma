"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import slugify from "slugify";

const SubcategoryCard = ({ subcategory, locale, path }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getName = () => {
    return locale === "ru"
      ? subcategory.subcategory_name_ru || subcategory.subcategory_name_ro
      : subcategory.subcategory_name_ro;
  };

  const generateSubcategoryLink = () => {
    return `${path}/${slugify(subcategory.subcategory_name_ro, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    })}_${subcategory.id}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const hasValidImage = subcategory.images?.[0] && !imageError;

  return (
    <div className="group flex h-full bg-transparent flex-col items-center border border-gray-200 dark:border-gray-700 hover:border-accent rounded-xl overflow-hidden dark:hover:border-accent transition-colors duration-200">
      <Link href={generateSubcategoryLink()} className="flex-col w-full h-full">
        <div className="relative w-full h-48">
          {!imageLoaded && (
            <div className="absolute inset-0 w-full h-full animate-pulse bg-gray-200 dark:bg-charade-900" />
          )}

          {hasValidImage ? (
            <Image
              src={subcategory.images[0]}
              alt={getName()}
              width={224}
              height={192}
              className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                No image available
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-center text-base font-bold text-charade-900 dark:text-gray-100 group-hover:text-accent transition-colors duration-200">
            {getName()}
          </h2>
        </div>
      </Link>
    </div>
  );
};

export default SubcategoryCard;
