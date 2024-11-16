"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PiArrowCounterClockwise } from "react-icons/pi";
import { useRouter } from "next/navigation";

const FilterSidebar = ({
  showDiscounted,
  setShowDiscounted,
  showBestsellers,
  setShowBestsellers,
  priceRange,
  setPriceRange,
  maxPrice,
  selectedAttributes,
  setSelectedAttributes,
  selectedColor,
  setSelectedColor,
  selectedBrand,
  setSelectedBrand,
  attributesData,
  colorsData,
  brandsData,
  formatPrice,
  hideDiscountFilter = false,
  hideBestsellerFilter = false,
}) => {
  const t = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();

  const isLoading = !attributesData || !colorsData || !brandsData || !maxPrice;

  const handleResetFilters = () => {
    setShowDiscounted(false);
    setShowBestsellers(false);
    setPriceRange([0, maxPrice]);
    setSelectedAttributes({});
    setSelectedColor(null);
    setSelectedBrand(null);

    // Only clear query parameters while keeping the current path
    const currentPath = window.location.pathname;
    window.history.replaceState({}, "", currentPath);

    // Force a re-fetch of the data
    router.refresh();
  };

  const handleAttributeChange = (attributeId, value) => {
    setSelectedAttributes((prev) => {
      const newAttributes = { ...prev };
      if (value === "all") {
        delete newAttributes[attributeId];
      } else {
        newAttributes[attributeId] = value;
      }
      return newAttributes;
    });
  };

  const handleColorChange = (colorId) => {
    setSelectedColor(selectedColor === colorId ? null : colorId);
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value === "all" ? null : value);
  };

  return (
    <div className="h-full md:h-screen p-6 border-0 lg:border lg:border-gray-200 dark:border-charade-700 lg:rounded-xl flex flex-col w-full lg:w-[280px]">
      <div className="flex items-center justify-center md:justify-between mb-4">
        <div className="text-lg font-semibold hidden lg:block">
          {t("Filters")}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <PiArrowCounterClockwise className="h-4 w-4 mr-2" />
          {t("Reset")}
        </Button>
      </div>

      <div className="space-y-6 overflow-y-auto p-2">
        {/* Discounted Products Filter */}
        {!hideDiscountFilter && (
          <div className="flex items-center space-x-2">
            <Switch
              id="discounted"
              checked={showDiscounted}
              onCheckedChange={setShowDiscounted}
            />
            <Label htmlFor="discounted">
              {t("Show Discounted Products Only")}
            </Label>
          </div>
        )}

        {/* Bestsellers Filter */}
        {!hideBestsellerFilter && (
          <div className="flex items-center space-x-2">
            <Switch
              id="bestsellers"
              checked={showBestsellers}
              onCheckedChange={setShowBestsellers}
            />
            <Label htmlFor="bestsellers">{t("Show Bestsellers Only")}</Label>
          </div>
        )}

        {/* Price Range Filter */}
        <div className="space-y-2">
          <Label>{t("Price Range")}</Label>
          {isLoading ? (
            <>
              <Skeleton className="w-full h-5 rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            </>
          ) : (
            <>
              <Slider
                defaultValue={[0, maxPrice]}
                min={0}
                max={maxPrice}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </>
          )}
        </div>
        {/* Updated Color Filters */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <div className="flex flex-wrap gap-2 w-full">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ))}
            </div>
          </div>
        ) : (
          colorsData?.colors &&
          colorsData.colors.length > 0 && (
            <div className="space-y-2">
              <Label>{t("Color")}</Label>
              <div className="flex flex-wrap gap-2">
                {colorsData.colors.map((color) => (
                  <Tooltip.Provider key={color.id} delayDuration={0}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => handleColorChange(color.id)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color.id
                              ? "border-accent scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.Cod_Culoare }}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                          sideOffset={5}
                          side="top"
                        >
                          {locale === "ru"
                            ? color.Culoare_RU_
                            : color.Culoare_RO_}
                          <Tooltip.Arrow className="fill-popover" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                ))}
              </div>
            </div>
          )
        )}

        {/* Updated Brand Filter */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-10 rounded-md" />
          </div>
        ) : (
          brandsData?.brands &&
          brandsData.brands.length > 0 && (
            <div className="space-y-2">
              <Label>{t("Brand")}</Label>
              <Select
                value={selectedBrand || "all"}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select Brand")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Brands")}</SelectItem>
                  {brandsData.brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.Denumire_Brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        )}

        {/* Updated Attribute Filters */}
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2 w-full">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10 rounded-md" />
                </div>
              ))
          : attributesData?.attributes?.map(
              (attribute) =>
                attribute.values &&
                attribute.values.length > 0 && (
                  <div key={attribute.id} className="space-y-2">
                    <Label>
                      {locale === "ru"
                        ? attribute.Atribut_RU_
                        : attribute.Atribut_RO_}
                    </Label>
                    <Select
                      value={selectedAttributes[attribute.id] || "all"}
                      onValueChange={(value) =>
                        handleAttributeChange(attribute.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("All")}</SelectItem>
                        {attribute.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
            )}
      </div>
    </div>
  );
};

export default FilterSidebar;
