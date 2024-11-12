"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import SearchProductCard from "@/components/Shop/SearchProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PiX, PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { Button } from "@/components/ui/button";

interface SearchProduct {
  id: number;
  name_ro: string;
  name_ru: string;
  price: number;
  discounted_price: number | null;
  main_image: string;
  stock: number;
  video?: string;
  is_bestseller?: boolean;
  has_discount: boolean;
  discount_percentage: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalHits: number;
  productsPerPage: number;
}

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal = ({ videoUrl, onClose }: VideoModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const embedUrl = useMemo(() => {
    if (!videoUrl) return null;

    let videoId = "";

    if (videoUrl.includes("youtube.com/watch")) {
      const urlParams = new URL(videoUrl).searchParams;
      const v = urlParams.get("v");
      if (v) videoId = v;
    } else if (videoUrl.includes("youtu.be")) {
      const id = videoUrl.split("/").pop();
      if (id) videoId = id;
    } else if (videoUrl.includes("youtube.com/embed")) {
      return videoUrl;
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }, [videoUrl]);

  if (!embedUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-[90%] max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-accent transition-colors"
        >
          <PiX size={24} />
        </button>
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalHits: 0,
    productsPerPage: 12,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("search");
  const locale = useLocale();

  useEffect(() => {
    const fetchProducts = async () => {
      const query = searchParams.get("q") || "";
      const page = parseInt(searchParams.get("page") || "1");

      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/meilisearch?q=${encodeURIComponent(
            query
          )}&page=${page}&limit=12`
        );
        const data = await response.json();

        if (data.success) {
          setProducts(data.hits);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handlePageChange = (pageNumber: number) => {
    const query = searchParams.get("q") || "";
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", pageNumber.toString());

    router.push(`/${locale}/search?${newSearchParams.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(12)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4"
          >
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto my-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("searchResults")}</h1>
        {products.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            {t.rich("Found Products", { count: pagination.totalHits })}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <SearchProductCard
                key={product.id}
                product={product}
                onVideoClick={(url) => setActiveVideo(url)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <PiArrowLeft />
              </Button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <Button
                  key={page}
                  variant={
                    pagination.currentPage === page ? "default" : "outline"
                  }
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <PiArrowRight />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-4">{t("noResults")}</p>
      )}

      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;
