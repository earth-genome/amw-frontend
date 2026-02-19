"use client";

import { useState } from "react";
import type {
  PolicyScoreboardRow,
  DimensionName,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import { DIMENSION_COLORS } from "@/app/[lang]/components/PolicyScoreboard";
import { getPolicyCategoryLocalized } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-categories";
import { useParams } from "next/navigation";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import styles from "./style.module.css";

interface CategoryQuestionsTableProps {
  scoreboardData: PolicyScoreboardRow[];
  countryEnglishName: string;
  dimension: DimensionName;
  dictionary: { [key: string]: any };
}

const CategoryQuestionsTable = ({
  scoreboardData,
  countryEnglishName,
  dimension,
  dictionary,
}: CategoryQuestionsTableProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  // Filter data for this dimension
  const dimensionData = scoreboardData.filter(
    (row) => row.Dimension === dimension,
  );

  // Group by category
  const byCategory = dimensionData.reduce<
    Record<string, PolicyScoreboardRow[]>
  >((acc, row) => {
    const category = `${row["Category ID"]}. ${row.Categories}`;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(row);
    return acc;
  }, {});

  const categories = Object.keys(byCategory);

  // Get country-specific column keys
  const evalKey =
    `${countryEnglishName}_Evaluation` as keyof PolicyScoreboardRow;
  const justKey =
    `${countryEnglishName}_Justification` as keyof PolicyScoreboardRow;
  const srcKey = `${countryEnglishName}_Sources` as keyof PolicyScoreboardRow;

  const dimensionColor = DIMENSION_COLORS[dimension];

  const localizeCategoryLabel = (label: string): string => {
    const dotIndex = label.indexOf(". ");
    if (dotIndex === -1) return label;
    const id = label.substring(0, dotIndex);
    return `${id}. ${getPolicyCategoryLocalized(id, lang as PERMITTED_LANGUAGES)}`;
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>{t?.categories_details}</div>
        <div>{t?.categories_details_desc}</div>
      </div>
      {categories.map((category) => {
        const isExpanded = expandedCategory === category;
        const criteria = byCategory[category];

        return (
          <div key={category} className={styles.categorySection}>
            <button
              type="button"
              className={styles.categoryHeader}
              style={{ backgroundColor: `${dimensionColor}` }}
              onClick={() => toggleCategory(category)}
            >
              <div>
                <span>{localizeCategoryLabel(category)}</span>
                <span className={styles.categoryCriteriaCount}>
                  {criteria.length} {t?.criteria}
                </span>
              </div>
              <span className={styles.toggleIcon}>
                {isExpanded ? "−" : "+"}
              </span>
            </button>

            <div
              className={`${styles.accordionContent} ${isExpanded ? styles.accordionExpanded : ""}`}
            >
              <div className={styles.accordionInner}>
                {criteria.map((row) => {
                  const evaluation = row[evalKey] as string;
                  const score = parseFloat(evaluation) || 0;
                  const justification = row[justKey] as string;
                  const sources = row[srcKey] as string;
                  const sourcesSplit = sources
                    ?.split("\n")
                    .map((d) => d.trim());

                  return (
                    <div
                      key={row["Question Number"]}
                      className={styles.questionRow}
                    >
                      <div className={styles.questionHeader}>
                        <div className={styles.questionText}>
                          {row["Question Number"]}. {row.Question}
                        </div>
                        <div
                          className={styles.evaluation}
                          style={{
                            backgroundColor:
                              score > 0
                                ? `${dimensionColor}${Math.round(score * 40 + 10).toString(16)}`
                                : "#f5f5f5",
                            color: score > 0 ? dimensionColor : "#666",
                          }}
                        >
                          {t?.score}: {score}/1
                        </div>
                      </div>

                      {justification && (
                        <div className={styles.justification}>
                          {justification}
                        </div>
                      )}

                      {sourcesSplit?.length ? (
                        <div className={styles.sources}>
                          <div className={styles.sourcesLabel}>
                            {t?.sources}:
                          </div>
                          <div>
                            {sourcesSplit.map((d, i) => (
                              <div
                                key={`${i}-${d}`}
                                className={styles.sourcesItem}
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryQuestionsTable;
