import { AntdRegistry } from "@ant-design/nextjs-registry";
import { i18n, type Locale } from "@root/i18n-config";
import React from "react";
import "@/app/[lang]/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./print.css";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

// root layout for the print pages of the Panorama reports, used to generate their PDF.
// No navbar nor tracking
export default function PanoramaPrintLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  return (
    <html lang={params.lang}>
      <AntdRegistry>
        <body>{children}</body>
      </AntdRegistry>
    </html>
  );
}
