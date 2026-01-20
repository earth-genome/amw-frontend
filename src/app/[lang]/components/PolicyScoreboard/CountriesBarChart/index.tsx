import styles from "./style.module.css";

const MAX_VALUE = 15;
export const DIMENSION_COLORS = {
  "I. Legal Frameworks": "#4CAF50",
  "II. Mining policies": "#2196F3",
  "III. Investigation and enforcement": "#FF9800",
};

const CountriesBarChart = ({ byDimension, countries }) => {
  const getCountryTotal = (country) =>
    byDimension.reduce(
      (acc, d) => acc + d.countries[country].dimensionScore,
      0
    );

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {countries
          .sort((a, b) => getCountryTotal(b) - getCountryTotal(a))
          .map((country) => (
            <div key={country} className={styles.barRow}>
              <div className={styles.label}>{country}</div>
              <div className={styles.barContainer}>
                <div className={styles.barBackground}>
                  <div className={styles.barStack}>
                    {byDimension.map((dim) => (
                      <div
                        key={dim.Dimension}
                        className={styles.barSegment}
                        style={{
                          width: `${
                            (dim.countries[country].dimensionScore /
                              MAX_VALUE) *
                            100
                          }%`,
                          backgroundColor: DIMENSION_COLORS[dim.Dimension],
                        }}
                        title={`${dim.Dimension}: ${dim.countries[country].dimensionScore}`}
                      />
                    ))}
                  </div>
                </div>
                <span className={styles.value}>
                  {getCountryTotal(country).toFixed(2)}<span>/</span><span>15</span>
                </span>
              </div>
            </div>
          ))}
      </div>

      <div className={styles.legend}>
        {Object.entries(DIMENSION_COLORS).map(([dim, color]) => (
          <div key={dim} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: color }}
            />
            <span>{dim}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountriesBarChart;
