import { AreasTimeseriesData } from "@/types/types";
import { useContext, useRef, useState } from "react";
import * as d3 from "d3";
import useChartDimensions from "@/hooks/useChartDimensions";
import { displayAreaInUnits, formatNumber } from "@/utils/content";
import { Context } from "@/lib/Store";
import { AREA_SIGNIFICANT_DIGITS } from "@/constants/map";

interface MiningAreaBarChartProps {
  dictionary: { [key: string]: any };
  data: AreasTimeseriesData;
  chartHeight?: number;
  yearsColors: string[];
}

const MiningAreaBarChart = ({
  data,
  dictionary,
  chartHeight = 100,
  yearsColors,
}: MiningAreaBarChartProps) => {
  const [state, dispatch] = useContext(Context)!;
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: chartWidth } = useChartDimensions(containerRef);
  const [hoveredBar, setHoveredBar] = useState<{
    year: number;
    area: string;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const { areaUnits, lang } = state;

  if (!data?.length) return null;

  const margin = { top: 10, right: 0, bottom: 15, left: 40 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.bottom - margin.top;

  // X scale based on discrete years
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.admin_year.toString()))
    .range([0, width])
    .padding(0.1);

  // Y scale based on values
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.intersected_area_ha_cumulative) ?? 0])
    .nice()
    .range([height, 0]);

  const yTicks = yScale.ticks(2);
  const valueFormat = (value: number) =>
    formatNumber(
      displayAreaInUnits(value, areaUnits),
      lang,
      AREA_SIGNIFICANT_DIGITS
    );

  return (
    <div ref={containerRef}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y-axis  */}
          {yTicks.map((tickValue, i) => (
            <g key={i} transform={`translate(0,${yScale(tickValue)})`}>
              <line
                x1={-5}
                x2={width}
                stroke="var(--green-dark)"
                strokeOpacity={0.11}
                strokeWidth={1}
              />
              <text
                x={-10}
                y={5}
                textAnchor="end"
                style={{
                  fontSize: "12px",
                  fill: "var(--green-dark)",
                }}
              >
                {valueFormat(tickValue)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const areaSignificantDigits = Number(
              d.intersected_area_ha_cumulative.toPrecision(
                AREA_SIGNIFICANT_DIGITS
              )
            );
            return (
              <rect
                key={d.admin_year}
                x={xScale(d.admin_year.toString())}
                y={yScale(areaSignificantDigits)}
                width={xScale.bandwidth()}
                height={height - yScale(areaSignificantDigits)}
                fill={yearsColors[i]}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const formattedArea = valueFormat(areaSignificantDigits);
                  setHoveredBar({
                    year: d.admin_year,
                    area: formattedArea,
                    color: yearsColors[i],
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredBar(null)}
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.admin_year}
              x={
                (xScale(d.admin_year.toString()) ?? 0) + xScale.bandwidth() / 2
              }
              y={height + margin.bottom}
              textAnchor="middle"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fill: "#2c5f2d",
              }}
            >
              {d.admin_year}
            </text>
          ))}
        </g>
      </svg>

      {/* tooltip */}
      {hoveredBar && (
        <div
          style={{
            position: "fixed",
            top: hoveredBar.y - 60,
            left: hoveredBar.x,
            transform: "translateX(-50%) translateY(0px)",
            background: "var(--green-dark)",
            color: "#fff",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {/* tooltip content */}
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {hoveredBar.year}
          </div>
          <div>
            {hoveredBar.area} {dictionary?.map_ui?.[`${areaUnits}Abbrev`]}
          </div>

          {/* down arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid var(--green-dark)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MiningAreaBarChart;
