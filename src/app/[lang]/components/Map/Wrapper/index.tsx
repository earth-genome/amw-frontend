"use client";

import Store from "@/lib/Store";
import { ReactNode, Suspense } from "react";

interface MapWrapperProps {
  children: ReactNode;
}

const MapWrapper = ({ children }: MapWrapperProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Store>{children}</Store>
    </Suspense>
  );
};

export default MapWrapper;
