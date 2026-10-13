import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { i18n } from "@root/i18n-config";
import { getPanoramaMediaUrl } from "@/cms/panorama";
import { loadPanoramaPrintData } from "@/cms/panoramaPrint";
import { getDictionary } from "@/get-dictionary";
import { getDataSnapshot } from "@/constants/map";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import PrintDocument, {
  type PrintBlock,
} from "@/app/[lang]/components/PanoramaPrint/PrintDocument";
import Cover from "@/app/[lang]/components/PanoramaPrint/Cover";
import {
  Contents,
  ContentsItem,
  Introduction,
  KeyFindings,
} from "@/app/[lang]/components/PanoramaPrint/Overview";
import SectionHeader from "@/app/[lang]/components/PanoramaPrint/SectionHeader";
import AreaCard from "@/app/[lang]/components/PanoramaPrint/AreaCard";
import Conclusion from "@/app/[lang]/components/PanoramaPrint/Conclusion";
import BackPage from "@/app/[lang]/components/PanoramaPrint/BackPage";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const SITE_URL = "https://amazonminingwatch.org";
const CONCLUSION_ANCHOR = "conclusion";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
    issue: string;
  };
}

const padNumber = (n: number) => String(n).padStart(2, "0");
const getSectionAnchor = (index: number) => `section-${index}`;

export async function generateMetadata({
  params: { lang },
}: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  return {
    title: `${dictionary?.panorama?.panorama} - ${dictionary?.home?.title}`,
    // only used to generate the PDF
    robots: { index: false, follow: false },
  };
}

// print version of a Panorama report, laid out in letter pages to generate its PDF
const Page = async ({ params: { lang, issue } }: PageProps) => {
  if (!(i18n.locales as readonly string[]).includes(lang)) notFound();

  const [data, dictionary] = await Promise.all([
    loadPanoramaPrintData(issue, lang),
    getDictionary(lang),
  ]);
  if (!data) notFound();

  const { report, home, sections } = data;
  const dataSnapshot = getDataSnapshot(report.dataSnapshot);
  const panorama = dictionary?.panorama;

  const contentsItems: ContentsItem[] = [
    ...sections.map((section, i) => ({
      label: `${padNumber(i + 1)} · ${section.shortTitle}`,
      anchor: getSectionAnchor(i),
    })),
    ...(report.conclusion
      ? [
          {
            label: report.conclusion.title || panorama?.conclusion,
            anchor: CONCLUSION_ANCHOR,
          },
        ]
      : []),
  ];

  const blocks: PrintBlock[] = [
    {
      key: "cover",
      type: "page",
      content: (
        <Cover
          dictionary={dictionary}
          title={report.title}
          issueNumber={report.issueNumber}
          dateCoverage={report.dateCoverage}
          backgroundImageUrl={getPanoramaMediaUrl(
            home?.hero?.backgroundImage?.url,
          )}
        />
      ),
    },
    ...(report.introduction
      ? [
          {
            key: "introduction",
            type: "flow" as const,
            content: (
              <Introduction
                dictionary={dictionary}
                introduction={report.introduction}
              />
            ),
          },
        ]
      : []),
    ...(report.keyFindings
      ? [
          {
            key: "key-findings",
            type: "flow" as const,
            content: <KeyFindings keyFindings={report.keyFindings} />,
          },
        ]
      : []),
    ...(contentsItems.length
      ? [
          {
            key: "contents",
            type: "flow" as const,
            content: <Contents dictionary={dictionary} items={contentsItems} />,
          },
        ]
      : []),
    ...sections.flatMap((section, sectionIndex): PrintBlock[] => [
      {
        key: `section-${section.id}`,
        type: "flow",
        breakBefore: true,
        fullWidth: true,
        anchor: getSectionAnchor(sectionIndex),
        content: (
          <SectionHeader
            eyebrow={`${panorama?.section} ${padNumber(sectionIndex + 1)} · ${
              section.shortTitle
            }`}
            title={section.title}
            text={section.text}
          />
        ),
      },
      // an area per page, the first one below the section header, and its map fills the
      // rest of the page
      ...section.areas.map(
        (area, areaIndex): PrintBlock => ({
          key: `area-${area.id}`,
          type: "flow",
          breakBefore: areaIndex > 0,
          grow: true,
          content: (
            <AreaCard
              dictionary={dictionary}
              lang={lang}
              dataSnapshot={dataSnapshot}
              area={area}
              eyebrow={`${section.shortTitle} · ${areaIndex + 1} ${
                panorama?.of
              } ${section.areas.length}`}
            />
          ),
        }),
      ),
    ]),
    ...(report.conclusion
      ? [
          {
            key: "conclusion",
            type: "flow" as const,
            // the areas keep their pages to themselves
            breakBefore: true,
            anchor: CONCLUSION_ANCHOR,
            content: <Conclusion section={report.conclusion} />,
          },
        ]
      : []),
    {
      key: "back",
      type: "page",
      content: (
        <BackPage
          dictionary={dictionary}
          sections={[home?.intro, home?.methodology, home?.acknowledgements]}
          siteUrl={`${SITE_URL}/${lang}`}
        />
      ),
    },
  ];

  // the maps are rendered in the order of the document
  const mapIds = sections.flatMap((section) =>
    section.areas
      .filter((area) => area.summary?.areaData?.bbox)
      .map((area) => String(area.id)),
  );

  return (
    <PrintDocument
      blocks={blocks}
      mapIds={mapIds}
      footerLabel={`${panorama?.panorama} · ${panorama?.issue} ${report.issueNumber} · ${report.dateCoverage}`}
      preparingLabel={panorama?.preparing_report}
    />
  );
};

export default Page;
