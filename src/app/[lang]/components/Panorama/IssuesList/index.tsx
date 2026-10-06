import Link from "next/link";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { getPanoramaReportPath, PanoramaReportListItem } from "@/cms/panorama";

interface IssuesListProps {
  dictionary: { [key: string]: any };
  lang: string;
  reports: PanoramaReportListItem[];
  id?: string;
}

const padNumber = (n: number) => String(n).padStart(2, "0");

const IssuesList = ({ dictionary, lang, reports, id }: IssuesListProps) => {
  if (!reports?.length) return null;

  return (
    <section id={id} className={`${shared.section} ${style.issuesList}`}>
      <div className={shared.container}>
        <div className={style.header}>
          <h2 className={`${shared.heading} ${style.title}`}>
            {dictionary?.panorama?.all_issues}
          </h2>
        </div>

        <ul className={style.issues}>
          {reports.map((report) => {
            const reportPath = getPanoramaReportPath(lang, report.issueNumber);
            return (
              <li key={report.issueNumber}>
                {/* the whole row links to the issue */}
                <Link href={reportPath} className={style.issue}>
                  <div className={style.issueNumber}>
                    {padNumber(report.issueNumber)}
                  </div>
                  <div>
                    <div className={`${shared.eyebrow} ${style.issueCoverage}`}>
                      {report.dateCoverage}
                    </div>
                    <h3 className={`${shared.heading} ${style.issueTitle}`}>
                      {report.title}
                    </h3>
                    <RichText
                      className={style.issueSummary}
                      content={report.summary}
                    />
                  </div>
                  <span className={`${shared.link} ${style.issueRead}`}>
                    {dictionary?.panorama?.read} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default IssuesList;
