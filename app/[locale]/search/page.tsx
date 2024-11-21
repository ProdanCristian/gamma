import { getTranslations } from "next-intl/server";
import SearchClient from "./Search";

export const generateStaticParams = async () => {
  return [{ locale: "ru" }, { locale: "ro" }];
};

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <SearchClient
      translations={{
        searchResults: t("searchResults"),
        foundProducts: t("Found Products"),
        noResults: t("noResults"),
      }}
    />
  );
}
