import Image from "next/image";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import Logo from "@/app/[lang]/components/Nav/logo.svg";

interface CoverProps {
  dictionary: { [key: string]: any };
  title: string;
  issueNumber: number;
  dateCoverage: string;
  backgroundImageUrl?: string;
}

const Cover = ({
  dictionary,
  title,
  issueNumber,
  dateCoverage,
  backgroundImageUrl,
}: CoverProps) => (
  <section className={style.cover}>
    {backgroundImageUrl && (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={style.background} src={backgroundImageUrl} alt="" />
    )}
    <div className={style.overlay} />

    <div className={style.top}>
      <Image
        className={style.logo}
        src={Logo}
        alt="Amazon Mining Watch"
        // lazy images below the viewport would never load in the print page
        priority
      />
      <div className={style.eyebrow}>
        {dictionary?.panorama?.quarterly_report}
      </div>
    </div>

    <div className={style.bottom}>
      <div className={style.eyebrow}>
        {dictionary?.panorama?.panorama} · {dictionary?.panorama?.issue}{" "}
        {issueNumber}
      </div>
      <h1 className={`${shared.heading} ${style.title}`}>{title}</h1>
      <div className={style.coverage}>{dateCoverage}</div>
    </div>
  </section>
);

export default Cover;
