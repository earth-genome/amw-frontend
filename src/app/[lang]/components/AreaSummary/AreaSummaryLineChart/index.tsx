import { AreasTimeseriesData } from "@/types/types";

interface AreaSummaryLineChartProps {
  data: AreasTimeseriesData | undefined;
}

const AreaSummaryLineChart = ({ data }: AreaSummaryLineChartProps) => {
  console.log(data);

  return null;
};

export default AreaSummaryLineChart;
