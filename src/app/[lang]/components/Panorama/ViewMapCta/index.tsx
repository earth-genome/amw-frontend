import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { ViewMapCta as ViewMapCtaData } from "@/cms/panorama";

interface ViewMapCtaProps {
  dictionary: { [key: string]: any };
  cta: ViewMapCtaData | null | undefined;
  lang: string;
}

const ViewMapCta = ({ dictionary, cta, lang }: ViewMapCtaProps) => {
  if (!cta) return null;

  return (
    <section className={`${shared.section} ${style.cta}`}>
      <div className={`${shared.container} ${style.content}`}>
        <RichText className={style.text} content={cta.text} />
        <a
          className={`${shared.button} ${shared.buttonDark}`}
          href={cta.link || `/${lang}`}
        >
          {cta.buttonLabel || dictionary?.panorama?.explore_map} ↗
        </a>
      </div>
    </section>
  );
};

export default ViewMapCta;
