"use client";

import Store from "@/lib/Store";
import { ReactNode } from "react";

interface MapWrapperProps {
  children: ReactNode;
}

const MapWrapper = ({ children }: MapWrapperProps) => {
  return <Store>{children}</Store>;
};

export default MapWrapper;
