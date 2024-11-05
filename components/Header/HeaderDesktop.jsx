import { PiHeart } from "react-icons/pi";
import { ModeToggle } from "./ModeToggle";
import SearchBar from "./SearchBar";
import User from "./User";
import Link from "next/link";
import CartIcon from "../CartIcon";
import { getLocale } from "next-intl/server";

async function getLogo() {
  try {
    const baseUrl = "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/marketingDesign`);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return (data.success && data.data[0]?.Logo?.[0]) || null;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
}

export default async function HeaderDesktop() {
  const logoUrl = await getLogo();
  const locale = await getLocale();

  return (
    <div className="hidden md:flex justify-between items-center h-[75px] bg-charade-900 max-w-[1350px] w-[95%] rounded-2xl mx-auto mt-2 z-50 sticky top-3">
      <div className="flex justify-between items-center w-full">
        <div className="h-12 w-[150px] ml-5">
          <Link href="/" className="cursor-pointer">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </Link>
        </div>
        <SearchBar />
        <div className="flex items-center mr-5">
          <CartIcon size={26} marginRight="mr-4" />
          <User />
          <Link href={`/${locale}/wishlist`}>
            <PiHeart size={26} className="mr-4 cursor-pointer" />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
