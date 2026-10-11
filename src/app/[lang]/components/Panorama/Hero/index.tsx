import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import Link from "next/link";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import PartnerLogos from "@/app/[lang]/components/Panorama/PartnerLogos";
import { getPanoramaMediaUrl, StrapiMedia } from "@/cms/panorama";

interface HeroProps {
  dictionary: { [key: string]: any };
  title: string;
  issueNumber: number;
  dateCoverage: string;
  summary?: string | null;
  pdfReport?: StrapiMedia | null;
  signUpLink?: string | null;
  issuesHref: string;
  backgroundImageUrl?: string;
}

const Hero = ({
  dictionary,
  title,
  issueNumber,
  dateCoverage,
  summary,
  pdfReport,
  signUpLink,
  issuesHref,
  backgroundImageUrl,
}: HeroProps) => {
  const pdfUrl = getPanoramaMediaUrl(pdfReport?.url);

  return (
    <section
      className={`${shared.section} ${style.hero}`}
      style={
        backgroundImageUrl
          ? { backgroundImage: `url("${backgroundImageUrl}")` }
          : {}
      }
    >
      <div className={style.overlay} />
      <div className={style.content}>
        <div className={style.issue}>
          {dictionary?.panorama?.issue} {issueNumber}
        </div>
        <h1 className={`${shared.heading} ${style.title}`}>{title}</h1>
        <div className={style.coverage}>
          {dictionary?.panorama?.quarterly_report} / {dateCoverage}
        </div>
        <RichText className={style.tagline} content={summary} />

        <div className={`${shared.buttons} ${style.buttons}`}>
          {pdfUrl && (
            <Link
              className={`${shared.button} ${shared.buttonPrimary}`}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dictionary?.panorama?.download_report}
            </Link>
          )}
          {signUpLink && (
            <Link
              className={`${shared.button} ${shared.buttonOutline}`}
              href={signUpLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dictionary?.panorama?.subscribe}
            </Link>
          )}
        </div>

        <Link className={style.browseIssues} href={issuesHref}>
          {dictionary?.panorama?.browse_previous_issues}
        </Link>

        <PartnerLogos className={style.logos} />
      </div>
    </section>
  );
};

export default Hero;
