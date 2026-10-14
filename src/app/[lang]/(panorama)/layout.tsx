import { AntdRegistry } from "@ant-design/nextjs-registry";
import { i18n, type Locale } from "@root/i18n-config";
import Nav from "@/app/[lang]/components/Nav";
import { getDictionary } from "@/get-dictionary";
import { MenuProvider } from "@/app/[lang]/menuContext";
import React from "react";
import "@/app/[lang]/globals.css";
import type { Metadata } from "next";
import GoogleAnalytics from "@/app/[lang]/components/Tracking";
import "mapbox-gl/dist/mapbox-gl.css";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import type { Viewport } from "next";
import Hotjar from "@/app/[lang]/components/Hotjar/hotjar";
import { HOME_ANCHORS } from "@/app/[lang]/components/Panorama/anchors";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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

// root layout for the Panorama pages, which have their own scrollytelling map instead of the main map
export default async function PanoramaLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dictionary = await getDictionary(params.lang);
  return (
    <html lang={params.lang}>
      <AntdRegistry>
        <GoogleAnalytics />
        <Hotjar />
        <MenuProvider>
          <body style={{ background: "#0f1a12" }}>
            <Nav
              dictionary={dictionary}
              extraLinks={[
                {
                  path: `/panorama#${HOME_ANCHORS.issues}`,
                  label: dictionary.panorama.issues,
                },
              ]}
              hidePolicyScoreboardLink
            />
            {children}
          </body>
        </MenuProvider>
      </AntdRegistry>
    </html>
  );
}
