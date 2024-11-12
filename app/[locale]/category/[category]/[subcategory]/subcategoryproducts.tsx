"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PiArrowLeft,
  PiArrowRight,
  PiFunnelSimple,
  PiShoppingCartSimple,
} from "react-icons/pi";
import { useRouter, useSearchParams } from "next/navigation";
import SmallProductCard from "@/components/Shop/SmallProductCard";
import FilterSidebar from "@/components/Shop/FilterSidebar";

interface SubCategoryProductsProps {
  subcategoryId: string;
  categoryId: string;
  categoryName: string;
  subcategoryName: string;
  locale: string;
}

interface AttributesState {
  [key: string]: string;
}

interface Product {
  id: number;
  // add other product properties as needed
}

interface ProductsData {
  success: boolean;
  products: Product[];
  pagination: {
    totalProducts: number;
    totalPages: number;
  };
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export default function SubCategoryProducts({
  subcategoryId,
  categoryId,
  categoryName,
  subcategoryName,
  locale,
}: SubCategoryProductsProps) {
  const t = useTranslations("shop");
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
  const [showDiscounted, setShowDiscounted] = useState(
    searchParams.get("discounted") === "true"
  );
  const [selectedAttributes, setSelectedAttributes] = useState<AttributesState>(
    () => {
      const attrs: AttributesState = {};
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

  // Construct products URL
  const productsUrl = `/api/products/subCategoryProducts?subCategoryId=${subcategoryId}&page=${currentPage}&limit=12&minPrice=${
    priceRange[0]
  }&maxPrice=${
    priceRange[1]
  }&bestsellers=${showBestsellers}&discounted=${showDiscounted}${
    selectedColor ? `&color=${selectedColor}` : ""
  }${selectedBrand ? `&brand=${selectedBrand}` : ""}${Object.entries(
    selectedAttributes
  )
    .filter(([_, value]) => value !== "all")
    .map(([id, value]) => `&attr_${id}=${encodeURIComponent(value)}`)
    .join("")}`;

  // Fetch products data
  const {
    data: productsData,
    error: productsError,
    isLoading,
  } = useSWR<ProductsData>(productsUrl, fetcher);

  const products = productsData?.products || [];
  const totalPages = productsData?.pagination?.totalPages || 1;
  const totalProducts = productsData?.pagination?.totalProducts || 0;

  // Fetch filter data
  const { data: attributesData } = useSWR(
    `/api/products/subCategoryFilters/attributes?subCategoryId=${subcategoryId}`,
    fetcher
  );
  const { data: colorsData } = useSWR(
    `/api/products/subCategoryFilters/colors?subCategoryId=${subcategoryId}`,
    fetcher
  );
  const { data: brandsData } = useSWR(
    `/api/products/subCategoryFilters/brands?subCategoryId=${subcategoryId}`,
    fetcher
  );

  // Construct maxPrice URL
  const maxPriceUrl = `/api/products/maxPrice?subCategoryId=${subcategoryId}&bestsellers=${showBestsellers}&discounted=${showDiscounted}${Object.entries(
    selectedAttributes
  )
    .filter(([_, value]) => value !== "all")
    .map(([id, value]) => `&attr_${id}=${encodeURIComponent(value)}`)
    .join("")}`;

  // Fetch maxPrice
  const { data: maxPriceData } = useSWR(maxPriceUrl, fetcher);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-MD", {
      style: "currency",
      currency: "MDL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < maxPrice)
      params.set("maxPrice", priceRange[1].toString());
    if (showBestsellers) params.set("bestsellers", "true");
    if (showDiscounted) params.set("discounted", "true");
    if (selectedColor) params.set("color", selectedColor);
    if (selectedBrand) params.set("brand", selectedBrand);

    Object.entries(selectedAttributes).forEach(([key, value]) => {
      if (value !== "all") {
        params.set(`attr_${key}`, value);
      }
    });

    if (currentPage > 1) params.set("page", currentPage.toString());

    const queryString = params.toString();
    router.push(
      `/${locale}/category/${categoryName}_${categoryId}/${subcategoryName}_${subcategoryId}${
        queryString ? `?${queryString}` : ""
      }`,
      { scroll: false }
    );
  };

  // Update URL when filters change
  useEffect(() => {
    updateUrlWithFilters();
  }, [
    currentPage,
    priceRange,
    showBestsellers,
    showDiscounted,
    selectedAttributes,
    selectedColor,
    selectedBrand,
  ]);

  // Update maxPrice when maxPriceData changes
  useEffect(() => {
    if (maxPriceData?.maxPrice) {
      const newMaxPrice = maxPriceData.maxPrice;
      setMaxPrice(newMaxPrice);
      setPriceRange([0, newMaxPrice]);
    }
  }, [maxPriceData?.maxPrice]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    priceRange,
    showBestsellers,
    showDiscounted,
    selectedAttributes,
    selectedColor,
    selectedBrand,
  ]);

  return (
    <>
      <div className="mb-4 w-full flex justify-between md:flex-row-reverse">
        {totalProducts !== undefined &&
          t.rich("Found Products", { count: totalProducts })}
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
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-6 min-h-screen">
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
          />
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
            {isLoading ? (
              Array(12)
                .fill(0)
                .map((_, index) => (
                  <SmallProductCard key={index} product={{}} loading />
                ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <SmallProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground space-y-4">
                <PiShoppingCartSimple className="w-16 h-16" />
                <div className="text-xl font-medium">{t("We're Sorry")}</div>
                <div className="text-center max-w-md">{t("sorry_message")}</div>
                <button
                  onClick={() => {
                    setShowDiscounted(false);
                    setShowBestsellers(false);
                    setPriceRange([0, maxPrice]);
                    setSelectedAttributes({});
                    setSelectedColor("");
                    setSelectedBrand("");
                    setCurrentPage(1);
                    router.push(
                      `/${locale}/category/${categoryName}_${categoryId}/${subcategoryName}_${subcategoryId}`
                    );
                  }}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {t("Reset Filters")}
                </button>
              </div>
            )}
          </div>

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
    </>
  );
}
