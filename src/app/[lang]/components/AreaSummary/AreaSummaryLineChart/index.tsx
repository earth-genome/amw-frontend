import { AreasTimeseriesData, AreasTimeseriesDataItem } from "@/types/types";
import { useRef } from "react";
import * as d3 from "d3";
import useChartDimensions from "@/hooks/useChartDimensions";

interface AreaSummaryLineChartProps {
  data: AreasTimeseriesData;
  chartHeight?: number;
}

const AreaSummaryLineChart = ({
  data,
  chartHeight = 100,
}: AreaSummaryLineChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: chartWidth } = useChartDimensions(containerRef);

  if (!data?.length) return null;

  const margin = { top: 0, right: 0, bottom: 15, left: 0 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.bottom - margin.top;

  const xExtents = d3.extent(data.map((d) => d.admin_year));
  const xScale = d3
    .scaleLinear()
    .domain((xExtents as [number, number]) || [0, 9999])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.intersected_area_ha_cumulative) ?? 0])
    .range([height, 0]);

  const area = d3
    .area<AreasTimeseriesDataItem>()
    .x((d) => xScale(d.admin_year))
    .y0(height)
    .y1((d) => yScale(d.intersected_area_ha_cumulative))
    .curve(d3.curveLinear);

  const pathData = area(data);

  const xTicks = xExtents;

  return (
    <div ref={containerRef}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="areaGradient"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={height + margin.top}
            x2={width + margin.left}
            y2={margin.top}
          >
            <stop offset="0%" stopColor="#fbe7bf" />
            <stop offset="34.13%" stopColor="#f6cf80" />
            <stop offset="57.21%" stopColor="#f1b640" />
            <stop offset="73.56%" stopColor="#ed9e00" />
            <stop offset="84.13%" stopColor="#f37d00" />
            <stop offset="92.79%" stopColor="#ff3c00" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Area path */}
          <path d={pathData ?? ""} fill="url(#areaGradient)" stroke="none" />

          {/* X-axis ticks and labels */}
          {xTicks.map((year, i) => (
            <text
              key={year}
              x={year ? xScale(year) : 0}
              y={height + margin.bottom}
              textAnchor={
                i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"
              }
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fill: "#2c5f2d",
              }}
            >
              {year}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default AreaSummaryLineChart;
