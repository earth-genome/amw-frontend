"use client";

import Store from "@/lib/Store";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { ReactNode, Suspense } from "react";

interface MapWrapperProps {
  children: ReactNode;
  lang: PERMITTED_LANGUAGES;
}

const MapWrapper = ({ children, lang }: MapWrapperProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Store lang={lang}>{children}</Store>
    </Suspense>
  );
};

export default MapWrapper;
