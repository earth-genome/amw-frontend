import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { MainTakeaways as MainTakeawaysData } from "@/cms/panorama";

interface MainTakeawaysProps {
  mainTakeaways: MainTakeawaysData | null | undefined;
  dateCoverage: string;
  id?: string;
}

const padNumber = (n: number) => String(n).padStart(2, "0");

// numbered list of the main takeaways of the report, with the title on the left
const MainTakeaways = ({
  mainTakeaways,
  dateCoverage,
  id,
}: MainTakeawaysProps) => {
  if (!mainTakeaways) return null;
  const { title, takeaways, text } = mainTakeaways;

  return (
    <section id={id} className={`${shared.section} ${style.mainTakeaways}`}>
      <div className={`${shared.container} ${style.grid}`}>
        <div>
          <div className={`${shared.eyebrow} ${style.eyebrow}`}>
            {dateCoverage}
          </div>
          <h2 className={`${shared.heading} ${style.title}`}>{title}</h2>
        </div>

        <div>
          {takeaways?.length ? (
            <ol className={style.takeaways}>
              {takeaways.map((takeaway, i) => (
                <li key={takeaway.id} className={style.takeaway}>
                  <div className={style.number} aria-hidden="true">
                    {padNumber(i + 1)}
                  </div>
                  <div>
                    <h3 className={style.takeawayTitle}>{takeaway.title}</h3>
                    <RichText
                      className={style.takeawayText}
                      content={takeaway.text}
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
          <RichText className={style.text} content={text} />
        </div>
      </div>
    </section>
  );
};

export default MainTakeaways;
