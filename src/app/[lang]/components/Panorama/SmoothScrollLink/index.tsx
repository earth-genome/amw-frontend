"use client";
import React, { forwardRef, ReactNode } from "react";

interface SmoothScrollLinkProps {
  // id of the element to scroll to, in the same page
  targetId: string;
  className?: string;
  children: ReactNode;
}

// link to a section of the same page, scrolling smoothly to it
const SmoothScrollLink = forwardRef<HTMLAnchorElement, SmoothScrollLinkProps>(
  ({ targetId, className, children }, ref) => (
    <a
      ref={ref}
      href={`#${targetId}`}
      className={className}
      onClick={(event) => {
        const element = document.getElementById(targetId);
        // fall back to the default navigation if the element is not in the page
        if (!element) return;
        event.preventDefault();
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${targetId}`);
      }}
    >
      {children}
    </a>
  ),
);

SmoothScrollLink.displayName = "SmoothScrollLink";

export default SmoothScrollLink;
