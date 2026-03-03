"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Overlay from "@/app/[lang]/components/Overlay";
import { LOCALES } from "@/utils/content";
import "./style.css";

interface IntroProps {
  dictionary: { [key: string]: any };
}

const Intro: React.FC<IntroProps> = ({ dictionary }) => {
  const [showIntro, setShowIntro] = useState(true);
  const pathname = usePathname();
  const localeMatch = pathname.match(
    new RegExp(`^/(${LOCALES.map((l) => l.code).join("|")})`),
  );
  const currentLocale = localeMatch ? localeMatch[1] : "en";
  const otherLocales = LOCALES.filter((l) => l.code !== currentLocale);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasLng = searchParams.get("lng");
    const introViewed =
      sessionStorage.getItem("introViewed") === "true" || hasLng;
    if (introViewed) {
      setShowIntro(false);
    }
  }, []);

  const handleClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    sessionStorage.setItem("introViewed", "true");
    setShowIntro(false);
  };

  const handleChangeLanguage = () =>
    sessionStorage.setItem("introViewed", "true");

  if (showIntro === false) {
    return null;
  }

  return (
    <Overlay>
      <div className="intro">
        <h1>{dictionary.intro.title}</h1>
        <p>{dictionary.intro.text}</p>
        <a href="#close" className="btn" onClick={handleClose}>
          {dictionary.intro.explore}
        </a>
        <div className="lang-links">
          {otherLocales.map((locale, i) => (
            <React.Fragment key={locale.code}>
              <a
                href={`/${locale.code}`}
                className="lang-link"
                onClick={handleChangeLanguage}
              >
                {locale.exploreIn}
              </a>
              {i < otherLocales.length - 1 && (
                <span className="lang-divider">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Overlay>
  );
};

export default Intro;
