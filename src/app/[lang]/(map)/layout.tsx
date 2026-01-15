import { AntdRegistry } from "@ant-design/nextjs-registry";
import { i18n, type Locale } from "@root/i18n-config";
import MainMap from "@/app/[lang]/components/Map";
import Nav from "@/app/[lang]/components/Nav";
import { getDictionary } from "@/get-dictionary";
import { MenuProvider } from "@/app/[lang]/menuContext";
import Loader from "@/app/[lang]/components/Loader";
import React from "react";
import "@/app/[lang]/globals.css";
import type { Metadata } from "next";
import GoogleAnalytics from "@/app/[lang]/components/Tracking";
import "mapbox-gl/dist/mapbox-gl.css";
import MapWrapper from "@/app/[lang]/components/Map/Wrapper";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

type Props = {
  params: { lang: PERMITTED_LANGUAGES };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.home.title,
    description: dictionary.home.description,
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode[];
  params: { lang: Locale };
}>) {
  const dictionary = await getDictionary(params.lang);
  return (
    <html lang={params.lang}>
      <AntdRegistry>
        <GoogleAnalytics />
        <MenuProvider>
          <body>
            <Nav dictionary={dictionary} />
            <MapWrapper lang={params.lang}>
              <MainMap dictionary={dictionary} />
            </MapWrapper>
            {children}
            <Loader dictionary={dictionary} />
          </body>
        </MenuProvider>
      </AntdRegistry>
    </html>
  );
}
