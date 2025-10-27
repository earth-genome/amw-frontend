import { GeoJSONFeature, MiningData } from "@/types/types";
import * as turf from "@turf/turf";

const calculateMiningAreaInBbox = (
  bbox: [number, number, number, number],
  activeLayer: string,
  miningData: MiningData | undefined
) => {
  if (!miningData) return null;

  const filteredFeatures = miningData?.features?.filter(
    (feature: GeoJSONFeature) =>
      Number(feature?.properties?.year) <= Number(activeLayer)
  );
  if (!filteredFeatures.length) return null;

  let areaMinesSquareMeters = 0;
  for (const feature of filteredFeatures) {
    // only process Polygon and MultiPolygon features
    if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    ) {
      const clipped = turf.bboxClip(
        feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
        bbox
      );
      areaMinesSquareMeters += turf.area(clipped);
    }
  }
  const areaMinesHa = areaMinesSquareMeters / 10_000;

  return areaMinesHa;
};

export default calculateMiningAreaInBbox;
