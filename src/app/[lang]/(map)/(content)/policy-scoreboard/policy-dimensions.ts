import { PERMITTED_LANGUAGES } from "@/utils/content";

export interface PolicyDimension {
  slug: string;
  key: string;
  name_en: string;
  name_es: string;
  name_pt: string;
  desc_en: string[];
  desc_es: string[];
  desc_pt: string[];
}

export const POLICY_DIMENSIONS: PolicyDimension[] = [
  {
    slug: "legal-frameworks",
    key: "I. Legal Frameworks",
    name_en: "I. Legal Frameworks",
    name_es: "I. Marcos Legales",
    name_pt: "I. Marcos Legais",
    // TODO: localize
    desc_en: [
      "The Legal Frameworks dimension evaluates whether a country has built the legal foundation needed to distinguish legitimate artisanal and small-scale gold mining (ASGM) from illegal activity. It looks at how well the law defines what ASGM is, who can do it, and under what conditions — including whether there are pathways for informal miners to formalize.",
      "It also examines whether the regulatory architecture around mining rights, licensing, machinery use, and mercury is coherent and enforceable, with transparent registries that allow both authorities and the public to track what is happening on the ground.",
    ],
    desc_es: [""],
    desc_pt: [""],
  },
  {
    slug: "mining-policies",
    key: "II. Mining policies",
    name_en: "II. Mining Policies",
    name_es: "II. Políticas Mineras",
    name_pt: "II. Políticas de Mineração",
    // TODO: localize
    desc_en: [
      "The Mining Policies dimensions, assesses how actively a country translates its legal commitments into concrete policy action. Central to this is the country's engagement with the Minamata Convention on Mercury — not just whether it ratified the treaty, but whether it produced a meaningful national action plan that addresses the specific realities of its territory, including ecosystems like the Amazon.",
      "Beyond mercury, this dimension examines whether governments are actually monitoring mining's environmental and health impacts, whether affected communities have a genuine voice in decision-making, and whether the state invests in helping miners transition to sustainable practices rather than relying solely on prohibition.",
    ],
    desc_es: [""],
    desc_pt: [""],
  },
  {
    slug: "investigation-and-enforcement",
    key: "III. Investigation and enforcement",
    name_en: "III. Investigation and Enforcement",
    name_es: "III. Investigación y Aplicación",
    name_pt: "III. Investigação e Fiscalização",
    // TODO: localize
    desc_en: [
      "The Investigation and Enforcement dimension measures a country's capacity to detect, investigate, and punish illegal gold mining and the criminal networks behind it. This goes beyond having laws on the books — it asks whether there are specialized enforcement units with real reach, whether the gold supply chain is traceable from mine to market, and whether the judiciary has meaningfully engaged with mining-related environmental harm.",
      "It also considers whether sanctions are strong enough to deter bad actors, whether cross-border cooperation exists to address what is fundamentally a transnational problem, and whether modern tools like satellite imagery can be used as evidence.",
    ],
    desc_es: [""],
    desc_pt: [""],
  },
];

export const getPolicyDimensionLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) =>
  POLICY_DIMENSIONS.find((d) =>
    d.name_en.toLowerCase().includes(name_en.toLowerCase()),
  )?.[`name_${lang}`] || name_en;

export const getPolicyDimensionDescriptionLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) =>
  POLICY_DIMENSIONS.find((d) =>
    d.name_en.toLowerCase().includes(name_en.toLowerCase()),
  )?.[`desc_${lang}`] ?? [];

export const POLICY_DIMENSION_SLUGS = POLICY_DIMENSIONS.map((d) => d.slug);
export type PolicyDimensionSlug = (typeof POLICY_DIMENSION_SLUGS)[number];
