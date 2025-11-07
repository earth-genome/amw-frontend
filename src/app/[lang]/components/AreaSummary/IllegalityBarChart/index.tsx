import { useState } from "react";
import { ConfigProvider, Tooltip } from "antd";
import { format } from "d3";
import {
  ILLEGALITY_COLORS,
  ILLEGALITY_KEYS,
  PERMITTED_ILLEGALITY_KEYS,
} from "@/constants/map";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    alignItems: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
  },
  legendColor: {
    width: "12px",
    height: "12px",
  },
  barContainer: {
    display: "flex",
    width: "100%",
    height: "25px",
    overflow: "hidden",
  },
  barSegment: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
  },
  barSegmentLight: {
    color: "#333",
  },
  barSegmentDark: {
    color: "#fff",
  },
  barLabel: {
    fontSize: "14px",
    fontWeight: 600,
    transition: "opacity 0.3s ease",
    marginLeft: "4px",
  },
  faded: {
    opacity: 0.3,
  },
  hidden: {
    opacity: 0,
  },
};

interface IllegalityBarChartProps {
  percentages: {
    key: number;
    label: string;
    value: number;
  }[];
  dictionary: { [key: string]: any };
}

const IllegalityBarChart = ({
  percentages,
  dictionary,
}: IllegalityBarChartProps) => {
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);

  const sortedPercentages = [...percentages].sort((a, b) => b.key - a.key);

  return (
    <div style={styles.container}>
      {/* legend */}
      <div style={styles.legend}>
        {sortedPercentages.map((d) => (
          <div key={d.label} style={styles.legendItem}>
            <div
              style={{
                ...styles.legendColor,
                background:
                  ILLEGALITY_COLORS[d.key as PERMITTED_ILLEGALITY_KEYS],
              }}
            ></div>
            {d.label}
          </div>
        ))}
      </div>
      <div style={styles.barContainer}>
        <ConfigProvider
          theme={{
            components: {
              Tooltip: {
                colorBgSpotlight: "#003E36",
                colorTextLightSolid: "#fff",
                paddingXS: 12,
              },
            },
          }}
        >
          {sortedPercentages.map((d) => {
            const illegalityKey =
              ILLEGALITY_KEYS?.[d.key as PERMITTED_ILLEGALITY_KEYS];
            const illegalityTooltip =
              dictionary.illegality_tooltip?.[illegalityKey];
            return (
              <Tooltip
                key={d.label}
                title={
                  <div>
                    <strong>{d.label} ({format("0.1~%")(d.value)}): </strong>
                    {illegalityTooltip}
                  </div>
                }
                placement="top"
              >
                <div
                  style={{
                    ...styles.barSegment,
                    ...(d.key - 1 === 0
                      ? styles.barSegmentLight
                      : styles.barSegmentDark),
                    width: `${d.value * 100}%`,
                    background:
                      ILLEGALITY_COLORS[d.key as PERMITTED_ILLEGALITY_KEYS],
                    ...(hoveredKey !== null && hoveredKey !== d.key
                      ? styles.faded
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredKey(d.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {d.value > 0.1 && (
                    <div
                      style={{
                        ...styles.barLabel,
                        ...(hoveredKey !== null ? styles.hidden : {}),
                      }}
                    >
                      {format("0.0~%")(d.value)}
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </ConfigProvider>
      </div>
    </div>
  );
};

export default IllegalityBarChart;
