import { GeoJSONFeature, MiningData } from "@/types/types";
import * as turf from "@turf/turf";

const calculateMiningAreaInBbox = (
  bbox: [number, number, number, number],
  miningData: MiningData | undefined
) => {
  if (!miningData) return null;

  const copiedFeatures = [...miningData.features];
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

  // sum the mined area for those intersecting polygons
  const areaMinesHa = intersectingFeatures.reduce((sum, feature) => {
    return sum + (feature.properties?.["Mined area (ha)"] || 0);
  }, 0);

  return areaMinesHa;
};

export default calculateMiningAreaInBbox;
