import Link from "next/link";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import {
  getPanoramaMediaUrl,
  getPanoramaReportPath,
  PanoramaReport,
} from "@/cms/panorama";

interface LatestIssueProps {
  dictionary: { [key: string]: any };
  lang: string;
  report: PanoramaReport | undefined;
  id?: string;
}

const LatestIssue = ({ dictionary, lang, report, id }: LatestIssueProps) => {
  if (!report) return null;

  const imageUrl = getPanoramaMediaUrl(report.heroImage?.image?.url);
  const reportPath = getPanoramaReportPath(lang, report.issueNumber);

  return (
    <section id={id} className={`${shared.section} ${style.latestIssue}`}>
      <div className={shared.container}>
        <div className={`${shared.eyebrow} ${style.eyebrow}`}>
          {dictionary?.panorama?.latest_issue}
        </div>

        <div className={style.grid}>
          <Link href={reportPath} className={style.imageWrapper}>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={style.image}
                src={imageUrl}
                alt={report.heroImage?.image?.alternativeText || ""}
              />
            )}
          </Link>

          <div>
            <div className={shared.eyebrow}>
              {dictionary?.panorama?.issue} {report.issueNumber} ·{" "}
              {report.dateCoverage}
            </div>
            <h2 className={`${shared.heading} ${style.title}`}>
              <Link href={reportPath}>{report.title}</Link>
            </h2>
            <RichText className={style.summary} content={report.summary} />

            <Link
              href={reportPath}
              className={`${shared.button} ${shared.buttonPrimary} ${style.button}`}
            >
              {dictionary?.panorama?.read_issue} {report.issueNumber} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestIssue;
