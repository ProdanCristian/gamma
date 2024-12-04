import { useTranslations } from "next-intl";

export default function Offline() {
  const t = useTranslations("offline");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <p className="text-center">{t("description")}</p>
    </div>
  );
}
