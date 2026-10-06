import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";

interface CopyrightProps {
  dictionary: { [key: string]: any };
  className?: string;
}

const Copyright = ({ dictionary, className }: CopyrightProps) => (
  <div className={`${shared.container} ${style.copyright} ${className ?? ""}`}>
    Copyright © {new Date().getFullYear()} {dictionary?.panorama?.copyright}
  </div>
);

export default Copyright;
