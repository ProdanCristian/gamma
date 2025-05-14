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

  const handleLanguageChange = async (newLocale) => {
    try {
      const response = await fetch('/api/subscriptions/update-lang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lang: newLocale })
      });
      
      const result = await response.json();
      console.log('Language update result:', result);
      
      router.replace(pathname, { locale: newLocale });
    } catch (error) {
      console.error('Failed to update subscription language:', error);
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <span className="sr-only">Toggle language</span>
          <span className="ml-2 hidden md:block">{languages[locale]}</span>
          <PiGlobe className="h-7 w-7 md:h-[1.2rem] md:w-[1.2rem] hover:text-accent transition-colors" />
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
