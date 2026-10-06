import Link from "next/link";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import Copyright from "@/app/[lang]/components/Panorama/Copyright";
import {
  getPanoramaMediaUrl,
  getPanoramaReportPath,
  PanoramaReportListItem,
  SignUp,
  StrapiMedia,
  TextSection,
} from "@/cms/panorama";

interface FooterProps {
  dictionary: { [key: string]: any };
  lang: string;
  methodology: TextSection | null | undefined;
  acknowledgements: TextSection | null | undefined;
  signUp: SignUp | null | undefined;
  pdfReport: StrapiMedia | null | undefined;
  reports: PanoramaReportListItem[];
  currentIssueNumber: number;
  issuesHref: string;
}

const Footer = ({
  dictionary,
  lang,
  methodology,
  acknowledgements,
  signUp,
  pdfReport,
  reports,
  currentIssueNumber,
  issuesHref,
}: FooterProps) => {
  const pdfUrl = getPanoramaMediaUrl(pdfReport?.url);

  return (
    <footer className={`${shared.section} ${style.footer}`}>
      <div className={`${shared.container} ${style.columns}`}>
        {methodology && (
          <div>
            <h3 className={style.columnTitle}>{methodology.title}</h3>
            <RichText className={style.text} content={methodology.text} />
          </div>
        )}

        {acknowledgements && (
          <div>
            <h3 className={style.columnTitle}>{acknowledgements.title}</h3>
            <RichText className={style.text} content={acknowledgements.text} />
          </div>
        )}

        <div>
          <h3 className={style.columnTitle}>
            {signUp?.title || dictionary?.panorama?.issues}
          </h3>
          <RichText className={style.text} content={signUp?.text} />

          <div className={style.buttons}>
            {signUp?.link && (
              <a
                className={`${shared.button} ${shared.buttonPrimary}`}
                href={signUp.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {signUp.callToAction || dictionary?.panorama?.sign_up}
              </a>
            )}
            {pdfUrl && (
              <a
                className={`${shared.button} ${shared.buttonOutline}`}
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dictionary?.panorama?.download_report}
              </a>
            )}
          </div>

          {reports?.length ? (
            <ul className={style.issues}>
              {reports.map((report) => (
                <li key={report.issueNumber}>
                  <Link
                    className={style.issueLink}
                    href={getPanoramaReportPath(lang, report.issueNumber)}
                  >
                    {dictionary?.panorama?.issue} {report.issueNumber} —{" "}
                    {report.dateCoverage}
                  </Link>
                  {report.issueNumber === currentIssueNumber && (
                    <span className={style.current}>
                      {" "}
                      · {dictionary?.panorama?.current}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          <Link className={style.issueLink} href={issuesHref}>
            {dictionary?.panorama?.all_issues} →
          </Link>
        </div>
      </div>

      <Copyright dictionary={dictionary} className={style.copyright} />
    </footer>
  );
};

export default Footer;
