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
    name_es: "Definiciones Legales y Reconocimiento de Derechos",
    name_pt: "Definições Legais e Reconhecimento de Direitos",
  },
  {
    id: "B",
    key: "Ownership and Allocation of Mineral Rights",
    name_en: "Ownership and Allocation of Mineral Rights",
    name_es: "Propiedad y Asignación de Derechos Mineros",
    name_pt: "Propriedade e Alocação de Direitos Minerários",
  },
  {
    id: "C",
    key: "Procedures for Acquiring Mining Licenses",
    name_en: "Procedures for Acquiring Mining Licenses",
    name_es: "Procedimientos para la Obtención de Licencias Mineras",
    name_pt: "Procedimentos para Obtenção de Licenças de Mineração",
  },
  {
    id: "D",
    key: "Machinery Regulation",
    name_en: "Machinery Regulation",
    name_es: "Regulación de Maquinaria",
    name_pt: "Regulação de Maquinário",
  },
  {
    id: "E",
    key: "Mercury Regulation",
    name_en: "Mercury Regulation",
    name_es: "Regulación del Mercurio",
    name_pt: "Regulação do Mercúrio",
  },
  {
    id: "F",
    key: "Compliance with the Minamata Convention on Mercury",
    name_en: "Compliance with the Minamata Convention on Mercury",
    name_es: "Cumplimiento del Convenio de Minamata sobre el Mercurio",
    name_pt: "Cumprimento da Convenção de Minamata sobre Mercúrio",
  },
  {
    id: "G",
    key: "Monitoring Systems",
    name_en: "Monitoring Systems",
    name_es: "Sistemas de Monitoreo",
    name_pt: "Sistemas de Monitoramento",
  },
  {
    id: "H",
    key: "Public Participation",
    name_en: "Public Participation",
    name_es: "Participación Pública",
    name_pt: "Participação Pública",
  },
  {
    id: "I",
    key: "Support for Sustainable Mining Initiatives",
    name_en: "Support for Sustainable Mining Initiatives",
    name_es: "Apoyo a Iniciativas de Minería Sostenible",
    name_pt: "Apoio a Iniciativas de Mineração Sustentável",
  },
  {
    id: "J",
    key: "Remediation and Biodiversity Strategy Integration",
    name_en: "Remediation and Biodiversity Strategy Integration",
    name_es: "Integración de Estrategias de Remediación y Biodiversidad",
    name_pt: "Integração de Estratégias de Remediação e Biodiversidade",
  },
  {
    id: "K",
    key: "Gold Supply Chain Regulation and Transparency",
    name_en: "Gold Supply Chain Regulation and Transparency",
    name_es: "Regulación y Transparencia de la Cadena de Suministro de Oro",
    name_pt: "Regulação e Transparência da Cadeia de Suprimento de Ouro",
  },
  {
    id: "L",
    key: "Public Security and Investigation of Mining-Related Crimes",
    name_en: "Public Security and Investigation of Mining-Related Crimes",
    name_es:
      "Seguridad Pública e Investigación de Delitos Relacionados con la Minería",
    name_pt:
      "Segurança Pública e Investigação de Crimes Relacionados à Mineração",
  },
  {
    id: "M",
    key: "Judicial Oversight and Jurisprudence",
    name_en: "Judicial Oversight and Jurisprudence",
    name_es: "Supervisión Judicial y Jurisprudencia",
    name_pt: "Supervisão Judicial e Jurisprudência",
  },
  {
    id: "N",
    key: "Restrictions, Law Enforcement, and Accountability",
    name_en: "Restrictions, Law Enforcement, and Accountability",
    name_es: "Restricciones, Aplicación de la Ley y Rendición de Cuentas",
    name_pt: "Restrições, Aplicação da Lei e Prestação de Contas",
  },
  {
    id: "O",
    key: "Economic and Criminal Sanctions",
    name_en: "Economic and Criminal Sanctions",
    name_es: "Sanciones Económicas y Penales",
    name_pt: "Sanções Econômicas e Penais",
  },
];

export const getPolicyCategoryLocalized = (
  categoryId: string,
  lang: PERMITTED_LANGUAGES,
) => {
  const category = DIMENSION_CATEGORIES.find((c) => c.id === categoryId);
  return category?.[`name_${lang}`] || category?.name_en;
};
