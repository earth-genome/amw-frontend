"use client";
import React, { ReactNode, useEffect, useRef } from "react";
import { useScrolly } from "@/app/[lang]/components/Panorama/ScrollyProvider";
import { MapParams } from "@/utils/mapParams";

interface ScrollyStepProps {
  params: MapParams;
  children: ReactNode;
  className?: string;
}

// a scrollytelling step, which becomes active when it crosses the middle of the viewport
const ScrollyStep = ({ params, children, className }: ScrollyStepProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveParams } = useScrolly();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActiveParams(params);
        }
      },
      // a line in the middle of the viewport
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [params, setActiveParams]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollyStep;
