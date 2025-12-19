import { ReactNode } from "react";
import "./style.css";

interface OverlayProps {
  children?: ReactNode;
  opacity?: number;
}

const Overlay: React.FC<OverlayProps> = (props) => {
  const { children } = props;
  return (
    <div
      className="overlay"
    >
      <div className="content">{children}</div>
    </div>
  );
};

export default Overlay;
