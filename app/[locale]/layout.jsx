import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import HeaderDesktop from "@/components/Header/HeaderDesktop";
import HeaderMobile from "@/components/Header/HeaderMobile";
import "./globals.css";
import SubHeader from "@/components/Header/SubHeader";
import AuthProvider from "@/components/Providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import BeforeFooter from "@/components/Footer/BeforeFooter";
import Footer from "@/components/Footer/Footer";
import BottomBarMobile from "@/components/Footer/BottomBarMobile";
import Cart from "@/components/Cart";
import FastOrder from "@/components/FastOrder";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const isValidLocale = routing.locales.includes(locale);
  if (!isValidLocale) {
    notFound();
  }

  const t = await getTranslations("metadata");

  return {
    title: t("site_title"),
    description: t("site_description"),
  };
}

export default async function LocaleLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const isValidLocale = routing.locales.includes(locale);
  if (!isValidLocale) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <HeaderDesktop />
              <HeaderMobile />
              <SubHeader />
              <div className="pt-[77px] md:pt-0">{children}</div>
              <BeforeFooter />
              <Footer />
              <Toaster />
              <BottomBarMobile />
              <Cart />
              <FastOrder />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
