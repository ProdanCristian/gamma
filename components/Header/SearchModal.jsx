"use client";

import { useState, useRef, useEffect } from "react";
import { PiMagnifyingGlass, PiX, PiStar, PiYoutubeLogo } from "react-icons/pi";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import slugify from "slugify";

// Add this helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  // Handle different YouTube URL formats
  let videoId = "";

  // Regular YouTube URL
  if (url.includes("youtube.com/watch")) {
    videoId = new URL(url).searchParams.get("v");
  }
  // Shortened youtu.be URL
  else if (url.includes("youtu.be")) {
    videoId = url.split("/").pop();
  }
  // Already an embed URL
  else if (url.includes("youtube.com/embed")) {
    return url;
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

const VideoModal = ({ videoUrl, onClose }) => {
  const modalRef = useRef(null);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!embedUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 right-0 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-white hover:text-accent transition-colors rounded-full hover:bg-black/20"
          >
            <PiX size={24} />
          </button>
        </div>
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

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const t = useTranslations("search");
  const router = useRouter();
  const locale = useLocale();
  const [activeVideo, setActiveVideo] = useState(null);

  // Debounced search function
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/meilisearch?q=${encodeURIComponent(searchTerm)}&limit=10`
        );
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.hits);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest("[data-video-modal]")
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      searchInputRef.current?.focus();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const createProductUrl = (product) => {
    const slug = slugify(product.name_ro, {
      replacement: "-",
      lower: true,
      strict: true,
      locale: "ro",
    });
    return `/${locale}/product/${slug}_${product.id}`;
  };

  const handleProductClick = (product) => {
    router.push(createProductUrl(product));
    onClose();
  };

  // Format price with currency
  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("ro-MD", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price) +
      " " +
      t("currency")
    );
  };

  // Update the getImagePath function
  const getImagePath = (imagePath) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, ""); // Remove trailing slash if exists

      // If it's a stringified array, parse it
      if (typeof imagePath === "string" && imagePath.startsWith("[")) {
        const parsed = JSON.parse(imagePath);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const path = parsed[0].path.replace(/^\/+/, ""); // Remove leading slashes
          return `${baseUrl}/${path}`;
        }
      }

      // If it's already a path string
      if (typeof imagePath === "string" && !imagePath.startsWith("[")) {
        const path = imagePath.replace(/^\/+/, ""); // Remove leading slashes
        return `${baseUrl}/${path}`;
      }

      return "/placeholder-image.jpg";
    } catch (e) {
      console.error("Error parsing image path:", e);
      return "/placeholder-image.jpg";
    }
  };

  // Add isFiftyPercentOff calculation function
  const isFiftyPercentOff = (price, discountedPrice) => {
    if (!price || !discountedPrice) return false;
    const originalPrice = parseFloat(price);
    const discountPrice = parseFloat(discountedPrice);
    return (originalPrice - discountPrice) / originalPrice >= 0.5;
  };

  const handleVideoClick = (e, videoUrl) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveVideo(videoUrl);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center h-screen overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white w-full md:w-[95%] min-w-0 md:min-w-[60%] dark:bg-charade-900 max-w-4xl rounded-lg shadow-lg py-6 md:py-10 px-4 md:px-10 relative mt-4 md:mt-0 mx-4 md:mx-0"
        >
          <div className="flex items-center mb-6 w-full justify-between">
            <PiMagnifyingGlass
              size={24}
              className="text-primary dark:text-white mr-2"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-transparent outline-none text-primary dark:text-white text-base md:text-xl placeholder-primary/50 dark:placeholder-white/50"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
            >
              <PiX size={24} />
            </button>
          </div>

          {/* Search Results with max height and scroll */}
          <div className="text-primary dark:text-white">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                  {searchResults.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="relative block md:flex md:items-center space-y-3 md:space-y-0 md:space-x-4 p-3 border border-gray-200 dark:border-charade-800 hover:bg-gray-100 dark:hover:bg-charade-800 rounded-lg cursor-pointer transition-colors overflow-hidden"
                    >
                      {/* Product tags container */}
                      <div className="absolute top-0 right-0 flex flex-col gap-1 z-10">
                        {product.is_bestseller && (
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded-bl-lg text-xs font-bold flex items-center">
                            <PiStar className="mr-1" />
                            {t("bestseller")}
                          </div>
                        )}
                      </div>

                      <div className="relative w-20 h-20 md:w-16 md:h-16 flex-shrink-0 mx-auto md:mx-0">
                        <Image
                          src={getImagePath(product.main_image)}
                          alt={
                            locale === "ro" ? product.name_ro : product.name_ru
                          }
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-grow pr-4 md:pr-16 text-center md:text-left">
                        <h3 className="font-medium text-sm md:text-base">
                          {locale === "ro" ? product.name_ro : product.name_ru}
                        </h3>
                        <div className="mt-1">
                          {product.has_discount ? (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                              <span className="line-through text-gray-400 text-sm">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-red-500 font-medium text-sm">
                                {formatPrice(product.discounted_price)}
                              </span>
                              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                                -{product.discount_percentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium text-sm">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        {/* Video button moved here and resized */}
                        {product.video && (
                          <button
                            onClick={(e) => handleVideoClick(e, product.video)}
                            className="mt-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors mx-auto md:mx-0"
                          >
                            <PiYoutubeLogo size={20} />
                            <span className="text-sm">{t("watchVideo")}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* View all results button */}
                <button
                  onClick={() => {
                    router.push(
                      `/${locale}/search?q=${encodeURIComponent(searchTerm)}`
                    );
                    onClose();
                  }}
                  className="w-full py-3 text-center bg-accent text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-charade-800 rounded-lg transition-colors mt-4 text-sm md:text-base"
                >
                  {t("viewAllResults")}
                </button>
              </div>
            ) : searchTerm ? (
              <p className="text-center py-4 text-sm md:text-base">
                {t("noResults")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {activeVideo && (
        <div data-video-modal>
          <VideoModal
            videoUrl={activeVideo}
            onClose={() => setActiveVideo(null)}
          />
        </div>
      )}
    </>
  );
};

export default SearchModal;
