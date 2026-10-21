import Image from "next/image";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import PartnerLogos from "@/app/[lang]/components/Panorama/PartnerLogos";
import Logo from "@/app/[lang]/components/Nav/logo.svg";
import { TextSection as TextSectionData } from "@/cms/panorama";

interface BackPageProps {
  dictionary: { [key: string]: any };
  sections: (TextSectionData | null | undefined)[];
  siteUrl: string;
}

// about, methodology and acknowledgements of Panorama, with the partner logos
const BackPage = ({ dictionary, sections, siteUrl }: BackPageProps) => (
  <section className={style.backPage}>
    <div>
      {sections.map((section) =>
        section ? (
          <div key={section.id} className={style.section}>
            <div className={style.eyebrow}>{section.title}</div>
            <RichText className={style.text} content={section.text} />
          </div>
        ) : null,
      )}

      <div className={style.logos}>
        <PartnerLogos className={style.partnerLogos} />
      </div>
    </div>

    <div className={style.bottom}>
      <Image
        className={style.amwLogo}
        src={Logo}
        alt="Amazon Mining Watch"
        // lazy images below the viewport would never load in the print page
        priority
      />
      <div className={style.bottomRow}>
        <a href={siteUrl}>
          {siteUrl.replace(/^https?:\/\//, "")} ·{" "}
          {dictionary?.panorama?.explore_every_detection}
        </a>
        <span>
          © {new Date().getFullYear()} {dictionary?.panorama?.copyright}
        </span>
      </div>
    </div>
  </section>
);

export default BackPage;
