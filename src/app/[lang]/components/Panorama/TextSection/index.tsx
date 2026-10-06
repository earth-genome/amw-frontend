import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { TextSection as TextSectionData } from "@/cms/panorama";

interface TextSectionProps {
  section: TextSectionData | null | undefined;
  variant?: "light" | "dark";
  id?: string;
}

// two-column section, with the title on the left and the text on the right
const TextSection = ({ section, variant = "light", id }: TextSectionProps) => {
  if (!section) return null;

  return (
    <section
      id={id}
      className={`${shared.section} ${style.textSection} ${
        variant === "dark" ? style.dark : style.light
      }`}
    >
      <div className={`${shared.container} ${style.grid}`}>
        <h2 className={`${shared.heading} ${style.title}`}>{section.title}</h2>
        <RichText className={style.text} content={section.text} />
      </div>
    </section>
  );
};

export default TextSection;
