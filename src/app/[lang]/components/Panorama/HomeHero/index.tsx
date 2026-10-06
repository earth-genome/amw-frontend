import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { getPanoramaMediaUrl, Hero } from "@/cms/panorama";
import Link from "next/link";
import SmoothScrollLink from "@/app/[lang]/components/Panorama/SmoothScrollLink";

interface HomeHeroProps {
  dictionary: { [key: string]: any };
  hero: Hero | null | undefined;
  // id of the issues section, in the same page
  issuesTargetId: string;
  signUpLink?: string | null;
}

const HomeHero = ({
  dictionary,
  hero,
  issuesTargetId,
  signUpLink,
}: HomeHeroProps) => {
  const backgroundUrl = getPanoramaMediaUrl(hero?.backgroundImage?.url);

  return (
    <section
      className={`${shared.section} ${style.hero}`}
      style={
        backgroundUrl ? { backgroundImage: `url("${backgroundUrl}")` } : {}
      }
    >
      <div className={style.overlay} />
      <div className={style.content}>
        <div className={style.eyebrow}>{dictionary?.home?.title}</div>
        <h1 className={`${shared.heading} ${style.title}`}>
          {hero?.title || dictionary?.panorama?.panorama}
        </h1>
        <RichText className={style.subtitle} content={hero?.subtitle} />

        <div className={shared.buttons}>
          <SmoothScrollLink
            className={`${shared.button} ${shared.buttonPrimary} ${style.button}`}
            targetId={issuesTargetId}
          >
            {dictionary?.panorama?.browse_issues}
          </SmoothScrollLink>
          {signUpLink && (
            <Link
              className={`${shared.button} ${shared.buttonOutline} ${style.button}`}
              href={signUpLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dictionary?.panorama?.subscribe}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
