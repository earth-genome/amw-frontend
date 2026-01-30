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
    desc_en: [
      "The Legal Frameworks dimension evaluates whether a country has built the legal foundation needed to distinguish legitimate artisanal and small-scale gold mining (ASGM) from illegal activity. It looks at how well the law defines what ASGM is, who can do it, and under what conditions — including whether there are pathways for informal miners to formalize.",
      "It also examines whether the regulatory architecture around mining rights, licensing, machinery use, and mercury is coherent and enforceable, with transparent registries that allow both authorities and the public to track what is happening on the ground.",
    ],
    desc_es: [
      "La dimensión de Marcos Legales evalúa si un país ha construido la base legal necesaria para distinguir la minería artesanal y de pequeña escala de oro (MAPE) legítima de la actividad ilegal. Examina qué tan bien la ley define qué es la MAPE, quién puede ejercerla y bajo qué condiciones — incluyendo si existen vías para que los mineros informales se formalicen.",
      "También examina si la arquitectura regulatoria en torno a derechos mineros, licencias, uso de maquinaria y mercurio es coherente y aplicable, con registros transparentes que permitan tanto a las autoridades como al público hacer seguimiento de lo que ocurre en el terreno.",
    ],
    desc_pt: [
      "A dimensão de Marcos Legais avalia se um país construiu a base legal necessária para distinguir a mineração artesanal e de pequena escala de ouro (MAPE) legítima da atividade ilegal. Examina quão bem a lei define o que é a MAPE, quem pode exercê-la e sob quais condições — incluindo se existem caminhos para que mineradores informais se formalizem.",
      "Também examina se a arquitetura regulatória em torno de direitos minerários, licenças, uso de maquinário e mercúrio é coerente e aplicável, com registros transparentes que permitam tanto às autoridades quanto ao público acompanhar o que ocorre no terreno.",
    ],
  },
  {
    slug: "mining-policies",
    key: "II. Mining policies",
    name_en: "II. Mining Policies",
    name_es: "II. Políticas Mineras",
    name_pt: "II. Políticas de Mineração",
    desc_en: [
      "The Mining Policies dimensions, assesses how actively a country translates its legal commitments into concrete policy action. Central to this is the country's engagement with the Minamata Convention on Mercury — not just whether it ratified the treaty, but whether it produced a meaningful national action plan that addresses the specific realities of its territory, including ecosystems like the Amazon.",
      "Beyond mercury, this dimension examines whether governments are actually monitoring mining's environmental and health impacts, whether affected communities have a genuine voice in decision-making, and whether the state invests in helping miners transition to sustainable practices rather than relying solely on prohibition.",
    ],
    desc_es: [
      "La dimensión de Políticas Mineras evalúa cuán activamente un país traduce sus compromisos legales en acciones concretas de política pública. Central a esto es el compromiso del país con el Convenio de Minamata sobre el Mercurio — no solo si ratificó el tratado, sino si produjo un plan de acción nacional significativo que aborde las realidades específicas de su territorio, incluyendo ecosistemas como la Amazonía.",
      "Más allá del mercurio, esta dimensión examina si los gobiernos están efectivamente monitoreando los impactos ambientales y de salud de la minería, si las comunidades afectadas tienen una voz genuina en la toma de decisiones, y si el Estado invierte en ayudar a los mineros a transitar hacia prácticas sostenibles en lugar de depender únicamente de la prohibición.",
    ],
    desc_pt: [
      "A dimensão de Políticas de Mineração avalia quão ativamente um país traduz seus compromissos legais em ações concretas de política pública. Central a isso é o engajamento do país com a Convenção de Minamata sobre Mercúrio — não apenas se ratificou o tratado, mas se produziu um plano de ação nacional significativo que aborde as realidades específicas de seu território, incluindo ecossistemas como a Amazônia.",
      "Além do mercúrio, esta dimensão examina se os governos estão efetivamente monitorando os impactos ambientais e de saúde da mineração, se as comunidades afetadas têm uma voz genuína na tomada de decisões, e se o Estado investe em ajudar os mineradores a transitar para práticas sustentáveis em vez de depender unicamente da proibição.",
    ],
  },
  {
    slug: "investigation-and-enforcement",
    key: "III. Investigation and enforcement",
    name_en: "III. Investigation and Enforcement",
    name_es: "III. Investigación y Aplicación",
    name_pt: "III. Investigação e Fiscalização",
    desc_en: [
      "The Investigation and Enforcement dimension measures a country's capacity to detect, investigate, and punish illegal gold mining and the criminal networks behind it. This goes beyond having laws on the books — it asks whether there are specialized enforcement units with real reach, whether the gold supply chain is traceable from mine to market, and whether the judiciary has meaningfully engaged with mining-related environmental harm.",
      "It also considers whether sanctions are strong enough to deter bad actors, whether cross-border cooperation exists to address what is fundamentally a transnational problem, and whether modern tools like satellite imagery can be used as evidence.",
    ],
    desc_es: [
      "La dimensión de Investigación y Aplicación mide la capacidad de un país para detectar, investigar y sancionar la minería ilegal de oro y las redes criminales detrás de ella. Esto va más allá de tener leyes vigentes — pregunta si existen unidades de aplicación especializadas con alcance real, si la cadena de suministro de oro es rastreable desde la mina hasta el mercado, y si el poder judicial se ha involucrado de manera significativa con el daño ambiental relacionado con la minería.",
      "También considera si las sanciones son lo suficientemente fuertes para disuadir a los actores ilegales, si existe cooperación transfronteriza para abordar lo que es fundamentalmente un problema transnacional, y si herramientas modernas como imágenes satelitales pueden ser utilizadas como evidencia.",
    ],
    desc_pt: [
      "A dimensão de Investigação e Fiscalização mede a capacidade de um país para detectar, investigar e punir a mineração ilegal de ouro e as redes criminosas por trás dela. Isso vai além de ter leis vigentes — pergunta se existem unidades de fiscalização especializadas com alcance real, se a cadeia de suprimento de ouro é rastreável da mina ao mercado, e se o judiciário se envolveu de forma significativa com os danos ambientais relacionados à mineração.",
      "Também considera se as sanções são fortes o suficiente para dissuadir atores ilegais, se existe cooperação transfronteiriça para abordar o que é fundamentalmente um problema transnacional, e se ferramentas modernas como imagens de satélite podem ser utilizadas como evidência.",
    ],
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
