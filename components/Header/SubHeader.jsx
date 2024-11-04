import LangSwitcher from "./LangSwitcher";
import CategorieDropDown from "./CategorieDropDown";
import Menu from "@/components/Menu";

export default function SubHeader() {
  return (
    <div>
      <div className="max-w-[1250px] w-[90vw] mx-auto hidden md:flex items-center justify-between dark:border-gray-700 py-2 lg:py-0">
        <div className="flex gap-5 items-center">
          <CategorieDropDown />
          <Menu />
        </div>
        <LangSwitcher />
      </div>
      <div className="w-full mx-auto h-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
    </div>
  );
}
