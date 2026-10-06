import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import MapLink from "@/app/[lang]/components/Panorama/MapLink";
import { KeyFindings as KeyFindingsData } from "@/cms/panorama";

interface KeyFindingsProps {
  dictionary: { [key: string]: any };
  keyFindings: KeyFindingsData | null | undefined;
  dateCoverage: string;
  lang: string;
  id?: string;
}

const KeyFindings = ({
  dictionary,
  keyFindings,
  dateCoverage,
  lang,
  id,
}: KeyFindingsProps) => {
  if (!keyFindings) return null;
  const { title, highlights, breakdownTitle, breakdown, breakdownText } =
    keyFindings;

  return (
    <section id={id} className={`${shared.section} ${style.keyFindings}`}>
      <div className={shared.container}>
        <div className={shared.eyebrow}>
          {dictionary?.panorama?.key_findings} / {dateCoverage}
        </div>
        <h2 className={`${shared.heading} ${style.title}`}>{title}</h2>

        {highlights?.length ? (
          <div className={style.highlights}>
            {highlights.map((highlight) => (
              <div key={highlight.id} className={style.highlight}>
                <div className={style.highlightTitle}>{highlight.title}</div>
                {highlight.subtitle && (
                  <div className={style.highlightSubtitle}>
                    {highlight.subtitle}
                  </div>
                )}
                <RichText
                  className={style.highlightText}
                  content={highlight.text}
                />
              </div>
            ))}
          </div>
        ) : null}

        {breakdown?.length ? (
          <div className={style.breakdown}>
            {breakdownTitle && (
              <div className={style.breakdownTitle}>{breakdownTitle}</div>
            )}
            <div className={style.breakdownItems}>
              {breakdown.map((item) => (
                <div key={item.id} className={style.breakdownItem}>
                  <div className={style.breakdownItemTitle}>{item.title}</div>
                  <RichText
                    className={style.breakdownItemText}
                    content={item.text}
                  />
                  <MapLink
                    className={style.breakdownItemLink}
                    mapLink={item.mapLink}
                    lang={lang}
                    label={dictionary?.panorama?.see_on_map_short}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <RichText className={style.breakdownText} content={breakdownText} />
      </div>
    </section>
  );
};

export default KeyFindings;
