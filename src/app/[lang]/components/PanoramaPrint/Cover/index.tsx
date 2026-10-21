import Image from "next/image";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import Logo from "@/app/[lang]/components/Nav/logo.svg";

interface CoverProps {
  dictionary: { [key: string]: any };
  title: string;
  issueNumber: number;
  dateCoverage: string;
}

// a solid color, without images or transparency, which are slow to display in the PDF
const Cover = ({
  dictionary,
  title,
  issueNumber,
  dateCoverage,
}: CoverProps) => (
  <section className={style.cover}>
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
