import { apiFetcher } from "@/cms/client";
import {
  getPanoramaReportUrl,
  PANORAMA_FETCH_OPTIONS,
  PANORAMA_HOME_URL,
  PANORAMA_REPORTS_LIST_URL,
  PanoramaHomeResponse,
  PanoramaReportsListResponse,
  PanoramaReportsResponse,
} from "@/cms/panorama";
import { getDictionary } from "@/get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { HOME_ANCHORS } from "@/app/[lang]/components/Panorama/anchors";
import HomeHero from "@/app/[lang]/components/Panorama/HomeHero";
import TextSection from "@/app/[lang]/components/Panorama/TextSection";
import LatestIssue from "@/app/[lang]/components/Panorama/LatestIssue";
import IssuesList from "@/app/[lang]/components/Panorama/IssuesList";
import TextColumns from "@/app/[lang]/components/Panorama/TextColumns";
import SignUpCta from "@/app/[lang]/components/Panorama/SignUpCta";
import Copyright from "@/app/[lang]/components/Panorama/Copyright";
import style from "./style.module.css";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const fetchHome = (lang: PERMITTED_LANGUAGES) =>
  apiFetcher<PanoramaHomeResponse>(PANORAMA_HOME_URL, {
    ...PANORAMA_FETCH_OPTIONS,
    locale: lang,
  });

// the latest issue is fetched with all its content, to display its cover image and areas count
const fetchLatestReport = async (
  issueNumber: number | undefined,
  lang: PERMITTED_LANGUAGES,
) => {
  if (!issueNumber) return undefined;
  try {
    const response = await apiFetcher<PanoramaReportsResponse>(
      getPanoramaReportUrl(issueNumber),
      { ...PANORAMA_FETCH_OPTIONS, locale: lang },
    );
    return response?.data?.[0];
  } catch (error) {
    console.error(`Error fetching Panorama issue ${issueNumber}`, error);
    return undefined;
  }
};

export async function generateMetadata({ params: { lang } }: PageProps) {
  const [homeResponse, dictionary] = await Promise.all([
    fetchHome(lang).catch(() => undefined),
    getDictionary(lang),
  ]);
  const title =
    homeResponse?.data?.hero?.title || dictionary?.panorama?.panorama;
  return {
    title: `${title} - ${dictionary?.home?.title}`,
  };
}

const Page = async ({ params: { lang } }: PageProps) => {
  const [homeResponse, reportsResponse, dictionary] = await Promise.all([
    fetchHome(lang),
    apiFetcher<PanoramaReportsListResponse>(PANORAMA_REPORTS_LIST_URL, {
      ...PANORAMA_FETCH_OPTIONS,
      locale: lang,
    }),
    getDictionary(lang),
  ]);

  const home = homeResponse?.data;
  const reports = reportsResponse?.data ?? [];
  const latestReport = await fetchLatestReport(reports[0]?.issueNumber, lang);

  return (
    <main>
      <HomeHero
        dictionary={dictionary}
        hero={home?.hero}
        issuesTargetId={HOME_ANCHORS.issues}
        signUpLink={home?.signUp?.link}
      />
      <TextSection id={HOME_ANCHORS.about} section={home?.intro} />
      <LatestIssue
        id={HOME_ANCHORS.issues}
        dictionary={dictionary}
        lang={lang}
        report={latestReport}
      />
      <IssuesList
        id={HOME_ANCHORS.allIssues}
        dictionary={dictionary}
        lang={lang}
        reports={reports}
      />
      <TextColumns sections={[home?.methodology, home?.acknowledgements]} />
      <SignUpCta
        dictionary={dictionary}
        lang={lang}
        signUp={home?.signUp}
        viewMapCta={home?.viewMapCallToAction}
      />
      <footer className={style.footer}>
        <Copyright dictionary={dictionary} />
      </footer>
    </main>
  );
};

export default Page;
