import { notFound } from "next/navigation";
import { apiFetcher } from "@/cms/client";
import {
  getPanoramaHomePath,
  getPanoramaMediaUrl,
  getPanoramaReportUrl,
  PANORAMA_FETCH_OPTIONS,
  PANORAMA_HOME_URL,
  PANORAMA_REPORTS_LIST_URL,
  PanoramaHomeResponse,
  PanoramaReportsListResponse,
  PanoramaReportsResponse,
  parsePanoramaIssueParam,
} from "@/cms/panorama";
import { getDictionary } from "@/get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import MapWrapper from "@/app/[lang]/components/Map/Wrapper";
import ScrollyProvider from "@/app/[lang]/components/Panorama/ScrollyProvider";
import ScrollyMap from "@/app/[lang]/components/Panorama/ScrollyMap";
import Hero from "@/app/[lang]/components/Panorama/Hero";
import HeroImage from "@/app/[lang]/components/Panorama/HeroImage";
import TextSection from "@/app/[lang]/components/Panorama/TextSection";
import KeyFindings from "@/app/[lang]/components/Panorama/KeyFindings";
import HighlightedAreas from "@/app/[lang]/components/Panorama/HighlightedAreas";
import ViewMapCta from "@/app/[lang]/components/Panorama/ViewMapCta";
import Footer from "@/app/[lang]/components/Panorama/Footer";
import ReportNav, {
  type ReportNavItem,
} from "@/app/[lang]/components/Panorama/ReportNav";
import {
  getSectionAnchor,
  HOME_ANCHORS,
  REPORT_ANCHORS,
} from "@/app/[lang]/components/Panorama/anchors";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
    issue: string;
  };
}

const fetchReport = async (issue: string, lang: PERMITTED_LANGUAGES) => {
  const issueNumber = parsePanoramaIssueParam(issue);
  if (!issueNumber) return undefined;

  const response = await apiFetcher<PanoramaReportsResponse>(
    getPanoramaReportUrl(issueNumber),
    { ...PANORAMA_FETCH_OPTIONS, locale: lang },
  );
  return response?.data?.[0];
};

// the home content (methodology, sign up, etc.) and issues list are not essential to the report
const fetchOptional = async <T,>(
  url: string,
  lang: PERMITTED_LANGUAGES,
): Promise<T | undefined> => {
  try {
    return await apiFetcher<T>(url, {
      ...PANORAMA_FETCH_OPTIONS,
      locale: lang,
    });
  } catch (error) {
    console.error(`Error fetching ${url}`, error);
    return undefined;
  }
};

export async function generateMetadata({ params: { lang, issue } }: PageProps) {
  const [report, dictionary] = await Promise.all([
    fetchReport(issue, lang),
    getDictionary(lang),
  ]);
  if (!report) return { title: dictionary?.home?.title };

  return {
    title: `${report.title} - ${dictionary?.panorama?.issue} ${report.issueNumber} - ${dictionary?.home?.title}`,
  };
}

const Page = async ({ params: { lang, issue } }: PageProps) => {
  const [report, homeResponse, reportsResponse, dictionary] = await Promise.all(
    [
      fetchReport(issue, lang),
      fetchOptional<PanoramaHomeResponse>(PANORAMA_HOME_URL, lang),
      fetchOptional<PanoramaReportsListResponse>(
        PANORAMA_REPORTS_LIST_URL,
        lang,
      ),
      getDictionary(lang),
    ],
  );

  if (!report) notFound();

  const home = homeResponse?.data;
  const reports = reportsResponse?.data ?? [];
  const issuesHref = `${getPanoramaHomePath(lang)}#${HOME_ANCHORS.allIssues}`;

  // report navbar items, for the sections present in the report
  const navItems: ReportNavItem[] = [
    ...(report.introduction
      ? [{ id: REPORT_ANCHORS.overview, label: dictionary?.panorama?.overview }]
      : []),
    ...(report.keyFindings
      ? [
          {
            id: REPORT_ANCHORS.keyFindings,
            label: dictionary?.panorama?.key_findings,
          },
        ]
      : []),
    ...(report.highlightedAreas?.sections ?? []).map((section, i) => ({
      id: getSectionAnchor(i),
      label: section.shortTitle,
    })),
    ...(report.conclusion
      ? [
          {
            id: REPORT_ANCHORS.conclusion,
            label: dictionary?.panorama?.conclusion,
          },
        ]
      : []),
  ];

  return (
    <MapWrapper lang={lang} syncQueryParams={false}>
      <ScrollyProvider>
        <ScrollyMap dictionary={dictionary} />

        <main>
          <Hero
            dictionary={dictionary}
            title={report.title}
            issueNumber={report.issueNumber}
            dateCoverage={report.dateCoverage}
            summary={report?.summary}
            pdfReport={report.pdfReport}
            signUpLink={home?.signUp?.link}
            issuesHref={issuesHref}
            backgroundImageUrl={getPanoramaMediaUrl(
              home?.hero?.backgroundImage?.url,
            )}
          />
          <HeroImage heroImage={report.heroImage} />
          <TextSection
            id={REPORT_ANCHORS.overview}
            section={report.introduction}
          />
          <KeyFindings
            id={REPORT_ANCHORS.keyFindings}
            dictionary={dictionary}
            keyFindings={report.keyFindings}
            dateCoverage={report.dateCoverage}
            lang={lang}
          />
          <ReportNav
            dictionary={dictionary}
            issueNumber={report.issueNumber}
            items={navItems}
            progressTargetId={REPORT_ANCHORS.highlightedAreas}
          />
          <HighlightedAreas
            dictionary={dictionary}
            highlightedAreas={report.highlightedAreas}
            lang={lang}
          />
          <ViewMapCta
            dictionary={dictionary}
            cta={home?.viewMapCallToAction}
            lang={lang}
          />
          <TextSection
            id={REPORT_ANCHORS.conclusion}
            section={report.conclusion}
            variant="dark"
          />
          <Footer
            dictionary={dictionary}
            lang={lang}
            methodology={home?.methodology}
            acknowledgements={home?.acknowledgements}
            signUp={home?.signUp}
            pdfReport={report.pdfReport}
            reports={reports}
            currentIssueNumber={report.issueNumber}
            issuesHref={issuesHref}
          />
        </main>
      </ScrollyProvider>
    </MapWrapper>
  );
};

export default Page;
