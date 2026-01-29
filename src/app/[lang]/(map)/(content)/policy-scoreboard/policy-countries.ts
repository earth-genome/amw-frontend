import type { PolicyCountry } from "./types";

export const POLICY_COUNTRIES: PolicyCountry[] = [
  { slug: "bolivia", name_en: "Bolivia", name_es: "Bolivia", name_pt: "Bolívia" },
  { slug: "brazil", name_en: "Brazil", name_es: "Brasil", name_pt: "Brasil" },
  { slug: "colombia", name_en: "Colombia", name_es: "Colombia", name_pt: "Colômbia" },
  { slug: "ecuador", name_en: "Ecuador", name_es: "Ecuador", name_pt: "Equador" },
  { slug: "peru", name_en: "Peru", name_es: "Perú", name_pt: "Peru" },
];

export const POLICY_COUNTRY_SLUGS = POLICY_COUNTRIES.map((d) => d.slug);
export type PERMITTED_POLICY_COUNTRY_SLUGS = (typeof POLICY_COUNTRY_SLUGS)[number];
