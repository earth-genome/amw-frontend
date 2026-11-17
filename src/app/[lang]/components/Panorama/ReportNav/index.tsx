"use client";
import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";
import SmoothScrollLink from "@/app/[lang]/components/Panorama/SmoothScrollLink";

export interface ReportNavItem {
  id: string;
  label: string;
}

interface ReportNavProps {
  dictionary: { [key: string]: any };
  issueNumber: number;
  items: ReportNavItem[];
  // id of the element whose scroll progress is displayed
  progressTargetId: string;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// sticky navbar with the report sections and a scroll progress indicator
const ReportNav = ({
  dictionary,
  issueNumber,
  items,
  progressTargetId,
}: ReportNavProps) => {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number | undefined;

    const update = () => {
      frame = undefined;
      const viewportHeight = window.innerHeight;

      // active section: the last one whose top is above the middle of the viewport
      let currentId: string | undefined;
      items.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (
          element &&
          element.getBoundingClientRect().top <= viewportHeight / 2
        )
          currentId = id;
      });
      setActiveId(currentId);

      // progress: from the target's top reaching the navbar, to its bottom reaching the
      // bottom of the viewport
      const target = document.getElementById(progressTargetId);
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollable = rect.height - (viewportHeight - navBottom);
        setProgress(
          scrollable > 0 ? clamp((navBottom - rect.top) / scrollable) : 0,
        );
      }
    };

    const handleScroll = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [items, progressTargetId]);

  // on small screens the items overflow, so keep the active one centered in the list,
  // scrolling the list horizontally only
  useEffect(() => {
    const list = listRef.current;
    const item = activeId ? itemRefs.current[activeId] : undefined;
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    list.scrollTo({
      left:
        list.scrollLeft +
        itemRect.left -
        listRect.left -
        (list.clientWidth - itemRect.width) / 2,
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <nav ref={navRef} className={style.reportNav}>
      <a
        className={style.title}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        {dictionary?.panorama?.panorama} · {dictionary?.panorama?.issue}{" "}
        {issueNumber}
      </a>

      <ul ref={listRef} className={style.items}>
        {items.map(({ id, label }) => (
          <li key={id}>
            <SmoothScrollLink
              ref={(element) => {
                itemRefs.current[id] = element;
              }}
              targetId={id}
              className={`${style.item} ${
                activeId === id ? style.itemActive : ""
              }`}
            >
              {label}
            </SmoothScrollLink>
          </li>
        ))}
      </ul>

      <div
        className={style.progress}
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
    </nav>
  );
};

export default ReportNav;
