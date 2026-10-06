// anchors of the report sections, used by the report navbar

export const REPORT_ANCHORS = {
  overview: "overview",
  keyFindings: "key-findings",
  highlightedAreas: "highlighted-areas",
  conclusion: "conclusion",
};

export const getSectionAnchor = (sectionIndex: number) =>
  `section-${sectionIndex + 1}`;

// anchors of the home page sections, also linked from the navbar
export const HOME_ANCHORS = {
  about: "about",
  issues: "issues", // latest issue
  allIssues: "all-issues",
};
