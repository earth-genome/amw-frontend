"use client";
import React, { Fragment, useMemo } from "react";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import MapLink from "@/app/[lang]/components/Panorama/MapLink";
import ScrollyStep from "@/app/[lang]/components/Panorama/ScrollyStep";
import StepAreaSummary from "@/app/[lang]/components/Panorama/StepAreaSummary";
import { HighlightedAreas as HighlightedAreasData } from "@/cms/panorama";
import { MapParams, parseMapLink } from "@/utils/mapParams";
import {
  getSectionAnchor,
  REPORT_ANCHORS,
} from "@/app/[lang]/components/Panorama/anchors";

interface HighlightedAreasProps {
  dictionary: { [key: string]: any };
  highlightedAreas: HighlightedAreasData | null | undefined;
  lang: string;
}

const padNumber = (n: number) => String(n).padStart(2, "0");

const HighlightedAreas = ({
  dictionary,
  highlightedAreas,
  lang,
}: HighlightedAreasProps) => {
  const sections = useMemo(
    () => highlightedAreas?.sections ?? [],
    [highlightedAreas?.sections],
  );

  // map params for each area, keyed by area id, parsed once so steps keep a stable reference
  const areasParams = useMemo(() => {
    const params: Record<number, MapParams> = {};
    sections.forEach((section) =>
      section.areas?.forEach((area) => {
        params[area.id] = parseMapLink(area.mapLink);
      }),
    );
    return params;
  }, [sections]);

  // the intro shows an overview of the Amazon, in the same period as the first area
  const overviewParams = useMemo<MapParams>(() => {
    const firstArea = sections.find((d) => d.areas?.length)?.areas[0];
    const firstAreaParams = firstArea ? areasParams[firstArea.id] : undefined;
    return {
      activeYear: firstAreaParams?.activeYear,
      isCumulative: firstAreaParams?.isCumulative,
    };
  }, [areasParams, sections]);

  if (!highlightedAreas) return null;

  return (
    <div
      id={REPORT_ANCHORS.highlightedAreas}
      className={style.highlightedAreas}
    >
      <ScrollyStep
        params={overviewParams}
        label={highlightedAreas.title}
        className={style.intro}
      >
        <div className={style.introContent}>
          <h2 className={`${shared.heading} ${style.introTitle}`}>
            {highlightedAreas.title}
          </h2>
          <RichText
            className={style.introText}
            content={highlightedAreas.text}
          />
        </div>
      </ScrollyStep>

      {sections.map((section, sectionIndex) => (
        <Fragment key={section.id}>
          <section
            id={getSectionAnchor(sectionIndex)}
            className={`${shared.section} ${style.sectionIntro}`}
          >
            <div className={`${shared.container} ${style.sectionIntroContent}`}>
              <div className={shared.eyebrow}>
                {dictionary?.panorama?.section} {padNumber(sectionIndex + 1)} ·{" "}
                {section.shortTitle}
              </div>
              <h2 className={`${shared.heading} ${style.sectionTitle}`}>
                {section.title}
              </h2>
              <RichText className={style.sectionText} content={section.text} />
            </div>
          </section>

          {section.areas?.map((area, areaIndex) => (
            <ScrollyStep
              key={area.id}
              params={areasParams[area.id]}
              label={area.title}
              className={style.areaStep}
            >
              <article className={style.areaCard}>
                <div className={style.areaEyebrow}>
                  {section.shortTitle} · {areaIndex + 1}{" "}
                  {dictionary?.panorama?.of} {section.areas.length}
                </div>
                <h3 className={`${shared.heading} ${style.areaTitle}`}>
                  {area.title}
                </h3>
                {area.location && (
                  <div className={style.areaLocation}>{area.location}</div>
                )}
                <RichText className={style.areaText} content={area.text} />
                {area.miningUpdate && (
                  <div className={style.miningUpdate}>
                    <span className={style.miningUpdateLabel}>
                      {dictionary?.panorama?.mining_update}
                    </span>
                    <RichText content={area.miningUpdate} />
                  </div>
                )}
                <MapLink
                  mapLink={area.mapLink}
                  lang={lang}
                  label={dictionary?.panorama?.see_on_map}
                />
              </article>
              <StepAreaSummary
                dictionary={dictionary}
                params={areasParams[area.id]}
                className={style.areaSummaryWrapper}
                summaryClassName={style.areaSummary}
              />
            </ScrollyStep>
          ))}
        </Fragment>
      ))}
    </div>
  );
};

export default HighlightedAreas;
