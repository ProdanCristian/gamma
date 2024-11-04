"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MenuFooter() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const locale = useLocale();

  const links = [
    { href: "/shop", key: "shop" },
    { href: "/shop/discounts", key: "discounts" },
    { href: "/shop/bestsellers", key: "bestsellers" },
    { href: "/about", key: "about" },
    { href: "/contact", key: "contact" },
    { href: "/delivery", key: "delivery" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {links.map(({ href, key }) => {
        const localizedHref = `/${locale}${href}`;
        const isActive = pathname === localizedHref;

        return (
          <Link
            key={href}
            href={localizedHref}
            className={cn(
              "mr-2 dark:text-charade-300 text-charade-700 dark:hover:text-accent hover:text-accent transition-colors ",
              isActive && "text-accent dark:text-accent"
            )}
          >
            {t(key)}
          </Link>
        );
      })}
    </div>
  );
}
