import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { TextSection } from "@/cms/panorama";

interface TextColumnsProps {
  sections: (TextSection | null | undefined)[];
}

// text sections side by side, e.g. methodology and acknowledgements
const TextColumns = ({ sections }: TextColumnsProps) => {
  const sectionsFiltered = sections.filter((d): d is TextSection => !!d);
  if (!sectionsFiltered.length) return null;

  return (
    <section className={`${shared.section} ${style.textColumns}`}>
      <div className={`${shared.container} ${style.columns}`}>
        {sectionsFiltered.map((section) => (
          <div key={section.id}>
            <h3 className={style.title}>{section.title}</h3>
            <RichText className={style.text} content={section.text} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TextColumns;
