import { PERMITTED_LANGUAGES } from "@/utils/content";

export interface PolicyCategory {
  id: string;
  key: string;
  name_en: string;
  name_es: string;
  name_pt: string;
}

export const DIMENSION_CATEGORIES: PolicyCategory[] = [
  {
    id: "A",
    key: "Legal Definitions and Rights Recognition",
    name_en: "Legal Definitions and Rights Recognition",
    name_es: "Definiciones legales y reconocimiento de derechos",
    name_pt: "Definições Legais e Reconhecimento de Direitos",
  },
  {
    id: "B",
    key: "Ownership and Allocation of Mineral Rights",
    name_en: "Ownership and Allocation of Mineral Rights",
    name_es: "Propiedad y asignación de derechos minerales",
    name_pt: "Propriedade e alocação de direitos minerários",
  },
  {
    id: "C",
    key: "Procedures for Acquiring Mining Licenses",
    name_en: "Procedures for Acquiring Mining Licenses",
    name_es: "Procedimientos para la adquisición de licencias mineras",
    name_pt: "Procedimentos para obtenção de licenças de mineração",
  },
  {
    id: "D",
    key: "Machinery Regulation",
    name_en: "Machinery Regulation",
    name_es: "Reglamento de maquinaria",
    name_pt: "Regulamento de máquinas",
  },
  {
    id: "E",
    key: "Mercury Regulation",
    name_en: "Mercury Regulation",
    name_es: "Regulación del mercurio",
    name_pt: "Regulamentação do mercúrio",
  },
  {
    id: "F",
    key: "Compliance with the Minamata Convention on Mercury",
    name_en: "Compliance with the Minamata Convention on Mercury",
    name_es: "Cumplimiento del Convenio de Minamata sobre el Mercurio",
    name_pt: "Conformidade com a Convenção de Minamata sobre Mercúrio",
  },
  {
    id: "G",
    key: "Monitoring Systems",
    name_en: "Monitoring Systems",
    name_es: "Sistemas de monitoreo",
    name_pt: "Sistemas de monitoramento",
  },
  {
    id: "H",
    key: "Public Participation",
    name_en: "Public Participation",
    name_es: "Participación pública",
    name_pt: "Participação pública",
  },
  {
    id: "I",
    key: "Support for Sustainable Mining Initiatives",
    name_en: "Support for Sustainable Mining Initiatives",
    name_es: "Apoyo a iniciativas de minería sostenible",
    name_pt: "Apoio a iniciativas de mineração sustentável",
  },
  {
    id: "J",
    key: "Remediation and Biodiversity Strategy Integration",
    name_en: "Remediation and Biodiversity Strategy Integration",
    name_es: "Integración de la estrategia de remediación y biodiversidad",
    name_pt: "Integração de estratégias de remediação e biodiversidade",
  },
  {
    id: "K",
    key: "Gold Supply Chain Regulation and Transparency",
    name_en: "Gold Supply Chain Regulation and Transparency",
    name_es: "Regulación y transparencia de la cadena de suministro de oro",
    name_pt:
      "Regulamentação e transparência da cadeia de abastecimento de ouro",
  },
  {
    id: "L",
    key: "Public Security and Investigation of Mining-Related Crimes",
    name_en: "Public Security and Investigation of Mining-Related Crimes",
    name_es:
      "Seguridad pública e investigación de delitos relacionados con la minería",
    name_pt:
      "Segurança pública e investigação de crimes relacionados à mineração",
  },
  {
    id: "M",
    key: "Judicial Oversight and Jurisprudence",
    name_en: "Judicial Oversight and Jurisprudence",
    name_es: "Supervisión judicial y jurisprudencia",
    name_pt: "Supervisão judicial e jurisprudência",
  },
  {
    id: "N",
    key: "Restrictions, Law Enforcement, and Accountability",
    name_en: "Restrictions, Law Enforcement, and Accountability",
    name_es: "Restricciones, aplicación de la ley y rendición de cuentas",
    name_pt: "Restrições, aplicação da lei e responsabilização",
  },
  {
    id: "O",
    key: "Economic and Criminal Sanctions",
    name_en: "Economic and Criminal Sanctions",
    name_es: "Sanciones económicas y penales",
    name_pt: "Sanções econômicas e criminais",
  },
];

export const getPolicyCategoryLocalized = (
  categoryId: string,
  lang: PERMITTED_LANGUAGES,
) => {
  const category = DIMENSION_CATEGORIES.find((c) => c.id === categoryId);
  return category?.[`name_${lang}`] || category?.name_en;
};
