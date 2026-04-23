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
  categories_en: { title: string; desc: string }[];
  categories_es: { title: string; desc: string }[];
  categories_pt: { title: string; desc: string }[];
}

export const POLICY_DIMENSIONS: PolicyDimension[] = [
  {
    slug: "legal-frameworks",
    key: "I. Legal Frameworks",
    name_en: "I. Legal Frameworks",
    name_es: "I. Marcos legales",
    name_pt: "I. Marcos legais",
    desc_en: [
      "The Legal Frameworks dimension evaluates whether a country has built the legal foundation needed to distinguish legitimate artisanal and small-scale gold mining (ASGM) from illegal activity. It looks at how well the law defines what ASGM is, who can do it, and under what conditions, including whether there are pathways for informal miners to formalize. The evaluation focuses on five key categories:",
    ],
    categories_en: [
      {
        title: "Legal Definitions and Rights Recognition",
        desc: ", which examines how mining activities are defined in law and the extent to which the rights of indigenous and local communities are formally recognized;",
      },
      {
        title: "Ownership and Allocation of Mineral Rights",
        desc: ", which investigates the legal framework for mineral ownership and the processes for granting rights to extraction;",
      },
      {
        title: "Procedures for Acquiring Mining Licenses",
        desc: ", which scrutinizes the transparency, accessibility, and requirements of the licensing process;",
      },
      {
        title: "Machinery Regulation",
        desc: ", which assesses the controls and restrictions placed on the types of machinery that can be used in mining operations; and",
      },
      {
        title: "Mercury Regulation",
        desc: ", which evaluates the legal framework for controlling the use and trade of mercury, a substance with significant environmental and health impacts.",
      },
    ],
    desc_es: [
      "La dimensión de Marcos Legales evalúa si un país ha construido la base legal necesaria para distinguir la minería artesanal y de pequeña escala de oro (MAPE) legítima de la actividad ilegal. Examina qué tan bien la ley define qué es la MAPE, quién puede ejercerla y bajo qué condiciones, incluyendo si existen vías para que los mineros informales se formalicen. La evaluación se centra en cinco categorías clave:",
    ],
    categories_es: [
      {
        title: "Definiciones legales y reconocimiento de derechos",
        desc: ", que examina cómo se definen las actividades mineras en la ley y en qué medida se reconocen formalmente los derechos de las comunidades indígenas y locales;",
      },
      {
        title: "Propiedad y asignación de derechos mineros",
        desc: ", que investiga el marco legal para la propiedad de minerales y los procesos para otorgar derechos de extracción;",
      },
      {
        title: "Procedimientos para la obtención de licencias mineras",
        desc: ", que examina la transparencia, accesibilidad y requisitos del proceso de licenciamiento;",
      },
      {
        title: "Regulación de maquinaria",
        desc: ", que evalúa los controles y restricciones sobre los tipos de maquinaria que pueden utilizarse en las operaciones mineras; y",
      },
      {
        title: "Regulación del mercurio",
        desc: ", que evalúa el marco legal para controlar el uso y comercio del mercurio, una sustancia con impactos significativos en el medio ambiente y la salud.",
      },
    ],
    desc_pt: [
      "A dimensão de Marcos Legais avalia se um país construiu a base legal necessária para distinguir a mineração artesanal e de pequena escala de ouro (MAPE) legítima da atividade ilegal. Examina quão bem a lei define o que é a MAPE, quem pode exercê-la e sob quais condições, incluindo se existem caminhos para que os mineradores informais se formalizem. A avaliação se concentra em cinco categorias principais:",
    ],
    categories_pt: [
      {
        title: "Definições legais e reconhecimento de direitos",
        desc: ", que examina como as atividades de mineração são definidas na lei e em que medida os direitos das comunidades indígenas e locais são formalmente reconhecidos;",
      },
      {
        title: "Propriedade e alocação de direitos minerários",
        desc: ", que investiga o marco legal para a propriedade de minerais e os processos para concessão de direitos de extração;",
      },
      {
        title: "Procedimentos para obtenção de licenças de mineração",
        desc: ", que examina a transparência, acessibilidade e requisitos do processo de licenciamento;",
      },
      {
        title: "Regulamentação de maquinário",
        desc: ", que avalia os controles e restrições sobre os tipos de maquinário que podem ser utilizados nas operações de mineração; e",
      },
      {
        title: "Regulamentação do mercúrio",
        desc: ", que avalia o marco legal para controlar o uso e comércio do mercúrio, uma substância com impactos significativos no meio ambiente e na saúde.",
      },
    ],
  },
  {
    slug: "mining-policies",
    key: "II. Mining policies",
    name_en: "II. Mining Policies",
    name_es: "II. Políticas mineras",
    name_pt: "II. Políticas de mineração",
    desc_en: [
      "The Mining Policies dimension evaluates the practical implementation of mining policies and the country's commitment to sustainable and responsible mining practices. It assesses the development of policies and structures in place to ensure that the environmental and social impacts of ASM are mitigated, in line with international standards and best practices. The five categories of criteria in this dimension are:",
    ],
    categories_en: [
      {
        title: "Compliance with the Minamata Convention on Mercury",
        desc: ", which measures the country's progress in implementing this key international treaty aimed at reducing mercury pollution;",
      },
      {
        title: "Monitoring Systems",
        desc: ", which assesses the effectiveness of the systems in place to monitor mining activities and their environmental and social impacts;",
      },
      {
        title: "Public Participation",
        desc: ", which examines the mechanisms and opportunities for public involvement in decision-making processes related to mining;",
      },
      {
        title: "Support for Sustainable Mining Initiatives",
        desc: ", which evaluates the government's efforts to promote and support more sustainable and responsible mining practices; and",
      },
      {
        title: "Remediation and Biodiversity Strategy Integration",
        desc: ", which looks at how the country's policies address the remediation of mining-affected areas and integrate biodiversity conservation into its overall mining strategy.",
      },
    ],
    desc_es: [
      "La dimensión de Políticas Mineras evalúa la implementación práctica de las políticas mineras y el compromiso del país con prácticas mineras sostenibles y responsables. Evalúa el desarrollo de políticas y estructuras existentes para garantizar que los impactos ambientales y sociales de la MAPE sean mitigados, en línea con estándares internacionales y mejores prácticas. Las cinco categorías de criterios en esta dimensión son:",
    ],
    categories_es: [
      {
        title: "Cumplimiento del Convenio de Minamata sobre el Mercurio",
        desc: ", que mide el progreso del país en la implementación de este tratado internacional clave destinado a reducir la contaminación por mercurio;",
      },
      {
        title: "Sistemas de monitoreo",
        desc: ", que evalúa la efectividad de los sistemas existentes para monitorear las actividades mineras y sus impactos ambientales y sociales;",
      },
      {
        title: "Participación pública",
        desc: ", que examina los mecanismos y oportunidades para la participación pública en los procesos de toma de decisiones relacionados con la minería;",
      },
      {
        title: "Apoyo a iniciativas de minería sostenible",
        desc: ", que evalúa los esfuerzos del gobierno para promover y apoyar prácticas mineras más sostenibles y responsables; y",
      },
      {
        title: "Remediación e integración de estrategias de biodiversidad",
        desc: ", que analiza cómo las políticas del país abordan la remediación de áreas afectadas por la minería e integran la conservación de la biodiversidad en su estrategia minera general.",
      },
    ],
    desc_pt: [
      "A dimensão de Políticas de Mineração avalia a implementação prática das políticas de mineração e o compromisso do país com práticas de mineração sustentáveis e responsáveis. Avalia o desenvolvimento de políticas e estruturas existentes para garantir que os impactos ambientais e sociais da MAPE sejam mitigados, em conformidade com padrões internacionais e melhores práticas. As cinco categorias de critérios nesta dimensão são:",
    ],
    categories_pt: [
      {
        title: "Cumprimento da Convenção de Minamata sobre Mercúrio",
        desc: ", que mede o progresso do país na implementação deste tratado internacional fundamental destinado a reduzir a poluição por mercúrio;",
      },
      {
        title: "Sistemas de monitoramento",
        desc: ", que avalia a eficácia dos sistemas existentes para monitorar as atividades de mineração e seus impactos ambientais e sociais;",
      },
      {
        title: "Participação pública",
        desc: ", que examina os mecanismos e oportunidades para o envolvimento público nos processos de tomada de decisão relacionados à mineração;",
      },
      {
        title: "Apoio a iniciativas de mineração sustentável",
        desc: ", que avalia os esforços do governo para promover e apoiar práticas de mineração mais sustentáveis e responsáveis; e",
      },
      {
        title: "Remediação e integração de estratégias de biodiversidade",
        desc: ", que analisa como as políticas do país abordam a remediação de áreas afetadas pela mineração e integram a conservação da biodiversidade em sua estratégia geral de mineração.",
      },
    ],
  },
  {
    slug: "investigation-and-enforcement",
    key: "III. Investigation and enforcement",
    name_en: "III. Investigation and Enforcement",
    name_es: "III. Investigación y ejecución",
    name_pt: "III. Investigação e aplicação da lei",
    desc_en: [
      "The Investigation and Enforcement dimension focuses on the critical aspects of accountability and the enforcement of mining laws and regulations. It examines the capacity and effectiveness of the state in ensuring compliance, investigating illicit activities, and holding perpetrators accountable. The evaluation is structured around five categories:",
    ],
    categories_en: [
      {
        title: "Gold Supply Chain Regulation and Transparency",
        desc: ", which scrutinizes the measures in place to regulate and ensure the transparency of the gold supply chain, from mine to export;",
      },
      {
        title: "Public Security and Investigation of Mining-Related Crimes",
        desc: ", which assesses the capacity of law enforcement and the justice system to investigate and prosecute crimes related to mining;",
      },
      {
        title: "Judicial Oversight and Jurisprudence",
        desc: ", which examines the role of the judiciary in overseeing mining activities and the development of legal precedent in this area;",
      },
      {
        title: "Restrictions, Law Enforcement, and Accountability",
        desc: ", which evaluates the specific restrictions on mining activities and the effectiveness of law enforcement in ensuring compliance; and",
      },
      {
        title: "Economic and Criminal Sanctions",
        desc: ", which assesses the application of sanctions for illegal mining and related crimes.",
      },
    ],
    desc_es: [
      "La dimensión de Investigación y Ejecución se centra en los aspectos críticos de la rendición de cuentas y la aplicación de las leyes y regulaciones mineras. Examina la capacidad y efectividad del Estado para garantizar el cumplimiento, investigar actividades ilícitas y responsabilizar a los infractores. La evaluación se estructura en torno a cinco categorías:",
    ],
    categories_es: [
      {
        title: "Regulación y transparencia de la cadena de suministro de oro",
        desc: ", que examina las medidas existentes para regular y garantizar la transparencia de la cadena de suministro de oro, desde la mina hasta la exportación;",
      },
      {
        title:
          "Seguridad pública e investigación de delitos relacionados con la minería",
        desc: ", que evalúa la capacidad de las fuerzas del orden y el sistema judicial para investigar y enjuiciar delitos relacionados con la minería;",
      },
      {
        title: "Supervisión judicial y jurisprudencia",
        desc: ", que examina el papel del poder judicial en la supervisión de las actividades mineras y el desarrollo de precedentes legales en esta área;",
      },
      {
        title: "Restricciones, aplicación de la ley y rendición de cuentas",
        desc: ", que evalúa las restricciones específicas sobre las actividades mineras y la efectividad de la aplicación de la ley para garantizar el cumplimiento; y",
      },
      {
        title: "Sanciones económicas y penales",
        desc: ", que evalúa la aplicación de sanciones por minería ilegal y delitos relacionados.",
      },
    ],
    desc_pt: [
      "A dimensão de Investigação e Aplicação da Lei concentra-se nos aspectos críticos da responsabilização e da aplicação das leis e regulamentações de mineração. Examina a capacidade e eficácia do Estado em garantir o cumprimento, investigar atividades ilícitas e responsabilizar os infratores. A avaliação está estruturada em torno de cinco categorias:",
    ],
    categories_pt: [
      {
        title:
          "Regulamentação e transparência da cadeia de suprimentos de ouro",
        desc: ", que examina as medidas existentes para regular e garantir a transparência da cadeia de suprimentos de ouro, da mina à exportação;",
      },
      {
        title:
          "Segurança pública e investigação de crimes relacionados à mineração",
        desc: ", que avalia a capacidade das forças de segurança e do sistema judicial para investigar e processar crimes relacionados à mineração;",
      },
      {
        title: "Supervisão judicial e jurisprudência",
        desc: ", que examina o papel do poder judiciário na supervisão das atividades de mineração e o desenvolvimento de precedentes legais nesta área;",
      },
      {
        title: "Restrições, aplicação da lei e responsabilização",
        desc: ", que avalia as restrições específicas sobre as atividades de mineração e a eficácia da aplicação da lei para garantir o cumprimento; e",
      },
      {
        title: "Sanções econômicas e penais",
        desc: ", que avalia a aplicação de sanções por mineração ilegal e crimes relacionados.",
      },
    ],
  },
];

const findDimension = (name_en: string) =>
  POLICY_DIMENSIONS.find((d) =>
    d.name_en.toLowerCase().includes(name_en.toLowerCase()),
  );

export const getPolicyDimensionLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`name_${lang}`] || name_en;

export const getPolicyDimensionDescriptionLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`desc_${lang}`] ?? [];

export const getPolicyDimensionCategoriesLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`categories_${lang}`] ?? [];

export const POLICY_DIMENSION_SLUGS = POLICY_DIMENSIONS.map((d) => d.slug);
export type PolicyDimensionSlug = (typeof POLICY_DIMENSION_SLUGS)[number];
