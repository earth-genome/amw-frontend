"use client";
import ScaleBar from "../ScaleBar";
import "./style.css";
import coverageData from '../../../../../configs/coverage.json';

interface FooterProps {
  zoom: number;
  year?: string;
  dictionary?: { [key: string]: any };
}

const Footer: React.FC<FooterProps> = ({ zoom, year, dictionary }) => {
  return (
    <div className="footer">
      {/* @ts-ignore */}
      <div className="mode">{ coverageData[year].acres} million acres / { coverageData[year].km} km<sup>2</sup> / { (parseFloat(coverageData?.[year].km.replaceAll(",", "")) * 100).toLocaleString() } hectares</div>
      <div className="mining-legend">
        <div className="mine-swatch"></div>{" "}
        {dictionary?.map_ui.mining_areas_detected}
      </div>
      <ScaleBar zoom={zoom} />
    </div>
  );
};

export default Footer;
