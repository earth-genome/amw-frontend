import { AntdRegistry } from "@ant-design/nextjs-registry";
import MainMap from "@/app/[lang]/components/Map";
import Loader from "@/app/[lang]/components/Loader";
import React from "react";
import "@/app/[lang]/globals.css";
import type { Metadata } from "next";
import GoogleAnalytics from "@/app/[lang]/components/Tracking";
import "mapbox-gl/dist/mapbox-gl.css";
import MapWrapper from "@/app/[lang]/components/Map/Wrapper";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import type { Viewport } from "next";
import { getDictionary } from "@/get-dictionary";
import { i18n, Locale } from "@root/i18n-config";

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
        <body>
          <MapWrapper lang={params.lang} isEmbed={true}>
            <MainMap dictionary={dictionary} />
          </MapWrapper>
          {children}
          <Loader dictionary={dictionary} />
        </body>
      </AntdRegistry>
    </html>
  );
}
