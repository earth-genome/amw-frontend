"use client";

import Store from "@/lib/Store";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";

interface MapWrapperProps {
  children: ReactNode;
  lang: PERMITTED_LANGUAGES;
  isEmbed?: boolean;
}

const MapWrapper = ({ children, lang, isEmbed }: MapWrapperProps) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isBaseRoute = pathSegments.length === 1;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Store lang={lang} isBaseRoute={isBaseRoute} isEmbed={isEmbed}>
        {children}
      </Store>
    </Suspense>
  );
};

export default MapWrapper;
