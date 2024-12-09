export const revalidate = false;
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import HeaderDesktop from "@/components/Header/HeaderDesktop";
import HeaderMobile from "@/components/Header/HeaderMobile";
import BackButton from "@/components/BackButton";
import "./globals.css";
import SubHeader from "@/components/Header/SubHeader";
import AuthProvider from "@/components/Providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import BeforeFooter from "@/components/Footer/BeforeFooter";
import Footer from "@/components/Footer/Footer";
import BottomBarMobile from "@/components/Footer/BottomBarMobile";
import Cart from "@/components/Cart";
import FastOrder from "@/components/FastOrder";
import MessageChat from "@/components/messageChat";
import Pixels from "@/components/Pixels";
import NotificationHandler from "@/components/NotificationHandler";

async function getPixels() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/pixels`, {
      next: { tags: ["pixels"] },
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.Pixels;
  } catch (error) {
    console.error("Error fetching pixels:", error);
    return null;
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    icons: {
      icon: [{ url: "/favicon/favicon.ico" }],
      apple: [
        {
          url: "/favicon/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
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
  const pixelsData = await getPixels();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" id="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* iOS PWA Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_11__iPhone_XR_portrait.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/12.9__iPad_Pro_portrait.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/10.9__iPad_Air_portrait.png"
          media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/10.5__iPad_Air_portrait.png"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/10.2__iPad_portrait.png"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/8.3__iPad_Mini_portrait.png"
          media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_16_Pro_Max_portrait.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splashscreens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              function updateThemeColor() {
                const themeColorMeta = document.querySelector('#theme-color');
                const isDark = document.documentElement.classList.contains('dark');
                themeColorMeta.setAttribute('content', isDark ? '#262833' : '#ffffff');
              }
              
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.attributeName === 'class') {
                    updateThemeColor();
                  }
                });
              });
              
              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
              });
              
              updateThemeColor();
            `,
          }}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className="antialiased">
        <Pixels pixelData={pixelsData} />
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
              <BackButton />
              <div className="pt-[77px] md:pt-0">{children}</div>
              <BeforeFooter />
              <Footer />
              <Toaster />
              <BottomBarMobile />
              <Cart />
              <FastOrder />
              <MessageChat />
              <NotificationHandler />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
