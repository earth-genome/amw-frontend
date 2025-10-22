"use client";
import HowToUse from "@/app/[lang]/components/HowToUse";
import Overlay from "@/app/[lang]/components/Overlay";
import { useMenu } from "@/app/[lang]/menuContext";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Logo from "./logo.svg";
import "./style.css";
import { LOCALES } from "@/utils/content";

interface NavProps {
  children?: ReactNode;
  dictionary: { [key: string]: any };
}

const getLocaleFromPathname = (pathname: string) => {
  const localeMatch = pathname.match(/^\/(en|es|pt)/);
  return localeMatch ? localeMatch[1] : "en"; // default to 'en' if no match
};

const Nav: React.FC<NavProps> = ({ children, dictionary }) => {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [showMenu, setShowMenu] = useState(false);
  const [animate, setAnimate] = useState("");
  const [showHowToUse, setShowHowToUse] = useState(false);
  const { menuOpen, setMenuOpen } = useMenu();
  const menuRef = useRef<HTMLUListElement>(null); // Ref for the menu to animate
  const isRootPath = /^\/(en|es|pt)?\/?$/.test(pathname);

  const menuItems = [
    { href: `/${locale}`, label: dictionary.menu.map },
    { href: `/${locale}/about`, label: dictionary.menu.about },
    { href: `/${locale}/results`, label: dictionary.menu.results },
    { href: `/${locale}/case-studies`, label: dictionary.menu.case_studies },
    { href: `/${locale}/methodology`, label: dictionary.menu.methodology },
    {
      href: `/${locale}/policy-scoreboard`,
      label: dictionary.menu.policy_scoreboard,
    },
    { href: `/${locale}/faq`, label: dictionary.menu.faq },
    { href: `/${locale}/contact`, label: dictionary.menu.contact },
  ];

  useEffect(() => {
    if (menuRef.current) {
      if (animate === "in") {
        gsap.fromTo(
          menuRef.current.querySelectorAll("li"),
          { xPercent: 130 },
          {
            xPercent: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "back.out(1.4)",
          }
        );
      } else {
        gsap.fromTo(
          menuRef.current.querySelectorAll("li"),
          { xPercent: 0 },
          {
            xPercent: 130,
            duration: 0.7,
            stagger: 0.06,
            ease: "back.in(1.4)",
          }
        );
      }
    }
  }, [animate]);

  return (
    <div className="nav">
      {children}

      {!showMenu && isRootPath && (
        <>
          <a
            className="menu-link"
            href="#how-to-use"
            onClick={(e) => {
              e.preventDefault();
              showHowToUse ? setShowHowToUse(false) : setShowHowToUse(true);
            }}
          >
            {dictionary.how_to_use.title}
          </a>

          <Link
            className="menu-link"
            href={`/${locale}/about`}
            onClick={() => {
              setShowMenu(false);
              setMenuOpen(false);
            }}
          >
            {dictionary.menu.about_amw}
          </Link>
        </>
      )}

      {!showMenu && (
        <>
          {LOCALES.map((d, i) => (
            <Fragment key={d.code}>
              <Link
                className="menu-lang"
                onClick={() => sessionStorage.setItem("introViewed", "false")}
                href={`/${d.code}`}
              >
                {d.code}
              </Link>
              {i < LOCALES.length - 1 ? (
                <span className="divider">|</span>
              ) : null}
            </Fragment>
          ))}
        </>
      )}

      <a
        className="menu-link menu-link-last"
        href="#menu"
        onClick={(e) => {
          e.preventDefault();
          showMenu ? setMenuOpen(false) : setMenuOpen(true);
          if (showMenu) {
            setAnimate("out");
            setTimeout(() => {
              setShowMenu(false);
            }, 1000);
          } else {
            setAnimate("in");
            setShowMenu(true);
          }
        }}
      >
        {showMenu ? "Close" : "Menu"}
      </a>

      <Link
        href="/"
        className="amw-logo"
        onClick={() => {
          setShowMenu(false);
          setMenuOpen(false);
        }}
      >
        <Image src={Logo} alt="Logo" />
      </Link>
      {showMenu && (
        <Overlay opacity={1}>
          <div className="main-menu">
            <div>
              <ul
                ref={menuRef}
                onClick={() => {
                  setMenuOpen(false);
                  setAnimate("out");
                  setTimeout(() => {
                    setShowMenu(false);
                  }, 800);
                }}
                style={{
                  listStyleType: "none",
                  textAlign: "right",
                  margin: "20px 0",
                }}
              >
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
              <ul className="lang-menu">
                {LOCALES.map((d) => (
                  <li key={d.code}>
                    <a href={`/${d.code}`}>{d.localizedName}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Overlay>
      )}
      {showHowToUse && (
        <HowToUse
          dictionary={dictionary}
          onClose={() => setShowHowToUse(false)}
        />
      )}
    </div>
  );
};

export default Nav;
