import { MiningLocation } from "@/hooks/useMiningCalculator";

export const filterForMiningCalculator = (
  miningLocations: MiningLocation[] | undefined,
) => {
  // calculator doesn't include Venezuela and French Guyana, so we filter these out
  if (!miningLocations?.length) return [];
  return miningLocations.filter((d) => !["VE", "GF"].includes(d.country));
};
