"use client";

import { useState } from "react";
import { ConfigProvider, Tooltip } from "antd";
import styles from "./style.module.css";

interface Segment {
  key: string;
  value: number;
  color: string;
  label?: string;
}

interface BarItem {
  key: string;
  label: React.ReactNode;
  segments: Segment[];
  total: number;
  formatter?: Function;
}

interface StackedBarChartProps {
  items: BarItem[];
  maxValue: number;
  legend?: { label: string; color: string }[];
  showLegend?: boolean;
  showMaxValue?: boolean;
  compact?: boolean;
}

const StackedBarChart = ({
  items,
  maxValue,
  legend,
  showLegend = true,
  showMaxValue = false,
  compact = false,
}: StackedBarChartProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <div className={`${styles.chart} ${compact ? styles.compact : ""}`}>
        {items.map((item) => (
          <div key={item.key} className={styles.barWrapper}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.barRow}>
              <div className={styles.barContainer}>
                <div className={styles.barBackground}>
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
                    <div className={styles.barStack}>
                      {item.segments.map((segment) => (
                        <Tooltip
                          key={segment.key}
                          title={segment.label}
                          placement="top"
                        >
                          <div
                            className={styles.barSegment}
                            style={{
                              width: `${(segment.value / maxValue) * 100}%`,
                              backgroundColor: segment.color,
                              opacity:
                                hoveredSegment !== null &&
                                hoveredSegment !== segment.key
                                  ? 0.3
                                  : 1,
                            }}
                            onMouseEnter={() => setHoveredSegment(segment.key)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </ConfigProvider>
                </div>
                <span className={styles.value}>
                  {item.formatter ? item.formatter(item.total) : item.total.toFixed(2)}
                  {showMaxValue && (
                    <>
                      <span>/</span>
                      <span>{maxValue}</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLegend && legend && (
        <div className={styles.legend}>
          {legend.map(({ label, color }) => (
            <div key={label} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
