import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { SignUp, ViewMapCta } from "@/cms/panorama";

interface SignUpCtaProps {
  dictionary: { [key: string]: any };
  lang: string;
  signUp: SignUp | null | undefined;
  viewMapCta: ViewMapCta | null | undefined;
}

const SignUpCta = ({
  dictionary,
  lang,
  signUp,
  viewMapCta,
}: SignUpCtaProps) => {
  if (!signUp) return null;

  return (
    <section className={`${shared.section} ${style.signUp}`}>
      <div className={`${shared.container} ${style.content}`}>
        <div>
          <h2 className={`${shared.heading} ${style.title}`}>{signUp.title}</h2>
          <RichText className={style.text} content={signUp.text} />
        </div>
        <div className={shared.buttons}>
          {signUp.link && (
            <a
              className={`${shared.button} ${shared.buttonDark} ${style.button}`}
              href={signUp.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {signUp.callToAction || dictionary?.panorama?.sign_up}
            </a>
          )}
          <a
            className={`${shared.button} ${style.button} ${style.buttonOutline}`}
            href={viewMapCta?.link || `/${lang}`}
          >
            {viewMapCta?.buttonLabel || dictionary?.panorama?.explore_map} ↗
          </a>
        </div>
      </div>
    </section>
  );
};

export default SignUpCta;
