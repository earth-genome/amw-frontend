import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import PageNumber from "@/app/[lang]/components/PanoramaPrint/PageNumber";
import {
  KeyFindings as KeyFindingsData,
  TextSection as TextSectionData,
} from "@/cms/panorama";

export const Introduction = ({
  dictionary,
  introduction,
}: {
  dictionary: { [key: string]: any };
  introduction: TextSectionData;
}) => (
  <section className={style.introduction}>
    <div className={style.eyebrow}>
      {introduction.title || dictionary?.panorama?.overview}
    </div>
    <RichText className={style.introText} content={introduction.text} />
  </section>
);

export const KeyFindings = ({
  keyFindings,
}: {
  keyFindings: KeyFindingsData;
}) => {
  const { title, highlights, breakdownTitle, breakdown, breakdownText } =
    keyFindings;

  return (
    <section className={style.keyFindings}>
      <h2 className={`${shared.heading} ${style.title}`}>{title}</h2>

      {highlights?.length ? (
        <div className={style.highlights}>
          {highlights.map((highlight) => (
            <div key={highlight.id}>
              <div className={`${shared.heading} ${style.highlightTitle}`}>
                {highlight.title}
              </div>
              {highlight.subtitle && (
                <div className={style.highlightSubtitle}>
                  {highlight.subtitle}
                </div>
              )}
              <RichText className={style.smallText} content={highlight.text} />
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
                <div
                  className={`${shared.heading} ${style.breakdownItemTitle}`}
                >
                  {item.title}
                </div>
                <RichText className={style.smallText} content={item.text} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <RichText className={style.smallText} content={breakdownText} />
    </section>
  );
};

export interface ContentsItem {
  label: string;
  anchor: string;
}

export const Contents = ({
  dictionary,
  items,
}: {
  dictionary: { [key: string]: any };
  items: ContentsItem[];
}) => (
  <section className={style.contents}>
    <div className={style.eyebrow}>{dictionary?.panorama?.contents}</div>
    <ol className={style.contentsList}>
      {items.map((item) => (
        <li key={item.anchor}>
          <span>{item.label}</span>
          <span>
            <PageNumber anchor={item.anchor} />
          </span>
        </li>
      ))}
    </ol>
  </section>
);
