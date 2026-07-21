"use client";
import { LOCALES } from "@/utils/content";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { Fragment } from "react";

function useLocalizedHref(localeCode: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split("/");
  segments[1] = localeCode;
  const newPath = segments.join("/");
  const queryString = searchParams.toString();
  return queryString ? `${newPath}?${queryString}` : newPath;
}

function LanguageSwitcherLink({
  locale,
}: {
  locale: (typeof LOCALES)[number];
}) {
  const href = useLocalizedHref(locale.code);
  return (
    <Link
      className="menu-lang"
      onClick={() => sessionStorage.setItem("introViewed", "false")}
      href={href}
    >
      {locale.code}
    </Link>
  );
}

export function LanguageSwitcher() {
  return (
    <>
      {LOCALES.map((d, i) => (
        <Fragment key={d.code}>
          <LanguageSwitcherLink locale={d} />
          {i < LOCALES.length - 1 ? <span className="divider">|</span> : null}
        </Fragment>
      ))}
    </>
  );
}

function MenuLanguageLink({ locale }: { locale: (typeof LOCALES)[number] }) {
  const href = useLocalizedHref(locale.code);
  return <a href={href}>{locale.localizedName}</a>;
}

export function MenuLanguageList() {
  return (
    <ul className="lang-menu">
      {LOCALES.map((d) => (
        <li key={d.code}>
          <MenuLanguageLink locale={d} />
        </li>
      ))}
    </ul>
  );
}
