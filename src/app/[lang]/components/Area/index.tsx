"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "../Nav/logo.svg";
import { Tween } from "react-gsap";
import coverageData from '../../../../../configs/coverage.json';
import "./style.css";

interface AreaProps {
  dictionary: { [key: string]: any };
  year: string;
}

// Define the interface for the coverage JSON structure
interface CoverageYear {
  km: string;
  acres: number;
}

interface Coverage {
  [key: string]: CoverageYear;
}


const Area: React.FC<AreaProps> = ({ dictionary, year }) => {
  const [showArea, setShowArea] = useState(true);
  const coverage: Coverage = coverageData;

  return showArea ? (
    <Tween
      from={{ y: 100, opacity: 0 }}
      to={{ y: 0, opacity: 1 }}
      stagger={0.1}
      ease={"sine.out"}
      delay={2}
    >
      <div className="area">
        <div className="area-title">
          {dictionary.coverage.area_affected_in} {year}
        </div>
  <div className="area-km">{ coverage?.[year].km } km<sup>2</sup></div>
        <div className="area-or">
          <span className="area-line-left"></span>
          {dictionary.coverage.or}
          <span className="area-line-right"></span>
        </div>
             <div className="area-acres">
        { coverage?.[year].acres } {dictionary.coverage.million_acres}
        </div>
  <div className="area-or">
          <span className="area-line-left"></span>
          {dictionary.coverage.or}
          <span className="area-line-right"></span>
        </div>
   
                  <div className="area-ha">{ (parseFloat(coverage?.[year].km.replaceAll(",", "")) * 100).toLocaleString() } hectares</div>

      </div>
    </Tween>
  ) : null;
};

export default Area;
