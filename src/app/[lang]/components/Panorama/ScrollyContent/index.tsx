"use client";
import React, { ReactNode } from "react";
import style from "./style.module.css";
import { useScrolly } from "@/app/[lang]/components/Panorama/ScrollyProvider";

// the report content, which fades out while the user explores the map
const ScrollyContent = ({ children }: { children: ReactNode }) => {
  const { exploreState } = useScrolly();

  return (
    <div
      className={`${style.content} ${
        exploreState === "story" ? "" : style.contentHidden
      }`}
    >
      {children}
    </div>
  );
};

export default ScrollyContent;
