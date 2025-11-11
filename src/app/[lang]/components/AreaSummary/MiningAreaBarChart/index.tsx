import { AreasTimeseriesData } from "@/types/types";
import { useContext, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import useChartDimensions from "@/hooks/useChartDimensions";
import {
  displayAreaInUnits,
  formatLayerYear,
  formatNumber,
  numberToSignificantDigits,
} from "@/utils/content";
import { Context } from "@/lib/Store";
import styles from "./styles.module.css";
import { getAreaSignificantDigits } from "@/constants/map";

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
    adminYear: number;
    area: string;
    areaChange: number | null;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const { areaUnits, lang } = state;

  const margin = { top: 10, right: 0, bottom: 15, left: 40 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.bottom - margin.top;

  const dataProcessed = useMemo(() => {
    if (!data?.length) return [];

    const dataWithPrecision = [...data].map((d) => ({
      ...d,
      area_ha_significant: numberToSignificantDigits(
        d.intersected_area_ha_cumulative,
        getAreaSignificantDigits(d.intersected_area_ha_cumulative)
      ),
    }));

    // add color and period change calculation
    return [...dataWithPrecision].map((d, i) => ({
      ...d,
      color: yearsColors[i],
      area_change_ha:
        i > 0
          ? d.area_ha_significant - dataWithPrecision[i - 1].area_ha_significant
          : null,
    }));
  }, [data, yearsColors]);

  if (!dataProcessed?.length) return null;

  // group by year
  const groupedData = d3.groups(dataProcessed, (d) =>
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
      d3.max(dataProcessed, (d) => d.intersected_area_ha_cumulative) ?? 0,
    ])
    .nice()
    .range([height, 0]);

  const yTicks = yScale.ticks(2);
  const valueFormat = (value: number) =>
    formatNumber(
      displayAreaInUnits(value, areaUnits),
      lang,
      getAreaSignificantDigits(value)
    );

  const fullBarWidth = outerXScale.bandwidth();
  const quarterBarWidth = fullBarWidth / 4;

  const resetHoveredYear = () =>
    dispatch({
      type: "SET_HOVERED_YEAR",
      hoveredYear: undefined,
    });

  return (
    <div ref={containerRef} onMouseLeave={() => resetHoveredYear()}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y-axis  */}
          {yTicks.map((tickValue, i) => (
            <g
              key={i}
              transform={`translate(0,${yScale(tickValue)})`}
              onMouseEnter={() => resetHoveredYear()}
            >
              <line
                x1={-5}
                x2={width}
                stroke="var(--green-dark)"
                strokeOpacity={0.11}
                strokeWidth={1}
              />
              <text x={-10} y={5} textAnchor="end" className={styles.yTicks}>
                {valueFormat(tickValue)}
              </text>
            </g>
          ))}

          {/* bars, grouped by year */}
          <g>
            {/* to trigger leave event only outside */}
            <rect
              x={0}
              y={0}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
            />

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
                    let barWidth;
                    let x = x0;

                    // HACK: make 2025 Q2 bar cover 2025 Q1-Q2
                    if (d.admin_year === 202502) {
                      barWidth = fullBarWidth / 2;
                    } else {
                      barWidth = isQuarter ? quarterBarWidth : fullBarWidth;
                      if (isQuarter) {
                        const quarterIndex = Number(suffix) - 1; // 01 → 0, 02 → 1, etc.
                        x += quarterIndex * quarterBarWidth;
                      }
                    }

                    const areaVal = d.area_ha_significant;
                    const y = yScale(areaVal);
                    const h = height - y;

                    const color = d.color || "rgba(0,0,0,0.1)"; // light gray for missing data

                    return (
                      <rect
                        key={d.admin_year}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={h}
                        fill={color}
                        opacity={
                          !hoveredBar || d.admin_year === hoveredBar.adminYear
                            ? 1
                            : 0.3
                        }
                        className={styles.bars}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const formattedArea = valueFormat(areaVal);
                          setHoveredBar({
                            year: formatLayerYear(d.admin_year),
                            adminYear: d.admin_year,
                            area: formattedArea,
                            areaChange: d.area_change_ha,
                            color,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                          dispatch({
                            type: "SET_HOVERED_YEAR",
                            hoveredYear: d.admin_year,
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredBar(null);
                        }}
                      />
                    );
                  })}

                  {/* X-axis labels */}
                  <text
                    x={x0 + fullBarWidth / 2}
                    y={height + margin.bottom}
                    textAnchor="middle"
                    className={styles.xAxisLabels}
                    onMouseEnter={() => resetHoveredYear()}
                  >
                    {year}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* tooltip */}
      {hoveredBar && (
        <div
          className={styles.tooltip}
          style={{
            top: hoveredBar.y - 10,
            left: hoveredBar.x,
          }}
        >
          {/* tooltip title */}
          <div className={styles.tooltipYear}>{hoveredBar.year}</div>

          {/* tooltip content */}
          <div className={styles.tooltipBody}>
            <div className={styles.tooltipArea}>
              {hoveredBar.area} {dictionary?.map_ui?.[`${areaUnits}Abbrev`]}
            </div>
            {Number(hoveredBar.areaChange) > 0 &&
              hoveredBar.areaChange !== null && (
                <div className={styles.tooltipChange}>
                  (+{valueFormat(hoveredBar.areaChange)}{" "}
                  {dictionary?.map_ui?.[`${areaUnits}Abbrev`]})
                </div>
              )}
          </div>

          {/* down arrow */}
          <div className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
};

export default MiningAreaBarChart;
