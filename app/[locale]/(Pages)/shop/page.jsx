"use client";

import React, { useState } from "react";
import useSWR from "swr";
import SmallProductCard from "@/components/Shop/SmallProductCard";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ShopPage = () => {
  const t = useTranslations("shop");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const { data, error, isLoading } = useSWR(
    "/api/products/allProducts?limit=1000",
    fetcher
  );

  console.log("Products data:", data?.products);

  if (error) return <div>Failed to load products</div>;

  const products = data?.products || [];
  const totalPages = Math.ceil(products.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto mt-5">
      <h1 className="text-3xl font-bold mb-8">{t("All Products")}</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
        {isLoading
          ? Array(12)
              .fill(0)
              .map((_, index) => (
                <SmallProductCard key={index} product={{}} loading />
              ))
          : currentProducts.map((product) => (
              <SmallProductCard key={product.id} product={product} />
            ))}
      </div>

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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

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
  );
};

export default ShopPage;
