"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import SmallProductCard from "@/components/Shop/SmallProductCard";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  PiArrowLeft,
  PiArrowRight,
  PiShoppingCartSimple,
  PiFunnelSimple,
} from "react-icons/pi";
import FilterSidebar from "@/components/Shop/FilterSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

interface AttributeMap {
  [key: string]: string;
}

interface Product {
  id: string;
}

interface PaginationData {
  totalPages: number;
  totalProducts: number;
}

interface ApiResponse {
  products: Product[];
  pagination: PaginationData;
}

interface MaxPriceResponse {
  maxPrice: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DiscountsPage() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [maxPrice, setMaxPrice] = useState(50000);
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "50000"),
  ]);
  const [showBestsellers, setShowBestsellers] = useState(
    searchParams.get("bestsellers") === "true"
  );
  // Always true for discounts page
  const showDiscounted = true;
  const setShowDiscounted = () => {}; // Empty function since we don't need to change it
  const productsPerPage = 12;

  const [selectedAttributes, setSelectedAttributes] = useState<AttributeMap>(
    () => {
      const attrs: AttributeMap = {};
      for (const [key, value] of searchParams.entries()) {
        if (key.startsWith("attr_")) {
          attrs[key.replace("attr_", "")] = value;
        }
      }
      return attrs;
    }
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    searchParams.get("color")
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.get("brand")
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-MD", {
      style: "currency",
      currency: "MDL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const maxPriceUrl = `/api/products/maxPrice?bestsellers=${showBestsellers}&discounted=true${Object.entries(
    selectedAttributes
  )
    .filter(([_, value]) => value !== "all")
    .map(([id, value]) => `&attr_${id}=${encodeURIComponent(String(value))}`)
    .join("")}`;

  const apiUrl = `/api/products/allProducts?page=${currentPage}&limit=${productsPerPage}&minPrice=${
    priceRange[0]
  }&maxPrice=${priceRange[1]}&bestsellers=${showBestsellers}&discounted=true${
    selectedColor ? `&color=${selectedColor}` : ""
  }${selectedBrand ? `&brand=${selectedBrand}` : ""}${Object.entries(
    selectedAttributes
  )
    .filter(([_, value]) => value !== "all")
    .map(([id, value]) => `&attr_${id}=${encodeURIComponent(String(value))}`)
    .join("")}`;

  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    // Only add parameters if they differ from default values
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < maxPrice)
      params.set("maxPrice", priceRange[1].toString());
    if (showBestsellers) params.set("bestsellers", "true");
    if (selectedColor) params.set("color", selectedColor);
    if (selectedBrand) params.set("brand", selectedBrand);

    Object.entries(selectedAttributes).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(`attr_${key}`, value);
      }
    });

    if (currentPage > 1) params.set("page", currentPage.toString());

    const queryString = params.toString();
    router.replace(
      `/${locale}/shop/discounts${queryString ? `?${queryString}` : ""}`,
      { scroll: false }
    );
  };

  // Add effect to reset URL when filters are cleared
  useEffect(() => {
    const hasActiveFilters =
      priceRange[0] > 0 ||
      priceRange[1] < maxPrice ||
      showBestsellers ||
      selectedColor ||
      selectedBrand ||
      Object.values(selectedAttributes).some((value) => value !== "all") ||
      currentPage > 1;

    if (!hasActiveFilters) {
      router.replace(`/${locale}/shop/discounts`, { scroll: false });
    } else {
      updateUrlWithFilters();
    }
  }, [
    currentPage,
    priceRange,
    showBestsellers,
    selectedAttributes,
    selectedColor,
    selectedBrand,
  ]);

  // Update URL when any parameter changes
  useEffect(() => {
    updateUrlWithFilters();
  }, [
    currentPage,
    priceRange,
    showBestsellers,
    selectedAttributes,
    selectedColor,
    selectedBrand,
  ]);

  // Update type for the SWR responses
  const { data: maxPriceData } = useSWR<MaxPriceResponse>(maxPriceUrl, fetcher);
  const { data, error, isLoading } = useSWR<ApiResponse>(apiUrl, fetcher);

  const products = data?.products || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalProducts = data?.pagination?.totalProducts || 0;

  const { data: attributesData } = useSWR(
    "/api/products/discountedFilters/attributes",
    fetcher
  );
  const { data: colorsData } = useSWR(
    "/api/products/discountedFilters/colors",
    fetcher
  );
  const { data: brandsData } = useSWR(
    "/api/products/discountedFilters/brands",
    fetcher
  );

  // Add these handlers from the shop page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (maxPriceData?.maxPrice) {
      const newMaxPrice = maxPriceData.maxPrice;
      setMaxPrice(newMaxPrice);
      setPriceRange([0, newMaxPrice]);
    }
  }, [maxPriceData?.maxPrice]);

  // Add new effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    priceRange,
    showBestsellers,
    selectedAttributes,
    selectedColor,
    selectedBrand,
  ]);

  // Add structured data for SEO
  if (!t) return null; // Early return if translations aren't loaded

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: (t as any)("Discounted Products"),
    description: (t as any)
      .rich("Found Products", { count: totalProducts || 0 })
      .toString(),
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
          name: locale === "ru" ? "Магазин" : "Magazin",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: (t as any)("Discounted Products"),
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/shop/discounts`,
        },
      ],
    },
    offers: {
      "@type": "AggregateOffer",
      offerCount: totalProducts || 0,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <Script
        id="discounts-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-[1250px] w-[90vw] mx-auto mt-5 min-h-screen">
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
                href="/shop"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {locale === "ru" ? "Магазин" : "Magazin"}
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-200">
                {t("Discounted Products")}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-8 md:mb-0 mt-10">
          <h1 className="text-3xl font-bold">{t("Discounted Products")}</h1>
        </div>

        {/* Total products count */}
        <div className="mb-4 w-full flex justify-between md:flex-row-reverse">
          {t.rich("Found Products", { count: totalProducts })}
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <PiFunnelSimple className="h-5 w-5 mr-2" />
                {t("Filters")}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] p-0 border-r-accent dark:bg-charade-900"
            >
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>{t("Filters")}</SheetTitle>
              </SheetHeader>
              <FilterSidebar
                showDiscounted={showDiscounted}
                setShowDiscounted={setShowDiscounted}
                showBestsellers={showBestsellers}
                setShowBestsellers={setShowBestsellers}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
                selectedAttributes={selectedAttributes}
                setSelectedAttributes={setSelectedAttributes}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                attributesData={attributesData}
                colorsData={colorsData}
                brandsData={brandsData}
                formatPrice={formatPrice}
                hideDiscountFilter={true}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-6 min-h-screen">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              showDiscounted={showDiscounted}
              setShowDiscounted={setShowDiscounted}
              showBestsellers={showBestsellers}
              setShowBestsellers={setShowBestsellers}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              maxPrice={maxPrice}
              selectedAttributes={selectedAttributes}
              setSelectedAttributes={setSelectedAttributes}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              attributesData={attributesData}
              colorsData={colorsData}
              brandsData={brandsData}
              formatPrice={formatPrice}
              hideDiscountFilter={true}
            />
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
              {isLoading
                ? Array(12)
                    .fill(0)
                    .map((_, index) => (
                      <SmallProductCard key={index} product={{}} loading />
                    ))
                : products.map((product: Product) => (
                    <SmallProductCard key={product.id} product={product} />
                  ))}
            </div>

            {/* No products found message */}
            {!isLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-4">
                <PiShoppingCartSimple className="w-16 h-16" />
                <div className="text-xl font-medium">{t("We're Sorry")}</div>
                <div className="text-center max-w-md">{t("sorry_message")}</div>
                <Button
                  onClick={() => {
                    // First reset all states
                    setShowBestsellers(false);
                    setPriceRange([0, maxPrice]);
                    setSelectedAttributes({});
                    setSelectedColor(null);
                    setSelectedBrand(null);
                    setCurrentPage(1);

                    // Only clear query parameters while keeping the current path
                    const currentPath = window.location.pathname;
                    window.history.replaceState({}, "", currentPath);

                    // Force a re-fetch of the data
                    router.refresh();
                  }}
                  className="mt-4"
                >
                  {t("Reset Filters")}
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <PiArrowLeft />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <PiArrowRight />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
