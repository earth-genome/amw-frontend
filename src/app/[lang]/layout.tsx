import { AntdRegistry } from "@ant-design/nextjs-registry";
import { i18n, type Locale } from "../../../i18n-config";
import MainMap from "./components/Map";
import Nav from "./components/Nav";
import { getDictionary } from "../../get-dictionary";
import { MenuProvider } from "./menuContext";
import Loader from "./components/Loader";
import React from "react";
import "./globals.css";
import type { Metadata, ResolvingMetadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
  params: { lang: "en" | "es" | "pt" };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
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
        <MenuProvider>
          <body>
            <Nav dictionary={dictionary} />
            <MainMap dictionary={dictionary} />
            {children}
            <Loader dictionary={dictionary} />
          </body>
        </MenuProvider>
      </AntdRegistry>
    </html>
  );
}
