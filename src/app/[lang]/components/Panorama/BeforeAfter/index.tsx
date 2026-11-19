"use client";
import React, { useEffect, useRef, useState } from "react";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import {
  BeforeAfter as BeforeAfterData,
  getPlanetCompareUrl,
} from "@/cms/panorama";

interface BeforeAfterProps {
  dictionary: { [key: string]: any };
  beforeAndAfter: BeforeAfterData | null | undefined;
  // name of the area, the title of the modal window
  title: string;
  lang: string;
  className?: string;
}

// formats a date of the CMS, "YYYY-MM-DD", in the date format of the locale. The date is
// read and formatted in UTC so it isn't shifted to the day before in timezones behind UTC
const formatDate = (date: string | null | undefined, lang: string) => {
  if (!date) return null;
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  try {
    return parsed.toLocaleDateString(lang, { timeZone: "UTC" });
  } catch {
    return parsed.toLocaleDateString(undefined, { timeZone: "UTC" });
  }
};

// button that opens the Planet before/after imagery slider of an area in a modal window.
// The CMS has the link of the Planet story, and the iframe shows its compare page. The
// iframe is only loaded while the window is open
const BeforeAfter = ({
  dictionary,
  beforeAndAfter,
  title,
  lang,
  className,
}: BeforeAfterProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // a native modal dialog is shown above everything else, traps the focus and closes
  // with the escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    if (!dialog.open) dialog.showModal();

    // the page doesn't scroll behind the window
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  const sourceUrl = beforeAndAfter?.embedUrl?.trim();
  const compareUrl = getPlanetCompareUrl(sourceUrl);
  if (!beforeAndAfter || !sourceUrl || !compareUrl) return null;
  const panorama = dictionary?.panorama;
  const beforeDate = formatDate(beforeAndAfter.beforeDate, lang);
  const afterDate = formatDate(beforeAndAfter.afterDate, lang);

  const open = () => {
    setIsLoaded(false);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={`${shared.button} ${shared.buttonPrimary} ${className ?? ""}`}
        onClick={open}
        aria-haspopup="dialog"
      >
        {panorama?.before_after_imagery}
      </button>

      <dialog
        ref={dialogRef}
        className={style.dialog}
        aria-labelledby={`before-after-${beforeAndAfter.id}`}
        // closed with the escape key or the close button
        onClose={() => setIsOpen(false)}
        // a click outside the window, on the backdrop, closes it
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
      >
        {isOpen && (
          <div className={style.window}>
            <header className={style.header}>
              <h2
                id={`before-after-${beforeAndAfter.id}`}
                className={`${shared.heading} ${style.title}`}
              >
                {title}
              </h2>
              <button
                type="button"
                className={style.close}
                onClick={() => setIsOpen(false)}
                aria-label={panorama?.close}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div className={style.body}>
              {/* the sides of the slider, the before image on the left and the after one
                  on the right */}
              <div className={style.sides}>
                <span>
                  {panorama?.before}
                  {beforeDate && (
                    <time
                      className={style.date}
                      dateTime={beforeAndAfter.beforeDate ?? undefined}
                    >
                      {beforeDate}
                    </time>
                  )}
                </span>
                <span>
                  {afterDate && (
                    <time
                      className={style.date}
                      dateTime={beforeAndAfter.afterDate ?? undefined}
                    >
                      {afterDate}
                    </time>
                  )}
                  {panorama?.after}
                </span>
              </div>
              <div className={style.frame}>
                {!isLoaded && (
                  <div className={style.loading}>
                    {panorama?.loading_imagery}…
                  </div>
                )}
                <iframe
                  className={style.iframe}
                  src={compareUrl}
                  title={`${title} · ${panorama?.before_after}`}
                  allow="fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={() => setIsLoaded(true)}
                />
              </div>
            </div>

            <footer className={style.footer}>
              <p className={style.caption}>{panorama?.before_after_caption}</p>
              <div className={style.credit}>
                {panorama?.planet_credit} ·{" "}
                <a
                  className={style.sourceLink}
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {panorama?.source} ↗
                </a>
                <span className={style.escHint}>
                  {" "}
                  · {panorama?.esc_to_close}
                </span>
              </div>
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
};

export default BeforeAfter;
