"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiGlobe } from "react-icons/pi";

const languages = {
  ro: "Română",
  ru: "Русский",
};

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <span className="sr-only">Toggle language</span>
          <span className="ml-2">{languages[locale]}</span>
          <PiGlobe className="h-6 w-6 md:h-[1.2rem] md:w-[1.2rem]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-charade-600 border-charade-200"
      >
        {Object.entries(languages).map(([lang, label]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
