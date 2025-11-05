import { AreasTimeseriesData } from "@/types/types";
import { useContext, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import useChartDimensions from "@/hooks/useChartDimensions";
import {
  displayAreaInUnits,
  formatLayerYear,
  formatNumber,
} from "@/utils/content";
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
    year: string;
    area: string;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const { areaUnits, lang } = state;

  const margin = { top: 10, right: 0, bottom: 15, left: 40 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.bottom - margin.top;

  // // fill missing data
  // const dataFilled = useMemo(() => {
  //   if (!data?.length) return [];

  //   const dataMap = new Map(data.map((d) => [String(d.admin_year), d]));

  //   // extract all years present in data
  //   const allYears = Array.from(
  //     new Set(data.map((d) => Number(String(d.admin_year).slice(0, 4))))
  //   ).sort((a, b) => a - b);

  //   // if there are gaps in years, fill them in too
  //   const fullYearRange = d3.range(
  //     d3.min(allYears) ?? allYears[0],
  //     (d3.max(allYears) ?? allYears[allYears.length - 1]) + 1
  //   );

  //   const filled: AreasTimeseriesData = [];

  //   fullYearRange.forEach((year) => {
  //     const yearStr = String(year);
  //     const yearEntries = data.filter((d) =>
  //       String(d.admin_year).startsWith(yearStr)
  //     );
  //     const hasFull = yearEntries.some(
  //       (d) => String(d.admin_year).slice(4) === "00"
  //     );
  //     const hasQuarters = yearEntries.some(
  //       (d) => String(d.admin_year).slice(4) !== "00"
  //     );

  //     // ensure full year exists
  //     if (!hasFull) {
  //       filled.push({
  //         admin_year: Number(`${yearStr}00`),
  //         intersected_area_ha_cumulative: 0,
  //       } as any);
  //     }

  //     // if quarters exist, ensure all 4 quarters exist
  //     if (hasQuarters) {
  //       for (let q = 1; q <= 4; q++) {
  //         const code = `${yearStr}0${q}`;
  //         if (!dataMap.has(code)) {
  //           filled.push({
  //             admin_year: Number(code),
  //             intersected_area_ha_cumulative: 0,
  //           } as any);
  //         }
  //       }
  //     }

  //     // add all original data from that year
  //     filled.push(...yearEntries);
  //   });

  //   return filled;
  // }, [data]);

  const dataFilled = data;
  if (!dataFilled?.length) return null;

  // group by year
  const groupedData = d3.groups(dataFilled, (d) =>
    String(d.admin_year).slice(0, 4)
  );

  // X scale for the years only, not quarters
  const outerXScale = d3
    .scaleBand()
    .domain(groupedData.map(([year]) => year))
    .range([0, width])
    .padding(0.1);

  // Y scale based on values
  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataFilled, (d) => d.intersected_area_ha_cumulative) ?? 0,
    ])
    .nice()
    .range([height, 0]);

  const yTicks = yScale.ticks(2);
  const valueFormat = (value: number) =>
    formatNumber(
      displayAreaInUnits(value, areaUnits),
      lang,
      AREA_SIGNIFICANT_DIGITS
    );

  const fullBarWidth = outerXScale.bandwidth();
  const quarterBarWidth = fullBarWidth / 4;

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

          {/* bars, grouped by year */}
          {groupedData.map(([year, entries]) => {
            const x0 = outerXScale(year)!;

            const sortedEntries = entries.sort(
              (a, b) =>
                Number(String(a.admin_year).slice(4)) -
                Number(String(b.admin_year).slice(4))
            );

            return (
              <g key={year}>
                {sortedEntries.map((d, i) => {
                  const suffix = String(d.admin_year).slice(4);
                  const isQuarter = suffix !== "00";

                  const barWidth = isQuarter ? quarterBarWidth : fullBarWidth;
                  let x = x0;

                  if (isQuarter) {
                    const quarterIndex = Number(suffix) - 1; // 01 → 0, 02 → 1, etc.
                    x += quarterIndex * quarterBarWidth;
                  }

                  const areaVal = Number(
                    d.intersected_area_ha_cumulative.toPrecision(
                      AREA_SIGNIFICANT_DIGITS
                    )
                  );
                  const y = yScale(areaVal);
                  const h = height - y;

                  const originalIndex = data.findIndex(
                    (dataRow) => dataRow.admin_year === d.admin_year
                  );
                  const color =
                    originalIndex >= 0
                      ? yearsColors[originalIndex % yearsColors.length]
                      : "rgba(0,0,0,0.1)"; // light gray for missing data

                  return (
                    <rect
                      key={d.admin_year}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      fill={color}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const formattedArea = valueFormat(areaVal);
                        setHoveredBar({
                          year: formatLayerYear(d.admin_year),
                          area: formattedArea,
                          color,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}

                {/* X-axis labels */}
                <text
                  x={x0 + fullBarWidth / 2}
                  y={height + margin.bottom}
                  textAnchor="middle"
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    fill: "#2c5f2d",
                  }}
                >
                  {year}
                </text>
              </g>
            );
          })}
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
