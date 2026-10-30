import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  text: string | null;
}

// dark band at the top of the page that starts a section
const SectionHeader = ({ eyebrow, title, text }: SectionHeaderProps) => (
  <section className={style.sectionHeader}>
    <div className={style.eyebrow}>{eyebrow}</div>
    <h2 className={`${shared.heading} ${style.title}`}>{title}</h2>
    <RichText className={style.text} content={text} />
  </section>
);

export default SectionHeader;
