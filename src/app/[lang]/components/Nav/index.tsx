"use client";
import React, { ReactNode, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "./logo.svg";
import Link from "next/link";
import Overlay from "../Overlay";
import HowToUse from "../HowToUse";
import { useMenu } from "../../menuContext";
import gsap from "gsap";
import "./style.css";

interface NavProps {
  children?: ReactNode;
  dictionary: { [key: string]: any };
}

const getLocaleFromPathname = (pathname: string) => {
  const localeMatch = pathname.match(/^\/(en|es|pt)/);
  return localeMatch ? localeMatch[1] : 'en'; // default to 'en' if no match
};

const Nav: React.FC<NavProps> = ({ children, dictionary }) => {
  const pathname = usePathname();
  const locale =  getLocaleFromPathname(pathname);
  const [showMenu, setShowMenu] = useState(false);
  const [animate, setAnimate] = useState("");
  const [showHowToUse, setShowHowToUse] = useState(false);
  const { menuOpen, setMenuOpen } = useMenu();
  const menuRef = useRef<HTMLUListElement>(null); // Ref for the menu to animate
  const isRootPath = /^\/(en|es|pt)?\/?$/.test(pathname);

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
          },
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
          },
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
          <Link
            className="menu-lang"
            onClick={() => sessionStorage.setItem("introViewed", "false")}
            href="/en"
          >
            EN
          </Link>
          <span className="divider">|</span>
          <Link
            className="menu-lang"
            onClick={() => sessionStorage.setItem("introViewed", "false")}
            href="/es"
          >
            ES
          </Link>
          <span className="divider">|</span>
          <Link
            className="menu-lang"
            onClick={() => sessionStorage.setItem("introViewed", "false")}
            href="/pt"
          >
            PT
          </Link>
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
                <li>
                  <Link href={`/${locale}`}>{dictionary.menu.map}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/about`}>{dictionary.menu.about}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/case-studies`}>
                    {dictionary.menu.case_studies}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/methodology`}>{dictionary.menu.methodology}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/code`}>{dictionary.menu.data_and_code}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`}>{dictionary.menu.contact}</Link>
                </li>
              </ul>
              <ul className="lang-menu">
                <li>
                  <a href="/en">ENGLISH</a>
                </li>
                <li>
                  <a href="/es">ESPAÑOLA</a>
                </li>
                <li>
                  <a href="/pt">PORTUGUÊS</a>
                </li>
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
