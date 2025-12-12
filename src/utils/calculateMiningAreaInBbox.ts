import { LAYER_YEARS } from "@/constants/map";
import { MiningData } from "@/types/types";
import * as turf from "@turf/turf";

const calculateMiningAreaInBbox = (
  bbox: [number, number, number, number],
  miningData: MiningData | undefined
) => {
  if (!miningData) return null;

  const copiedFeatures = [...miningData?.features];
  if (!copiedFeatures.length) return null;

  const bboxPolygon = turf.bboxPolygon(bbox);

  // filter only polygons that intersect the bbox
  const intersectingFeatures = copiedFeatures.filter((feature) => {
    if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    ) {
      return turf.booleanIntersects(feature, bboxPolygon);
    }
    return false;
  });

  // total mined area
  const areaMinesHa = intersectingFeatures.reduce(
    (sum, feature) => sum + (feature.properties?.["Mined area (ha)"] || 0),
    0
  );

  // mined area per year
  const areaMinesHaPerYear = intersectingFeatures.reduce((acc, feature) => {
    const year = feature.properties?.["year"];
    const area = feature.properties?.["Mined area (ha)"] || 0;
    acc[year] = (acc[year] || 0) + area;
    return acc;
  }, {} as Record<string, number>);

  // calculate cumulative sum, filling in gaps in years if any
  let cumulative = 0;
  const areaMinesHaPerYearArray = LAYER_YEARS.map((year) => {
    const area = areaMinesHaPerYear[year] || 0;
    cumulative += area;
    return {
      admin_year: year,
      intersected_area_ha_cumulative: cumulative,
    };
  });

  return { areaMinesHa, areaMinesHaPerYearArray };
};

export default calculateMiningAreaInBbox;
