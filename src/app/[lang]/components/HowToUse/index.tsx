/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { Carousel } from "antd";
import { CloseOutlined, CaretUpFilled } from "@ant-design/icons";
import "./style.css";

interface HowToUseParams {
  dictionary?: any;
  onClose: () => void;
}

export default function HowToUse(params: HowToUseParams) {
  const { onClose, dictionary } = params;
  const ref = useRef(null);

  const handleClickOutside = useCallback(
    (e: Event) => {
      /* @ts-ignore */
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const SampleNextArrow = (props: any) => {
    const { className, onClick } = props;
    return <div className={className} onClick={onClick} />;
  };

  const SamplePrevArrow = (props: any) => {
    const { className, onClick } = props;
    return <div className={className} onClick={onClick} />;
  };

  const settings = {
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div ref={ref} className="how-to-use">
      <CaretUpFilled className="caret" />
      <a
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
        className="close-btn"
        href="#close"
      >
        <CloseOutlined />
      </a>
      <Carousel dots={false} arrows {...settings}>
        <div>
          <div className="content">
            <h2>{dictionary.how_to_use.title}</h2>
            <p>{dictionary.how_to_use.slide_1}</p>
            <img src="/images/how-to-use-1.jpg" />
          </div>
        </div>
        <div>
          <div className="content">
            <h2>{dictionary.how_to_use.title}</h2>
            <p>{dictionary.how_to_use.slide_2}</p>
            <img src="/images/how-to-use-2.jpg" />
          </div>
        </div>
        <div>
          <div className="content">
            <h2>{dictionary.how_to_use.title}</h2>
            <p>{dictionary.how_to_use.slide_3}</p>
            <img src="/images/how-to-use-3.jpg" />
          </div>
        </div>
        <div>
          <div className="content">
            <h2>{dictionary.how_to_use.title}</h2>
            <p>{dictionary.how_to_use.slide_landslides}</p>
            <img src="/images/how-to-use-landslides.jpg" />
          </div>
        </div>
        <div>
          <div className="content">
            <h2>{dictionary.how_to_use.title}</h2>
            <p>{dictionary.how_to_use.slide_aquaculture}</p>
            <img src="/images/how-to-use-aquaculture.jpg" />
          </div>
        </div>
      </Carousel>
    </div>
  );
}
