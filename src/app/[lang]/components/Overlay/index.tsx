import { ReactNode } from "react";
import "./style.css";

interface OverlayProps {
  children?: ReactNode;
}

const Overlay = ({ children }: OverlayProps) => {
  return (
    <div className="overlay">
      <div className="content">{children}</div>
    </div>
  );
};

export default Overlay;
