"use client";
import React, { useState, useEffect } from "react";
import Overlay from "@/app/[lang]/components/Overlay";
import "./style.css";

interface IntroProps {
  dictionary: { [key: string]: any };
}

const Intro: React.FC<IntroProps> = ({ dictionary }) => {
  const [showIntro, setShowIntro] = useState(true);

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
      </div>
    </Overlay>
  );
};

export default Intro;
