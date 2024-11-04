"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import slugify from "slugify";
import SubCategoriesDropDown from "./SubCategoriesDropDown";
import {
  PiDotsThreeBold,
  PiCaretDownBold,
  PiCaretRightBold,
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

export default function CategorieDropDown() {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownOpacity, setDropdownOpacity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  const hoverTimeoutRef = useRef();

  const pathname = usePathname();
  const locale = useLocale();

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  const getHoveredCategory = () => {
    return categories.find((category) => category.id === hoveredCategoryId);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
          if (isHomePage) {
            showDropdown();
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isHomePage]);

  useEffect(() => {
    if (isHomePage && categories.length > 0) {
      showDropdown();
    } else if (!isHomePage) {
      hideDropdown();
    }
  }, [pathname, categories.length, isHomePage]);

  const calculateDropdownHeight = () => {
    if (categoriesRef.current) {
      const height = categoriesRef.current.scrollHeight;
      setDropdownHeight(height);
    }
  };

  const showDropdown = () => {
    setIsTransitioning(true);
    setIsDropdownOpen(true);
    setIsVisible(true);
    requestAnimationFrame(() => {
      calculateDropdownHeight();
      setDropdownOpacity(1);
      setTimeout(() => setIsTransitioning(false), 300);
    });
  };

  const hideDropdown = () => {
    setIsTransitioning(true);
    setIsVisible(false);
    setDropdownOpacity(0);
    setTimeout(() => {
      setIsDropdownOpen(false);
      setIsTransitioning(false);
    }, 300);
  };

  const handleMouseEnter = (categoryId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategoryId(categoryId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setHoveredCategoryId(null);
      }
    }, 100);
  };

  const toggleDropdown = () => {
    if (!isHomePage) {
      if (isVisible) {
        hideDropdown();
      } else {
        showDropdown();
      }
    }
  };

  const getCategoryName = (category) => {
    return locale === "ru"
      ? category.Nume_Categorie_RU
      : category.Nume_Categorie_RO;
  };

  const createSlug = (category) => {
    return `${slugify(category.Nume_Categorie_RO, {
      replacement: "-",
      lower: true,
      strict: true,
    }).toLowerCase()}_${category.id}`;
  };

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  return (
    <div className="relative hidden lg:block z-20">
      <button
        className={`bg-accent px-4 flex py-2 items-center w-[315px] justify-between gap-5 ${
          isHomePage ? "cursor-default" : "cursor-pointer"
        }`}
        onClick={toggleDropdown}
      >
        <PiDotsThreeBold className="mr-2" size={23} />
        <p>{locale === "ru" ? "Все категории" : "Toate categoriile"}</p>
        <PiCaretDownBold className="ml-2" size={20} />
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className={`dropdown-menu absolute flex dark:bg-charade-950 bg-white border rounded-b-xl border-accent dark:border-accent-10 overflow-hidden z-10 transition-all duration-300 ${
            !isVisible ? "invisible opacity-0" : "visible opacity-100"
          }`}
          style={{
            width: hoveredCategoryId ? "90vw" : "315px",
            maxWidth: hoveredCategoryId ? "1250px" : "315px",
            height: `${dropdownHeight}px`,
          }}
          onMouseLeave={handleMouseLeave}
        >
          <ul ref={categoriesRef} className="categories w-[314px]">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`px-4 py-[6px] cursor-pointer flex items-center justify-between relative ${
                  hoveredCategoryId === category.id
                    ? "bg-hovered-category"
                    : "dark:hover:bg-[#4A4B59] hover:bg-gray-100"
                }`}
                onMouseEnter={() => handleMouseEnter(category.id)}
              >
                <Link
                  href={`/${locale}/category/${createSlug(category)}`}
                  className="flex justify-between w-full items-center"
                  onClick={hideDropdown}
                >
                  <div className="flex items-center gap-4">
                    {renderIcon(category.Icons)}
                    <span>{getCategoryName(category)}</span>
                  </div>
                  <PiCaretRightBold size={20} />
                </Link>
              </li>
            ))}
          </ul>

          {hoveredCategoryId && getHoveredCategory() && !isTransitioning && (
            <SubCategoriesDropDown
              categoryId={hoveredCategoryId}
              categorySlug={createSlug(getHoveredCategory())}
            />
          )}
        </div>
      )}
    </div>
  );
}
