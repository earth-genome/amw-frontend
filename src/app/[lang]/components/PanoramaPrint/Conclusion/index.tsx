import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { TextSection as TextSectionData } from "@/cms/panorama";

const Conclusion = ({ section }: { section: TextSectionData }) => (
  <section className={style.conclusion}>
    <h2 className={`${shared.heading} ${style.title}`}>{section.title}</h2>
    <RichText className={style.text} content={section.text} />
  </section>
);

export default Conclusion;
