"use client";
import ScaleBar from "../ScaleBar";
import "./style.css";

interface FooterProps {
  zoom: number;
  year?: string;
  dictionary?: { [key: string]: any };
}

const Footer: React.FC<FooterProps> = ({ zoom, year, dictionary }) => {
  return (
    <div className="footer">
      <div>Units</div>
      <div>
        <ScaleBar zoom={zoom} />
      </div>
    </div>
  );
};

export default Footer;
