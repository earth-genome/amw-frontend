"use client";
import ScaleBar from "../ScaleBar";
import "./style.css";
import coverageData from '../../../../../configs/coverage.json';
import { numberToWords } from "../Area";

interface FooterProps {
  zoom: number;
  year?: string;
  dictionary?: { [key: string]: any };
}

const Footer: React.FC<FooterProps> = ({ zoom, year, dictionary }) => {
  return (
    <div className="footer">
      {/* @ts-ignore */}
      <div className="mode">{ coverageData[year].acres} million acres / { numberToWords(parseFloat(coverageData[year].km.replace(/,/g, ''))).length > 0 ? numberToWords(parseFloat(coverageData[year].km.replace(/,/g, ''))) : coverageData[year].km} km<sup>2</sup></div>
      <div className="mining-legend">
        <div className="mine-swatch"></div>{" "}
        {dictionary?.map_ui.mining_areas_detected}
      </div>
      <ScaleBar zoom={zoom} />
    </div>
  );
};

export default Footer;
