"use client";

import { useEffect } from "react";

export default function Hotjar() {
  useEffect(() => {
    const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
    if (!siteId) return;

    const loadHotjar = () => {
      import("@hotjar/browser").then((Hotjar) => {
        const hotjarVersion = 6;
        Hotjar.default.init(Number(siteId), hotjarVersion);
      });
    };

    if (document.readyState === "complete") {
      loadHotjar();
    } else {
      window.addEventListener("load", loadHotjar);
      return () => window.removeEventListener("load", loadHotjar);
    }
  }, []);

  return null;
}
