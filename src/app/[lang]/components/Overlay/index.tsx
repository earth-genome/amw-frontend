import { ReactNode } from "react";
import "./style.css";

interface OverlayProps {
  children?: ReactNode;
  maxWidth?: number;
  widthPct?: string;
}

const Overlay: React.FC<OverlayProps> = ({
  children,
  maxWidth = 600,
  widthPct,
}) => {
  return (
    <div className="overlay">
      <div
        className="content"
        style={{
          maxWidth,
          width: widthPct,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Overlay;
