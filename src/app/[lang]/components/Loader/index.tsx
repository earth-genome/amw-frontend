"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Logo from "@/app/[lang]/components/Nav/logo.svg";
import gsap from "gsap";
import "./style.css";

interface LoaderProps {
  dictionary: { [key: string]: any };
}

export default function Loader(props: LoaderProps) {
  const { dictionary } = props;
  const [showLoader, setShowLoader] = useState(true);
  const [fadeClass, setFadeClass] = useState('');
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowLoader(true);
    setTimeout(() => {
      setFadeClass('fade-out')
    }, 2000);
    setTimeout(() => {
      setShowLoader(false);
    }, 2500);
  }, []);

  useEffect(() => {
    if (loaderRef.current) {
      const dots = loaderRef.current.querySelectorAll(".js-loader-dot");
      if (dots.length > 0) {
        gsap
          .timeline({ repeat: -1 })
          .to(dots, {
            y: -5,
            stagger: 0.1,
            duration: 0.3,
            ease: "linear",
          })
          .to(dots, {
            y: 0,
            stagger: 0.1,
            duration: 0.3,
            ease: "linear",
          });
      }
    }
  }, []);

  return showLoader ? (
    <div
      ref={loaderRef}
      className={`loader ${fadeClass}`}
    >
      <div className="content">
        <div>
          <Image width={280} src={Logo} alt="Logo" />
        </div>
        {dictionary?.map_ui.loading}&nbsp;
        <div className="loader-dots">
          <span className="js-loader-dot"></span>
          <span className="js-loader-dot"></span>
          <span className="js-loader-dot"></span>
        </div>
      </div>
    </div>
  ) : null;
}
