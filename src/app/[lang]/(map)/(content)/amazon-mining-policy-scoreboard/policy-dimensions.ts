import { DimensionName } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import { PERMITTED_LANGUAGES } from "@/utils/content";

export interface PolicyDimension {
  slug: string;
  key: string;
  name_en: string;
  name_es: string;
  name_pt: string;
  // overview of what the dimension evaluates (shown in CountryDetails)
  overview_en: string;
  overview_es: string;
  overview_pt: string;
  // cross-country analysis of the dimension (shown in DimensionDetails)
  desc_en: string;
  desc_es: string;
  desc_pt: string;
  categories_en: { id: string; title: string; desc: string }[];
  categories_es: { id: string; title: string; desc: string }[];
  categories_pt: { id: string; title: string; desc: string }[];
}

export const DIMENSION_COLORS: Record<DimensionName, string> = {
  "I. Legal Frameworks": "#4CAF50",
  "II. Mining policies": "#2196F3",
  "III. Investigation and enforcement": "#FF9800",
};
export const MAX_VALUE_DIMENSION = 5;

export const POLICY_DIMENSIONS: PolicyDimension[] = [
  {
    slug: "legal-frameworks",
    key: "I. Legal Frameworks",
    name_en: "I. Legal Frameworks",
    name_es: "I. Marcos legales",
    name_pt: "I. Marcos legais",
    overview_en:
      "The Legal Frameworks dimension evaluates whether a country has built the legal foundation needed to distinguish legitimate artisanal and small-scale gold mining (ASGM) from illegal activity. It looks at how well the law defines what ASGM is, who can do it, and under what conditions, including whether there are pathways for informal miners to formalize. The evaluation focuses on five key categories:",
    overview_es:
      "La dimensión de Marcos Legales evalúa si un país ha construido la base legal necesaria para distinguir la minería artesanal y de pequeña escala de oro (MAPE) legítima de la actividad ilegal. Examina qué tan bien la ley define qué es la MAPE, quién puede ejercerla y bajo qué condiciones, incluyendo si existen vías para que los mineros informales se formalicen. La evaluación se centra en cinco categorías clave:",
    overview_pt:
      "A dimensão de Marcos Legais avalia se um país construiu a base legal necessária para distinguir a mineração artesanal e de pequena escala de ouro (MAPE) legítima da atividade ilegal. Examina quão bem a lei define o que é a MAPE, quem pode exercê-la e sob quais condições, incluindo se existem caminhos para que os mineradores informais se formalizem. A avaliação se concentra em cinco categorias principais:",
    desc_en:
      "The legal framework dimension reveals the widest spread of scores in the assessment, from **Colombia** (89%) to **Suriname** (25%). The Andean countries - **Colombia**, **Peru**, **Ecuador** - and **Brazil** have mature, layered statutory frameworks with sector-specific definitions, tiered licensing procedures, environmental requirements, and mercury regulation. **Bolivia** occupies a middle ground: its Mining Law No. 535 (2014) provides a credible foundation but contains notable gaps in cadastre transparency, formalization pathways, and machinery oversight. **Venezuela** presents an unusual case - its legal texts are formally ambitious, even progressive, but the state-monopoly model introduced by Decree 2,165 (2015) has effectively eliminated individual mining rights and the practical mechanisms that give law meaning. **Suriname** stands out as the country where foundational legal architecture is most underdeveloped: the 1986 Mining Decree remains the primary instrument, artisanal mining is not defined, mercury has no specific legal framework, and machinery is entirely unregulated by sector-specific law.",
    desc_es:
      "La dimensión del marco jurídico presenta la mayor dispersión de puntuaciones en la evaluación, desde **Colombia** (89 %) hasta **Surinam** (25 %). Los países andinos —**Colombia**, **Perú**, **Ecuador**— y **Brasil** cuentan con marcos normativos maduros y estratificados, con definiciones específicas para cada sector, procedimientos de concesión de licencias por niveles, requisitos medioambientales y regulación del mercurio. **Bolivia** ocupa un término medio: su Ley de Minería n.º 535 (2014) proporciona una base creíble, pero presenta lagunas notables en materia de transparencia catastral, vías de formalización y supervisión de la maquinaria. **Venezuela** presenta un caso inusual: sus textos legales son formalmente ambiciosos, incluso progresistas, pero el modelo de monopolio estatal introducido por el Decreto 2.165 (2015) ha eliminado de hecho los derechos mineros individuales y los mecanismos prácticos que dan sentido a la ley. **Surinam** destaca como el país donde la arquitectura jurídica fundamental está más subdesarrollada: el Decreto de Minería de 1986 sigue siendo el instrumento principal, la minería artesanal no está definida, el mercurio carece de un marco jurídico específico y la maquinaria no está regulada en absoluto por una ley sectorial específica.",
    desc_pt:
      "A dimensão do marco jurídico revela a maior variação de pontuações na avaliação, da **Colômbia** (89%) ao **Suriname** (25%), os países andinos — **Colômbia**, **Peru**, **Equador** — e o **Brasil** possuem marcos legais maduros e complexos, com definições específicas para cada setor, procedimentos de licenciamento em níveis, requisitos ambientais e regulamentação do mercúrio. A **Bolívia** ocupa uma posição intermediária: sua Lei de Mineração nº 535 (2014) oferece uma base confiável, mas apresenta lacunas notáveis na transparência do cadastro, nos caminhos de formalização e na supervisão da maquinaria. A **Venezuela** apresenta um caso incomum — seus textos legais são formalmente ambiciosos, até mesmo progressistas, mas o modelo de monopólio estatal introduzido pelo Decreto 2.165 (2015) eliminou efetivamente os direitos individuais de mineração e os mecanismos práticos que dão sentido à lei. O **Suriname** se destaca como o país onde a arquitetura jurídica fundamental é mais subdesenvolvida: o Decreto de Mineração de 1986 continua sendo o principal instrumento, a mineração artesanal não está definida, o mercúrio não possui um marco legal específico e a maquinaria não é regulamentada por nenhuma lei setorial.",
    categories_en: [
      {
        id: "A",
        title: "Legal Definitions and Rights Recognition",
        desc: 'Most countries perform well on basic legal definitions (regional average close to 80%), but the substance behind that score varies significantly. **Bolivia**, **Brazil**, **Colombia**, **Peru**, **Ecuador**, and **Venezuela** all clearly define legal versus illegal mining conditions and provide working definitions of artisanal and small-scale mining, typically differentiated by production capacity thresholds. The main weaknesses emerge around indigenous rights and prior consultation frameworks. **Guyana** and **Suriname** also lose points for not legally defining "artisanal" mining as a distinct category.',
      },
      {
        id: "B",
        title: "Ownership and Allocation of Mineral Rights",
        desc: "State ownership of mineral resources, including gold, is near-universal across the region. The critical differentiator in this category is the existence and accessibility of mining cadastres and formalization pathways. **Brazil** and **Colombia’s** systems feature publicly accessible registries, overlap-prevention mechanisms, and functioning formalization processes. **Peru’s** GEOCATMIN also scores high, allowing anyone to consult concession location, owner, and status online. **Bolivia**, **Guyana**, **Suriname**, and **Venezuela** all lack publicly accessible cadastres: **Bolivia's** Mining Authority holds its cadastre information confidentially; **Guyana** explicitly states that small-scale mining tenure data is not publicly available; **Suriname** lacks a systematic public registry; and **Venezuela's** registry is for internal government use only.",
      },
      {
        id: "C",
        title: "Procedures for Acquiring Mining Licenses",
        desc: "Clear procedures for acquiring ASM gold mining rights, environmental licensing tailored to ASM, and supervisory bodies for environmental compliance are all relatively well developed. **Suriname** is the main outlier, failing on ASM-specific environmental licensing due to the absence of sector-specific legislation. The weakest criterion across the region is the question of mandatory reassessment before license renewal - where **Bolivia**, **Ecuador**, and **Peru** have either no fixed concession periods or no mandatory review mechanism.",
      },
      {
        id: "D",
        title: "Machinery Regulation",
        desc: "Machinery regulation is the weakest category in the entire assessment, with a regional average below 40% and no country exceeding 75%. This represents a critical loophole of ASM governance: without effective controls over excavators, dredges, and processing equipment, illegal mining is vastly more profitable and environmentally damaging. **Ecuador** and **Colombia** stand apart as the only countries that require GPS tracking on heavy mining machinery, maintain a national registry of mining equipment, and subject machinery use to specific regulation and licensing.\n\n**Peru** has regulation of machinery use but no GPS requirement and no public registry. All other countries - **Bolivia**, **Brazil**, **Guyana**, **Suriname**, and **Venezuela** - score 0 on GPS tracking and machinery registries. Critically, no country in the assessment has a publicly accessible registry of machinery licenses or permits. The regional absence of equipment tracking represents one of the most actionable governance gaps identified in this assessment.",
      },
      {
        id: "E",
        title: "Mercury Regulation",
        desc: 'Mercury regulation shows a bifurcated picture between upstream prohibition and downstream management. Import regulation and use restrictions are strong or very strong in six of eight countries, with **Colombia** and **Guyana** (whose 2020 Mercury Act is among the most comprehensive national instruments) leading the way. Across the region, mercury import, sale, and use is regulated under national law, with exception to **Suriname** that, despite having certain regulations on chemical substances, does not have a specific regulation specifically on the import and use of mercury. The systemic regional weakness however, is in downstream mercury governance: tracking systems and seizure/disposal protocols. **Colombia** regulates registered mercury users through the Users Registry (Art. 4), while import and commercialization are controlled under a separate mechanism (Art. 5, Decree 2133/2016). **Brazil\'s** IBAMA registration system is one of the most developed but still faces implementation challenges. Protocols for the safe seizure and disposal of confiscated mercury are absent or deficient in **Bolivia**, **Peru**, **Ecuador**, **Suriname**, and **Venezuela**, posing risks both to enforcement personnel and to communities near storage sites. **Brazil** and **Colombia** also have regulatory frameworks and technical guidelines that govern the seizure, transport, and final disposal of confiscated mercury; IBAMA’s Normative Instruction No. 26 (2024) and "Practical Guide for the Management of Seized Metallic Mercury Waste" (2023) stand out as referents for the region aiming at standardized operating procedures and uniform implementation.',
      },
    ],
    categories_es: [
      {
        id: "A",
        title: "Definiciones legales y reconocimiento de derechos",
        desc: "La mayoría de los países obtienen buenos resultados en cuanto a las definiciones jurídicas básicas (la media regional se acerca al 80 %), pero el contenido que subyace a esa puntuación varía significativamente. **Bolivia**, **Brasil**, **Colombia**, **Perú**, **Ecuador** y **Venezuela** definen claramente las condiciones de la minería legal frente a la ilegal y ofrecen definiciones operativas de la minería artesanal y de pequeña escala, que suelen diferenciarse por umbrales de capacidad de producción. Las principales deficiencias surgen en torno a los derechos indígenas y los marcos de consulta previa. **Guyana** y **Surinam** también pierden puntos por no definir legalmente la minería «artesanal» como una categoría diferenciada.",
      },
      {
        id: "B",
        title: "Propiedad y asignación de derechos mineros",
        desc: "La propiedad estatal de los recursos minerales, incluido el oro, es casi universal en toda la región. El factor diferenciador fundamental en esta categoría es la existencia y la accesibilidad de los catastros mineros y las vías de formalización. Los sistemas de **Brasil** y **Colombia** cuentan con registros de acceso público, mecanismos para evitar solapamientos y procesos de formalización que funcionan. El GEOCATMIN de **Perú** también obtiene una puntuación alta, ya que permite a cualquier persona consultar en línea la ubicación, el propietario y el estado de las concesiones. **Bolivia**, **Guyana**, **Surinam** y **Venezuela** carecen de catastros de acceso público: la Autoridad Minera de **Bolivia** mantiene la información de su catastro de forma confidencial; **Guyana** afirma explícitamente que los datos sobre la tenencia de la minería a pequeña escala no están disponibles públicamente; **Surinam** carece de un registro público sistemático; y el registro de **Venezuela** es solo para uso interno del Gobierno.",
      },
      {
        id: "C",
        title: "Procedimientos para la obtención de licencias mineras",
        desc: "Los procedimientos claros para la adquisición de derechos de minería de oro de la MAPE, las licencias ambientales adaptadas a la MAPE y los organismos de supervisión del cumplimiento ambiental están relativamente bien desarrollados. **Surinam** es la principal excepción, ya que no cuenta con licencias ambientales específicas para la MAPE debido a la ausencia de legislación sectorial específica. El criterio más débil en toda la región es la cuestión de la reevaluación obligatoria antes de la renovación de la licencia, donde **Bolivia**, **Ecuador** y **Perú** carecen de períodos de concesión fijos o de un mecanismo de revisión obligatorio.",
      },
      {
        id: "D",
        title: "Regulación de maquinaria",
        desc: "La regulación de la maquinaria es la categoría más débil de toda la evaluación, con una media regional inferior al 40 % y ningún país que supere el 75 %. Esto representa una laguna crítica en la gobernanza de la MAPE: sin controles efectivos sobre excavadoras, dragas y equipos de procesamiento, la minería ilegal resulta mucho más rentable y perjudicial para el medio ambiente. **Ecuador** y **Colombia** destacan como los únicos países que exigen el seguimiento por GPS de la maquinaria pesada de minería, mantienen un registro nacional de equipos mineros y someten el uso de la maquinaria a una regulación y un sistema de licencias específicos.\n\n**Perú** cuenta con una normativa sobre el uso de la maquinaria, pero no exige el uso de GPS ni dispone de un registro público. Todos los demás países —**Bolivia**, **Brasil**, **Guyana**, **Surinam** y **Venezuela**— obtienen una puntuación de 0 en seguimiento por GPS y registros de maquinaria. Es fundamental señalar que ningún país de la evaluación cuenta con un registro de licencias o permisos de maquinaria accesible al público. La ausencia regional de un sistema de seguimiento de equipos representa una de las deficiencias de gobernanza más susceptibles de ser subsanadas identificadas en esta evaluación.",
      },
      {
        id: "E",
        title: "Regulación del mercurio",
        desc: "La normativa sobre el mercurio presenta un panorama dual entre la prohibición en la fase inicial y la gestión en la fase final. Las restricciones a la importación y al uso son estrictas o muy estrictas en seis de los ocho países, con **Colombia** y **Guyana** (cuya Ley del Mercurio de 2020 se cuenta entre los instrumentos nacionales más completos) a la cabeza. En toda la región, la importación, la venta y el uso del mercurio están regulados por la legislación nacional, con la excepción de **Surinam** que, a pesar de contar con ciertas regulaciones sobre sustancias químicas, no dispone de una normativa específica sobre la importación y el uso del mercurio. No obstante, la debilidad sistémica de la región radica en la gobernanza del mercurio en la fase de uso: los sistemas de seguimiento y los protocolos de incautación y eliminación. **Colombia** regula a los usuarios registrados de mercurio a través del Registro de Usuarios (art. 4), mientras que la importación y la comercialización se controlan mediante un mecanismo independiente (art. 5, Decreto 2133/2016). El sistema de registro del IBAMA de **Brasil** es uno de los más desarrollados, pero sigue enfrentándose a retos de implementación. Los protocolos para la incautación y eliminación seguras del mercurio confiscado están ausentes o son deficientes en **Bolivia**, **Perú**, **Ecuador**, **Surinam** y **Venezuela**, lo que plantea riesgos tanto para el personal encargado de la aplicación de la ley como para las comunidades cercanas a los lugares de almacenamiento. **Brasil** y **Colombia** también cuentan con marcos normativos y directrices técnicas que regulan la incautación, el transporte y la eliminación final del mercurio confiscado; la Instrucción Normativa n.º 26 del IBAMA (2024) y la «Guía práctica para la gestión de residuos de mercurio metálico incautado» (2023) destacan como referentes para la región con el objetivo de establecer procedimientos operativos estandarizados y una aplicación uniforme.",
      },
    ],
    categories_pt: [
      {
        id: "A",
        title: "Definições legais e reconhecimento de direitos",
        desc: "A maioria dos países apresenta bom desempenho em definições jurídicas básicas (média regional próxima a 80%), mas o conteúdo por trás dessa pontuação varia significativamente. **Bolívia**, **Brasil**, **Colômbia**, **Peru**, **Equador** e **Venezuela** definem claramente as condições de mineração legal versus ilegal e fornecem definições práticas de mineração artesanal e de pequena escala, normalmente diferenciadas por limites de capacidade de produção. As principais deficiências surgem em torno dos direitos indígenas e dos marcos de consulta prévia. A **Guiana** e o **Suriname** também perdem pontos por não definirem legalmente a mineração “artesanal” como uma categoria distinta.",
      },
      {
        id: "B",
        title: "Propriedade e alocação de direitos minerários",
        desc: "A propriedade estatal dos recursos minerais, incluindo o ouro, é quase universal em toda a região. O diferencial crítico nesta categoria é a existência e a acessibilidade de cadastros de mineração e vias de formalização. Os sistemas do **Brasil** e da **Colômbia** apresentam registros acessíveis ao público, mecanismos de prevenção de sobreposições e processos de formalização em funcionamento. O GEOCATMIN do **Peru** também obtém alta pontuação, permitindo que qualquer pessoa consulte online a localização, o proprietário e o status da concessão. **Bolívia**, **Guiana**, **Suriname** e **Venezuela** carecem de cadastros acessíveis ao público: a Autoridade de Mineração da **Bolívia** mantém suas informações cadastrais em sigilo; a **Guiana** declara explicitamente que os dados sobre concessões de mineração de pequena escala não estão disponíveis ao público; o **Suriname** carece de um registro público sistemático; e o registro da **Venezuela** é apenas para uso interno do governo.",
      },
      {
        id: "C",
        title: "Procedimentos para obtenção de licenças de mineração",
        desc: "Procedimentos claros para a aquisição de direitos de mineração de ouro em ASM, licenciamento ambiental adaptado à ASM e órgãos de supervisão para conformidade ambiental estão todos relativamente bem desenvolvidos. O **Suriname** é o principal caso à parte, apresentando falhas no licenciamento ambiental específico para ASM devido à ausência de legislação setorial específica. O critério mais fraco em toda a região é a questão da reavaliação obrigatória antes da renovação da licença — onde a **Bolívia**, o **Equador** e o **Peru** não possuem períodos de concessão fixos ou nenhum mecanismo de revisão obrigatória.",
      },
      {
        id: "D",
        title: "Regulamentação de maquinário",
        desc: "A regulamentação de maquinário é a categoria mais fraca em toda a avaliação, com uma média regional abaixo de 40% e nenhum país ultrapassando 75%. Isso representa uma lacuna crítica na governança da ASM: sem controles eficazes sobre escavadeiras, dragas e equipamentos de processamento, a mineração ilegal é muito mais lucrativa e prejudicial ao meio ambiente. O **Equador** e a **Colômbia** se destacam como os únicos países que exigem rastreamento por GPS em máquinas pesadas de mineração, mantêm um registro nacional de equipamentos de mineração e submetem o uso de máquinas a regulamentação e licenciamento específicos.\n\nO **Peru** possui regulamentação para o uso de máquinas, mas não exige GPS nem mantém um registro público. Todos os outros países — **Bolívia**, **Brasil**, **Guiana**, **Suriname** e **Venezuela** — obtêm nota 0 em rastreamento por GPS e registros de máquinas. É fundamental ressaltar que nenhum país na avaliação possui um registro de licenças ou autorizações de máquinas acessível ao público. A ausência regional de rastreamento de equipamentos representa uma das lacunas de governança mais passíveis de ação identificadas nesta avaliação.",
      },
      {
        id: "E",
        title: "Regulamentação do mercúrio",
        desc: "A regulamentação do mercúrio apresenta um quadro dual entre a proibição na fase inicial e a gestão na fase final. A regulamentação das importações e as restrições ao uso são fortes ou muito fortes em seis dos oito países, com a **Colômbia** e a **Guiana** (cuja Lei do Mercúrio de 2020 está entre os instrumentos nacionais mais abrangentes) liderando o caminho. Em toda a região, a importação, a venda e o uso de mercúrio são regulamentados pela legislação nacional, com exceção do **Suriname** que, apesar de possuir certas regulamentações sobre substâncias químicas, não possui uma regulamentação específica sobre a importação e o uso de mercúrio. A fraqueza sistêmica regional, no entanto, está na governança do mercúrio a jusante: sistemas de rastreamento e protocolos de apreensão/descarte. A **Colômbia** regula os usuários registrados de mercúrio por meio do Registro de Usuários (Art. 4), enquanto a importação e a comercialização são controladas por um mecanismo separado (Art. 5, Decreto 2133/2016). O sistema de registro do IBAMA no **Brasil** é um dos mais desenvolvidos, mas ainda enfrenta desafios de implementação. Protocolos para a apreensão e o descarte seguros do mercúrio confiscado estão ausentes ou são deficientes na **Bolívia**, no **Peru**, no **Equador**, no **Suriname** e na **Venezuela**, representando riscos tanto para o pessoal de fiscalização quanto para as comunidades próximas aos locais de armazenamento. O **Brasil** e a **Colômbia** também possuem marcos regulatórios e diretrizes técnicas que regem a apreensão, o transporte e o descarte final do mercúrio confiscado; a Instrução Normativa nº 26 do IBAMA (2024) e o “Guia Prático para a Gestão de Resíduos de Mercúrio Metálico Apreendidos” (2023) destacam-se como referências para a região, visando procedimentos operacionais padronizados e implementação uniforme.",
      },
    ],
  },
  {
    slug: "mining-policies",
    key: "II. Mining policies",
    name_en: "II. Mining Policies",
    name_es: "II. Políticas mineras",
    name_pt: "II. Políticas de mineração",
    overview_en:
      "The Mining Policies dimension evaluates the practical implementation of mining policies and the country's commitment to sustainable and responsible mining practices. It assesses the development of policies and structures in place to ensure that the environmental and social impacts of ASM are mitigated, in line with international standards and best practices. The five categories of criteria in this dimension are:",
    overview_es:
      "La dimensión de Políticas Mineras evalúa la implementación práctica de las políticas mineras y el compromiso del país con prácticas mineras sostenibles y responsables. Evalúa el desarrollo de políticas y estructuras existentes para garantizar que los impactos ambientales y sociales de la MAPE sean mitigados, en línea con estándares internacionales y mejores prácticas. Las cinco categorías de criterios en esta dimensión son:",
    overview_pt:
      "A dimensão de Políticas de Mineração avalia a implementação prática das políticas de mineração e o compromisso do país com práticas de mineração sustentáveis e responsáveis. Avalia o desenvolvimento de políticas e estruturas existentes para garantir que os impactos ambientais e sociais da MAPE sejam mitigados, em conformidade com padrões internacionais e melhores práticas. As cinco categorias de critérios nesta dimensão são:",
    desc_en:
      "**Colombia** and **Peru** lead this dimension (with 3.54 and 3.40, respectively) ), reflecting their relatively complete policy ecosystems and support for sustainable mining policies programmes. **Venezuela** scores only 1.23 - the weakest dimension score in the assessment - due to its absence from Minamata compliance and near-total absence of government monitoring, environmental programs, and civil society engagement.",
    desc_es:
      "**Colombia** y **Perú** lideran esta dimensión (con 3,54 y 3,40, respectivamente), lo que refleja sus ecosistemas normativos relativamente completos y el apoyo a programas de políticas mineras sostenibles. **Venezuela** obtiene solo 1,23 —la puntuación más baja de la evaluación en esta dimensión— debido a su incumplimiento de la Convención de Minamata y a la ausencia casi total de supervisión gubernamental, programas medioambientales y participación de la sociedad civil.",
    desc_pt:
      "A **Colômbia** e o **Peru** lideram esta dimensão (com 3,54 e 3,40, respectivamente), refletindo seus ecossistemas de políticas relativamente completos e o apoio a programas de políticas de mineração sustentável. A **Venezuela** obtém apenas 1,23 — a pontuação mais baixa da avaliação — devido à sua falta de conformidade com a Convenção de Minamata e à quase total ausência de monitoramento governamental, programas ambientais e engajamento da sociedade civil.",
    categories_en: [
      {
        id: "F",
        title: "Compliance with the Minamata Convention on Mercury",
        desc: "**Colombia** leads this category with a perfect score, having ratified the Convention, submitted its initial assessment, developed and submitted a National Action Plan that addresses forests, the Amazon region, and intersectional approaches including gender and indigenous peoples. **Peru** and **Guyana** also perform well. The regional pattern on basic participation - ratification and initial assessments - is strong: all countries except **Venezuela** have ratified, and most have submitted initial assessments. **Brazil** is the most striking underperformer because it had not yet submitted its National Action Plan or initial assessment at the time of this assessment, despite being home to the most extensive ASM-affected Amazon territory in the region. **Venezuela** signed but has not ratified the Convention and has no associated planning instruments.\n\nThe content of NAPs, where they exist, reveals a recurring weakness: most do not explicitly address forests, the Amazon biome, or intersectional dimensions such as gender, ethnicity, and economic vulnerability.",
      },
      {
        id: "G",
        title: "Monitoring Systems",
        desc: "Monitoring systems represent the second-weakest category in the assessment (after machinery regulation), with **Bolivia**, **Ecuador**, and **Venezuela** all scoring 0.0. **Brazil** leads, followed by **Peru**. **Guyana** and **Suriname** have partial and emerging systems. A universal weakness is the inability of satellite monitoring systems to distinguish between artisanal, semi-mechanized, and mechanized mining: existing systems detect land-cover changes but cannot automatically classify activity type.\n\nGovernment measurement of mercury concentrations in water bodies, the food chain, and exposed populations is also consistently weak - most monitoring data comes from academic research and NGOs rather than government programs, and no country has a continuous, nationally coordinated biomonitoring program.\n\nThese gaps are worsened by a regional structural problem: the lack of cooperation between governments to share monitoring systems. Even though monitoring systems are limited by borders, the contaminations and minings spread through shared watersheds. The result is a shared regional crisis, without a governmental-led mechanism to aggregate or compare data across the countries affected. Closing that gap would require regional cooperation on a joint monitoring architecture. In the meantime, civil society-led initiatives such as MapBiomas or Amazon Mining Watch provide a fallback, but their admissibility before national authorities may be contested as they are not official sources.",
      },
      {
        id: "H",
        title: "Public Participation",
        desc: "**Peru** and **Colombia** lead public participation, demonstrating strong legal channels, accessible complaint mechanisms, and explicit inclusion of vulnerable groups in ASM programs. Most countries have formal channels for civil society oversight and complaint mechanisms; the main weaknesses involve whether these mechanisms are genuinely functional and whether civil society input materially influences authorization decisions or investigation procedures.\n\nThe most significant gap lies with processes for public consultation with affected communities - where **Bolivia** has no general public consultation mechanism in mining, only prior consultation for indigenous peoples in Category 1–2 environmental assessments, and **Brazil** lacks a structured consultative process despite constitutional requirements. **Peru's** National Gender Plan for Small-Scale and Artisanal Mining (2023–2025) makes it a regional leader on this criterion, having created the first gender policy for ASM in the region.",
      },
      {
        id: "I",
        title: "Support for Sustainable Mining Initiatives",
        desc: "**Guyana** leads this category, reflecting its extensive collaboration with international organizations, active promotion of mercury-free technologies through the planetGOLD project and the Artisanal Gold Council, and recognition of international certification schemes. **Colombia** and **Ecuador** also score well. The most consistent gap across the region is access to state-sponsored financing for sustainable ASM practices: only **Bolivia** (via FOFIM), **Ecuador** (via BANECUADOR's mining credit line), **Guyana**, **Suriname**, and **Venezuela** report such mechanism, while **Brazil**, **Colombia**, and **Peru** - despite their larger economies and more developed ASM sectors - lack accessible, targeted state financing for sustainable alternatives. Promotion of mercury-free technologies is generally well covered through international cooperation projects (planetGOLD, EMSAGS), though **Venezuela** scores 0 on government-organized collaboration with NGOs and international agencies, reflecting its closed governance model and political isolation. Government incentives specifically for gold certification adoption are absent in **Bolivia**, **Ecuador**, **Peru**, and **Venezuela** - a missed market-based lever for responsible sourcing.",
      },
      {
        id: "J",
        title: "Remediation and Biodiversity Strategy Integration",
        desc: "This is the weakest category in Dimension II, with a regional average below 0.50 and **Venezuela** scoring 0.0 across all three criteria. **Suriname** paradoxically leads, driven by its updated National Biodiversity Strategy (2024–2035) that explicitly identifies ASM as a primary driver of biodiversity loss, and by the EMSAGS project's specific ecosystem restoration targets - though the gap between planning and implementation remains significant. Recognition of ASM gold mining in National Biodiversity Strategies is a consistent weakness: **Bolivia**, **Brazil** (partial), **Ecuador**, **Guyana**, and **Venezuela** all either do not mention ASM specifically or treat mining only as a generic threat. **Peru** is the exception, with its national biodiversity strategy explicitly identifying illegal and artisanal mining as key pressures. The existence of specific programs, targets, or funding for ecosystem restoration in ASM-affected areas is the weakest single criterion in this category, with only **Suriname**, **Brazil** (partially), and **Colombia** (partially) offering any such mechanisms.",
      },
    ],
    categories_es: [
      {
        id: "F",
        title: "Cumplimiento del Convenio de Minamata sobre el Mercurio",
        desc: "**Colombia** lidera esta categoría con una puntuación perfecta, tras haber ratificado la Convención, presentado su evaluación inicial y elaborado y presentado un Plan de Acción Nacional que aborda los bosques, la región amazónica y enfoques intersectoriales que incluyen el género y los pueblos indígenas. **Perú** y **Guyana** también obtienen buenos resultados. El patrón regional en cuanto a la participación básica —ratificación y evaluaciones iniciales— es sólido: todos los países, excepto **Venezuela**, han ratificado la Convención, y la mayoría ha presentado evaluaciones iniciales. **Brasil** es el caso más llamativo de bajo rendimiento, ya que aún no había presentado su Plan de Acción Nacional ni su evaluación inicial en el momento de esta evaluación, a pesar de albergar el territorio amazónico más extenso de la región afectado por la minería artesanal y de pequeña escala (MAPE). **Venezuela** firmó, pero no ha ratificado el Convenio y carece de instrumentos de planificación asociados.\n\nEl contenido de los PNA, cuando existen, revela una deficiencia recurrente: la mayoría no aborda explícitamente los bosques, el bioma amazónico o dimensiones intersectoriales como el género, la etnicidad y la vulnerabilidad económica.",
      },
      {
        id: "G",
        title: "Sistemas de monitoreo",
        desc: "Los sistemas de monitoreo representan la segunda categoría más débil de la evaluación (después de la regulación de la maquinaria), con **Bolivia**, **Ecuador** y **Venezuela** obteniendo una puntuación de 0,0. **Brasil** lidera la clasificación, seguido de **Perú**. **Guyana** y **Surinam** cuentan con sistemas parciales y emergentes. Una debilidad generalizada es la incapacidad de los sistemas de monitoreo por satélite para distinguir entre minería artesanal, semimecanizada y mecanizada: los sistemas existentes detectan cambios en la cobertura del suelo, pero no pueden clasificar automáticamente el tipo de actividad.\n\nLa medición gubernamental de las concentraciones de mercurio en las masas de agua, la cadena alimentaria y las poblaciones expuestas también es sistemáticamente deficiente: la mayoría de los datos de seguimiento proceden de la investigación académica y de ONG, más que de programas gubernamentales, y ningún país cuenta con un programa de biomonitorización continuo y coordinado a nivel nacional.\n\nEstas deficiencias se ven agravadas por un problema estructural regional: la falta de cooperación entre los gobiernos para compartir los sistemas de monitoreo. Aunque los sistemas de monitoreo están limitados por las fronteras, la contaminación y la minería se extienden a través de cuencas hidrográficas compartidas. El resultado es una crisis regional compartida, sin un mecanismo liderado por los gobiernos para agregar o comparar datos entre los países afectados. Cerrar esa brecha requeriría una cooperación regional en torno a una arquitectura de monitoreo conjunta. Mientras tanto, iniciativas lideradas por la sociedad civil como MapBiomas o Amazon Mining Watch ofrecen una alternativa, pero su admisibilidad ante las autoridades nacionales puede ser cuestionada, ya que no son fuentes oficiales.",
      },
      {
        id: "H",
        title: "Participación pública",
        desc: "**Perú** y **Colombia** lideran la participación pública, demostrando contar con canales legales sólidos, mecanismos de denuncia accesibles y la inclusión explícita de grupos vulnerables en los programas de MAPE. La mayoría de los países cuentan con canales formales para la supervisión de la sociedad civil y mecanismos de denuncia; las principales debilidades residen en si estos mecanismos son realmente funcionales y si los aportes de la sociedad civil influyen de manera significativa en las decisiones de autorización o en los procedimientos de investigación.\n\nLa deficiencia más significativa radica en los procesos de consulta pública con las comunidades afectadas: **Bolivia** carece de un mecanismo general de consulta pública en materia minera, limitándose a la consulta previa a los pueblos indígenas en las evaluaciones ambientales de las Categorías 1 y 2, mientras que **Brasil** carece de un proceso consultivo estructurado a pesar de los requisitos constitucionales. El Plan Nacional de Género para la Minería Artesanal y de Pequeña Escala (2023-2025) de **Perú** lo convierte en líder regional en este criterio, al haber creado la primera política de género para la MAPE en la región.",
      },
      {
        id: "I",
        title: "Apoyo a iniciativas de minería sostenible",
        desc: "**Guyana** lidera esta categoría, lo que refleja su amplia colaboración con organizaciones internacionales, la promoción activa de tecnologías sin mercurio a través del proyecto planetGOLD y el Consejo del Oro Artesanal, y el reconocimiento de los sistemas de certificación internacionales. **Colombia** y **Ecuador** también obtienen buenas puntuaciones. La brecha más constante en toda la región es el acceso a la financiación estatal para prácticas sostenibles de la minería artesanal y de pequeña escala (MAPE): solo **Bolivia** (a través del FOFIM), **Ecuador** (a través de la línea de crédito minero de BANECUADOR), **Guyana**, **Surinam** y **Venezuela** informan de la existencia de dicho mecanismo, mientras que **Brasil**, **Colombia** y **Perú** —a pesar de sus economías más grandes y de sus sectores de la MAPE más desarrollados— carecen de financiación estatal accesible y específica para alternativas sostenibles . La promoción de tecnologías sin mercurio suele estar bien cubierta a través de proyectos de cooperación internacional (planetGOLD, EMSAGS), aunque **Venezuela** obtiene una puntuación de 0 en colaboración organizada por el gobierno con ONG y organismos internacionales, lo que refleja su modelo de gobernanza cerrado y su aislamiento político. En **Bolivia**, **Ecuador**, **Perú** y **Venezuela** no existen incentivos gubernamentales específicos para la adopción de la certificación del oro, lo que supone una oportunidad perdida de utilizar una palanca basada en el mercado para el abastecimiento responsable.",
      },
      {
        id: "J",
        title: "Remediación e integración de estrategias de biodiversidad",
        desc: "Esta es la categoría más débil de la Dimensión II, con una media regional inferior a 0,50 y **Venezuela** con una puntuación de 0,0 en los tres criterios. Paradójicamente, **Surinam** lidera la clasificación, impulsado por su Estrategia Nacional de Biodiversidad actualizada (2024-2035), que identifica explícitamente la MAPE como uno de los principales factores de la pérdida de biodiversidad, y por los objetivos específicos de restauración de ecosistemas del proyecto EMSAGS, aunque la brecha entre la planificación y la implementación sigue siendo significativa. El reconocimiento de la minería artesanal y de pequeña escala (MAPE) de oro en las Estrategias Nacionales de Biodiversidad es una debilidad constante: **Bolivia**, **Brasil** (parcialmente), **Ecuador**, **Guyana** y **Venezuela** o bien no mencionan específicamente la MAPE o bien tratan la minería únicamente como una amenaza genérica. **Perú** es la excepción, ya que su estrategia nacional de biodiversidad identifica explícitamente la minería ilegal y artesanal como presiones clave. La existencia de programas, objetivos o financiación específicos para la restauración de ecosistemas en las zonas afectadas por la MAPE es el criterio más débil de esta categoría, y solo **Surinam**, **Brasil** (parcialmente) y **Colombia** (parcialmente) ofrecen mecanismos de este tipo.",
      },
    ],
    categories_pt: [
      {
        id: "F",
        title: "Cumprimento da Convenção de Minamata sobre Mercúrio",
        desc: "A **Colômbia** lidera esta categoria com uma pontuação perfeita, tendo ratificado a Convenção, apresentado sua avaliação inicial e desenvolvido e apresentado um Plano de Ação Nacional que aborda florestas, a região amazônica e abordagens interseccionais, incluindo gênero e povos indígenas. **Peru** e **Guiana** também apresentam bom desempenho. O padrão regional de participação básica — ratificação e avaliações iniciais — é sólido: todos os países, exceto a **Venezuela**, ratificaram a Convenção, e a maioria apresentou avaliações iniciais. O **Brasil** é o país com o desempenho mais insatisfatório, pois ainda não havia apresentado seu Plano de Ação Nacional nem sua avaliação inicial no momento desta análise, apesar de abrigar o território amazônico mais extenso afetado pela mineração artesanal e de pequena escala (ASM) na região. A **Venezuela** assinou, mas não ratificou a Convenção e não possui instrumentos de planejamento associados.\n\nO conteúdo dos PNA, onde existem, revela uma deficiência recorrente: a maioria não aborda explicitamente as florestas, o bioma amazônico ou dimensões interseccionais, como gênero, etnia e vulnerabilidade econômica.",
      },
      {
        id: "G",
        title: "Sistemas de monitoramento",
        desc: "Os sistemas de monitoramento representam a segunda categoria mais fraca na avaliação (depois da regulamentação de maquinário), com **Bolívia**, **Equador** e **Venezuela** obtendo pontuação 0,0. O **Brasil** lidera, seguido pelo **Peru**. **Guiana** e **Suriname** possuem sistemas parciais e emergentes. Uma deficiência generalizada é a incapacidade dos sistemas de monitoramento por satélite de distinguir entre mineração artesanal, semimecanizada e mecanizada: os sistemas existentes detectam mudanças na cobertura do solo, mas não conseguem classificar automaticamente o tipo de atividade.\n\nA medição governamental das concentrações de mercúrio em corpos d'água, na cadeia alimentar e em populações expostas também é consistentemente fraca — a maioria dos dados de monitoramento provém de pesquisas acadêmicas e ONGs, e não de programas governamentais, e nenhum país possui um programa de biomonitoramento contínuo e coordenado nacionalmente.\n\nEssas lacunas são agravadas por um problema estrutural regional: a falta de cooperação entre governos para compartilhar sistemas de monitoramento. Embora os sistemas de monitoramento sejam limitados por fronteiras, as contaminações e as atividades de mineração se espalham por bacias hidrográficas compartilhadas. O resultado é uma crise regional compartilhada, sem um mecanismo liderado pelo governo para agregar ou comparar dados entre os países afetados. Preencher essa lacuna exigiria cooperação regional em torno de uma arquitetura conjunta de monitoramento. Enquanto isso, iniciativas lideradas pela sociedade civil, como o MapBiomas ou o Amazon Mining Watch, oferecem uma alternativa, mas sua admissibilidade perante as autoridades nacionais pode ser contestada, uma vez que não são fontes oficiais.",
      },
      {
        id: "H",
        title: "Participação pública",
        desc: "**Peru** e **Colômbia** lideram a participação pública, demonstrando canais legais sólidos, mecanismos de reclamação acessíveis e inclusão explícita de grupos vulneráveis em programas de ASM. A maioria dos países possui canais formais para supervisão da sociedade civil e mecanismos de reclamação; as principais fragilidades dizem respeito à questão de saber se esses mecanismos são genuinamente funcionais e se a contribuição da sociedade civil influencia de forma significativa as decisões de autorização ou os procedimentos de investigação.\n\nA lacuna mais significativa reside nos processos de consulta pública às comunidades afetadas — onde a **Bolívia** não possui um mecanismo geral de consulta pública na mineração, apenas consulta prévia para povos indígenas em avaliações ambientais das Categorias 1–2, e o **Brasil** carece de um processo consultivo estruturado, apesar dos requisitos constitucionais. O Plano Nacional de Gênero para a Mineração de Pequena Escala e Artesanal do **Peru** (2023–2025) torna o país líder regional nesse critério, tendo criado a primeira política de gênero para a MPA na região.",
      },
      {
        id: "I",
        title: "Apoio a iniciativas de mineração sustentável",
        desc: "A **Guiana** lidera esta categoria, refletindo sua ampla colaboração com organizações internacionais, a promoção ativa de tecnologias livres de mercúrio por meio do projeto planetGOLD e do Conselho de Ouro Artesanal, e o reconhecimento de esquemas de certificação internacionais. A **Colômbia** e o **Equador** também apresentam bons resultados. A lacuna mais consistente em toda a região é o acesso a financiamento estatal para práticas sustentáveis de ASM: apenas a **Bolívia** (por meio do FOFIM), o **Equador** (por meio da linha de crédito para mineração do BANECUADOR), a **Guiana**, o **Suriname** e a **Venezuela** relatam a existência de tal mecanismo, enquanto o **Brasil**, a **Colômbia** e o **Peru** — apesar de suas economias maiores e setores de ASM mais desenvolvidos — carecem de financiamento estatal acessível e direcionado para alternativas sustentáveis. A promoção de tecnologias livres de mercúrio é geralmente bem coberta por projetos de cooperação internacional (planetGOLD, EMSAGS), embora a **Venezuela** tenha nota 0 em colaboração organizada pelo governo com ONGs e agências internacionais, refletindo seu modelo de governança fechado e isolamento político. Incentivos governamentais específicos para a adoção de certificação de ouro estão ausentes na **Bolívia**, no **Equador**, no **Peru** e na **Venezuela** — uma alavanca de mercado perdida para o abastecimento responsável.",
      },
      {
        id: "J",
        title: "Remediação e integração de estratégias de biodiversidade",
        desc: "Esta é a categoria mais fraca na Dimensão II, com uma média regional abaixo de 0,50 e a **Venezuela** obtendo nota 0,0 em todos os três critérios. Paradoxalmente, o **Suriname** lidera, impulsionado por sua Estratégia Nacional de Biodiversidade atualizada (2024–2035), que identifica explicitamente a mineração artesanal e de pequena escala (ASM) como um dos principais fatores da perda de biodiversidade, e pelas metas específicas de restauração de ecossistemas do projeto EMSAGS — embora a lacuna entre planejamento e implementação continue significativa. O reconhecimento da mineração de ouro ASM nas Estratégias Nacionais de Biodiversidade é uma fraqueza consistente: **Bolívia**, **Brasil** (parcialmente), **Equador**, **Guiana** e **Venezuela** ou não mencionam a ASM especificamente ou tratam a mineração apenas como uma ameaça genérica. O **Peru** é a exceção, com sua estratégia nacional de biodiversidade identificando explicitamente a mineração ilegal e artesanal como pressões-chave. A existência de programas, metas ou financiamento específicos para a restauração de ecossistemas em áreas afetadas pela ASM é o critério mais fraco nesta categoria, com apenas o **Suriname**, o **Brasil** (parcialmente) e a **Colômbia** (parcialmente) oferecendo tais mecanismos.",
      },
    ],
  },
  {
    slug: "investigation-and-enforcement",
    key: "III. Investigation and enforcement",
    name_en: "III. Investigation and Enforcement",
    name_es: "III. Investigación y ejecución",
    name_pt: "III. Investigação e aplicação da lei",
    overview_en:
      "The Investigation and Enforcement dimension focuses on the critical aspects of accountability and the enforcement of mining laws and regulations. It examines the capacity and effectiveness of the state in ensuring compliance, investigating illicit activities, and holding perpetrators accountable. The evaluation is structured around five categories:",
    overview_es:
      "La dimensión de Investigación y Ejecución se centra en los aspectos críticos de la rendición de cuentas y la aplicación de las leyes y regulaciones mineras. Examina la capacidad y efectividad del Estado para garantizar el cumplimiento, investigar actividades ilícitas y responsabilizar a los infractores. La evaluación se estructura en torno a cinco categorías:",
    overview_pt:
      "A dimensão de Investigação e Aplicação da Lei concentra-se nos aspectos críticos da responsabilização e da aplicação das leis e regulamentações de mineração. Examina a capacidade e eficácia do Estado em garantir o cumprimento, investigar atividades ilícitas e responsabilizar os infratores. A avaliação está estruturada em torno de cinco categorias:",
    desc_en:
      "Investigation and enforcement is the strongest dimension overall, with **Peru**, **Colombia** and **Brazil** demonstrating well-developed institutional and legal mechanisms. This reflects years of experience dealing with illegal mining at scale, particularly in the Amazon basin. However, **Suriname** and **Venezuela** remain dramatically below the regional leaders, and even high-performing countries show systematic weaknesses in gold supply chain transparency and digital infrastructure.",
    desc_es:
      "La investigación y la aplicación de la ley constituyen, en general, el aspecto más sólido, ya que **Perú**, **Colombia** y **Brasil** cuentan con mecanismos institucionales y jurídicos bien desarrollados. Esto refleja años de experiencia en la lucha contra la minería ilegal a gran escala, especialmente en la cuenca del Amazonas. Sin embargo, **Surinam** y **Venezuela** siguen estando muy por debajo de los líderes regionales, e incluso los países con mejores resultados muestran deficiencias sistemáticas en cuanto a la transparencia de la cadena de suministro del oro y la infraestructura digital.",
    desc_pt:
      "A investigação e a fiscalização constituem, em geral, o ponto mais forte, com **Peru**, **Colômbia** e **Brasil** apresentando mecanismos institucionais e jurídicos bem desenvolvidos. Isso reflete anos de experiência no combate à mineração ilegal em grande escala, particularmente na Bacia Amazônica. No entanto, **Suriname** e **Venezuela** permanecem muito aquém dos líderes regionais, e mesmo os países com melhor desempenho apresentam deficiências sistemáticas na transparência da cadeia de abastecimento de ouro e na infraestrutura digital.",
    categories_en: [
      {
        id: "K",
        title: "Gold Supply Chain Regulation and Transparency",
        desc: "This is the most complex category, covering eight criteria from actor registration to cross-border information sharing. **Brazil** and **Peru** lead with the strongest scores (0.81), combining traceability requirements, export controls, and due diligence obligations on refiners and exporters. **Ecuador** and **Suriname** show partial coverage, as the countries present basic licensing procedures, but public disclosure is largely absent.  The persistent weakness is traceability from extraction to final sale: **Bolivia's** SINACOM system exists but lacks supporting documentation requirements; **Brazil's** system is in development and relies on a 2025 Supreme Court ruling eliminating the presumption of good faith; **Peru's** QORI application is a pilot only; **Ecuador**, **Suriname**, and **Venezuela** have no specific traceability strategy.",
      },
      {
        id: "L",
        title: "Public Security and Investigation of Mining-Related Crimes",
        desc: "**Colombia** and **Brazil** lead this category, driven by their specialized environmental police and prosecutorial units, specific investigation protocols for mining-related crimes, bilateral/multilateral enforcement agreements, and - in **Brazil's** case - large-scale operations like Operation Kuri II e Aurum Sordidos and operations in Yanomami territories. **Peru** also scores well with its Environmental Directorate (DIRMEAMB) and specialized environmental prosecutors. The most significant regional gap is the question of specific strategies by public security bodies to protect indigenous and traditional communities from mining-related crimes: only **Brazil** and **Colombia** have such strategies. **Venezuela's** score drops sharply in this category due to the absence of clear investigation procedures, no bilateral enforcement agreements, and documented state complicity in illegal mining in Indigenous territories.",
      },
      {
        id: "M",
        title: "Judicial Oversight and Jurisprudence",
        desc: "The judicial dimension shows **Colombia**, **Peru**, and **Ecuador** performing strongly, while **Suriname** scores the lowest. The ability of individuals and communities to file collective environmental actions or constitutional remedies is broadly recognized across seven of eight countries. The differentiator across the region is whether courts have issued binding decisions recognizing natural ecosystems as subjects of rights, creating restrictions or obligations in mining cases. Only **Colombia**, **Peru**, and **Ecuador** score here: **Ecuador** through its landmark Constitutional Court ruling in the Los Cedros Cloud Forest case (2021), which revoked environmental mining permits on rights-of-nature grounds; **Peru** through emerging cases recognizing the Marañón River as a rights-holder; and **Colombia** through its Constitutional Court and Supreme Court jurisprudence on Amazonian rivers.",
      },
      {
        id: "N",
        title: "Restrictions, Law Enforcement, and Accountability",
        desc: "This is the region's strongest category, reflecting the existence of legal frameworks for sanctions, license revocation, and liability in most countries. License suspension or revocation for environmental or social violations is present in all eight countries. The obligation to adopt rehabilitation and compensation measures - where environmental damage is found - is similarly universal. The key differentiators are the application of sanctions based on remote evidence such as satellite imagery - where **Bolivia**, **Ecuador**, **Peru**, and **Colombia** score 1 while **Guyana**, **Suriname**, and **Venezuela** score 0. Mercury-specific sanctions remain partial everywhere, with most countries relying on general environmental or hazardous substances law rather than mercury-specific criminal provisions.",
      },
      {
        id: "O",
        title: "Economic and Criminal Sanctions",
        desc: "**Colombia**, **Peru**, **Brazil**, and **Ecuador** all score high in this category, reflecting mature penal frameworks that criminalize illegal mining and associated trade, target criminal networks, apply economic sanctions to illicit gold traders, and allow administrative sanctions independently of criminal proceedings. **Venezuela**, **Bolivia**, **Guyana**, and **Suriname** show significant gaps. The weakest criteria are legal sanctions specifically for ASM environmental crimes, where **Bolivia** and **Suriname** score 0; and economic sanctions against illicit gold traders, where **Guyana** and **Suriname** score 0. **Suriname's** low score in this category is the most dramatic underperformance in Dimension III, reflecting an enforcement environment where criminal networks involved in illegal gold trade are rarely targeted through domestic legal mechanisms.",
      },
    ],
    categories_es: [
      {
        id: "K",
        title: "Regulación y transparencia de la cadena de suministro de oro",
        desc: "Esta es la categoría más compleja, que abarca ocho criterios, desde el registro de los actores hasta el intercambio transfronterizo de información. **Brasil** y **Perú** lideran la clasificación con la puntuación más alta (0,81), combinando requisitos de trazabilidad, controles de exportación y obligaciones de diligencia debida para refinerías y exportadores. **Ecuador** y **Surinam** muestran una cobertura parcial, ya que los países cuentan con procedimientos básicos de concesión de licencias, pero la divulgación pública brilla por su ausencia.  La debilidad persistente es la trazabilidad desde la extracción hasta la venta final: el sistema SINACOM de **Bolivia** existe, pero carece de requisitos de documentación de respaldo; el sistema de **Brasil** está en desarrollo y se basa en un fallo de la Corte Suprema de 2025 que elimina la presunción de buena fe; la aplicación QORI de **Perú** es solo un proyecto piloto; **Ecuador**, **Surinam** y **Venezuela** no cuentan con una estrategia específica de trazabilidad.",
      },
      {
        id: "L",
        title:
          "Seguridad pública e investigación de delitos relacionados con la minería",
        desc: "**Colombia** y **Brasil** lideran esta categoría, impulsados por sus unidades especializadas de policía y fiscalía ambiental, protocolos de investigación específicos para delitos relacionados con la minería, acuerdos bilaterales y multilaterales de aplicación de la ley y —en el caso de **Brasil**— operaciones a gran escala como la Operación Kuri II y Aurum Sordidos, así como operaciones en territorios Yanomami. **Perú** también obtiene una buena puntuación gracias a su Dirección de Medio Ambiente (DIRMEAMB) y a sus fiscales especializados en materia ambiental. La brecha regional más significativa es la cuestión de las estrategias específicas de los organismos de seguridad pública para proteger a las comunidades indígenas y tradicionales de los delitos relacionados con la minería: solo **Brasil** y **Colombia** cuentan con tales estrategias. La puntuación de **Venezuela** cae drásticamente en esta categoría debido a la ausencia de procedimientos de investigación claros, la falta de acuerdos bilaterales de aplicación de la ley y la complicidad estatal documentada en la minería ilegal en territorios indígenas.",
      },
      {
        id: "M",
        title: "Supervisión judicial y jurisprudencia",
        desc: "En la dimensión judicial, **Colombia**, **Perú** y **Ecuador** obtienen buenos resultados, mientras que **Surinam** obtiene la puntuación más baja. La capacidad de las personas y las comunidades para interponer acciones colectivas ambientales o recursos constitucionales está ampliamente reconocida en siete de los ocho países. El factor diferenciador en la región es si los tribunales han dictado sentencias vinculantes que reconozcan a los ecosistemas naturales como sujetos de derechos, creando restricciones u obligaciones en los casos mineros. Solo **Colombia**, **Perú** y **Ecuador** obtienen puntuación en este aspecto: **Ecuador**, gracias a la histórica sentencia del Tribunal Constitucional en el caso del Bosque Nuboso de Los Cedros (2021), que revocó los permisos de minería por motivos relacionados con los derechos de la naturaleza; **Perú**, a través de casos emergentes que reconocen al río Marañón como titular de derechos; y **Colombia**, gracias a la jurisprudencia de su Tribunal Constitucional y de la Corte Suprema sobre los ríos amazónicos.",
      },
      {
        id: "N",
        title: "Restricciones, aplicación de la ley y rendición de cuentas",
        desc: "Esta es la categoría más sólida de la región, lo que refleja la existencia de marcos jurídicos para las sanciones, la revocación de licencias y la responsabilidad en la mayoría de los países. La suspensión o revocación de licencias por infracciones ambientales o sociales está presente en los ocho países. La obligación de adoptar medidas de rehabilitación y compensación —cuando se constata un daño ambiental— es igualmente universal. Los principales diferenciadores son la aplicación de sanciones basadas en pruebas remotas, como imágenes de satélite, donde **Bolivia**, **Ecuador**, **Perú** y **Colombia** obtienen una puntuación de 1, mientras que **Guyana**, **Surinam** y **Venezuela** obtienen una puntuación de 0. Las sanciones específicas sobre el mercurio siguen siendo parciales en todas partes, y la mayoría de los países se basan en la legislación general sobre medio ambiente o sustancias peligrosas, en lugar de en disposiciones penales específicas sobre el mercurio.",
      },
      {
        id: "O",
        title: "Sanciones económicas y penales",
        desc: "**Colombia**, **Perú**, **Brasil** y **Ecuador** obtienen puntuaciones altas en esta categoría, lo que refleja marcos penales maduros que tipifican como delito la minería ilegal y el comercio asociado, se centran en las redes delictivas, aplican sanciones económicas a los comerciantes de oro ilícito y permiten sanciones administrativas independientemente de los procedimientos penales. **Venezuela**, **Bolivia**, **Guyana** y **Surinam** presentan carencias significativas. Los criterios más débiles son las sanciones legales específicas para los delitos ambientales relacionados con la MAPE, donde **Bolivia** y **Surinam** obtienen una puntuación de 0; y las sanciones económicas contra los comerciantes de oro ilícito, donde **Guyana** y **Surinam** obtienen una puntuación de 0. La baja puntuación de **Surinam** en esta categoría es el resultado más deficiente de la Dimensión III, lo que refleja un entorno de aplicación de la ley en el que las redes criminales involucradas en el comercio ilegal de oro rara vez son objeto de medidas a través de los mecanismos legales nacionales.",
      },
    ],
    categories_pt: [
      {
        id: "K",
        title:
          "Regulamentação e transparência da cadeia de suprimentos de ouro",
        desc: "Esta é a categoria mais complexa, abrangendo oito critérios, desde o registro de atores até o compartilhamento de informações transfronteiriças. **Brasil** e **Peru** lideram com a pontuação mais alta (0,81), combinando requisitos de rastreabilidade, controles de exportação e obrigações de due diligence para refinarias e exportadores. **Equador** e **Suriname** apresentam cobertura parcial, pois os países possuem procedimentos básicos de licenciamento, mas a divulgação pública é praticamente inexistente.  A deficiência persistente é a rastreabilidade desde a extração até a venda final: o sistema SINACOM da **Bolívia** existe, mas carece de requisitos de documentação de apoio; o sistema do **Brasil** está em desenvolvimento e depende de uma decisão da Suprema Corte de 2025 que elimina a presunção de boa-fé; o aplicativo QORI do **Peru** é apenas um projeto-piloto; **Equador**, **Suriname** e **Venezuela** não possuem estratégia específica de rastreabilidade.",
      },
      {
        id: "L",
        title:
          "Segurança pública e investigação de crimes relacionados à mineração",
        desc: "A **Colômbia** e o **Brasil** lideram esta categoria, impulsionados por suas polícias ambientais especializadas e unidades do Ministério Público, protocolos específicos de investigação para crimes relacionados à mineração, acordos bilaterais/multilaterais de fiscalização e — no caso do **Brasil** — operações em grande escala como a Operação Kuri II e Aurum Sordidos e operações em territórios yanomami. O **Peru** também obtém boa pontuação com sua Diretoria Ambiental (DIRMEAMB) e promotores ambientais especializados. A lacuna regional mais significativa é a questão das estratégias específicas dos órgãos de segurança pública para proteger as comunidades indígenas e tradicionais contra crimes relacionados à mineração: apenas o **Brasil** e a **Colômbia** possuem tais estratégias. A pontuação da **Venezuela** cai drasticamente nesta categoria devido à ausência de procedimentos de investigação claros, à inexistência de acordos bilaterais de fiscalização e à cumplicidade documentada do Estado na mineração ilegal em territórios indígenas.",
      },
      {
        id: "M",
        title: "Supervisão judicial e jurisprudência",
        desc: "A dimensão judicial mostra que **Colômbia**, **Peru** e **Equador** apresentam um desempenho sólido, enquanto o **Suriname** obtém a pontuação mais baixa. A capacidade de indivíduos e comunidades de ajuizar ações ambientais coletivas ou recursos constitucionais é amplamente reconhecida em sete dos oito países. O diferencial na região é se os tribunais emitiram decisões vinculativas reconhecendo os ecossistemas naturais como sujeitos de direitos, criando restrições ou obrigações em casos de mineração. Apenas **Colômbia**, **Peru** e **Equador** pontuam aqui: o **Equador** por meio de sua decisão histórica do Tribunal Constitucional no caso da Floresta Nublada de Los Cedros (2021), que revogou licenças ambientais de mineração com base nos direitos da natureza; o **Peru** por meio de casos emergentes que reconhecem o rio Marañón como titular de direitos; e a **Colômbia** por meio da jurisprudência de seu Tribunal Constitucional e da Suprema Corte sobre os rios amazônicos.",
      },
      {
        id: "N",
        title: "Restrições, aplicação da lei e responsabilização",
        desc: "Esta é a categoria mais forte da região, refletindo a existência de marcos legais para sanções, revogação de licenças e responsabilização na maioria dos países. A suspensão ou revogação de licenças por violações ambientais ou sociais está presente em todos os oito países. A obrigação de adotar medidas de reabilitação e compensação — quando são constatados danos ambientais — é igualmente universal. Os principais diferenciais são a aplicação de sanções com base em evidências remotas, como imagens de satélite — onde **Bolívia**, **Equador**, **Peru** e **Colômbia** obtêm 1 ponto, enquanto **Guiana**, **Suriname** e **Venezuela** obtêm 0. As sanções específicas para o mercúrio permanecem parciais em todos os lugares, com a maioria dos países baseando-se em leis ambientais gerais ou sobre substâncias perigosas, em vez de disposições penais específicas para o mercúrio.",
      },
      {
        id: "O",
        title: "Sanções econômicas e penais",
        desc: "**Colômbia**, **Peru**, **Brasil** e **Equador** obtêm pontuação alta nesta categoria, refletindo estruturas penais maduras que criminalizam a mineração ilegal e o comércio associado, visam redes criminosas, aplicam sanções econômicas a comerciantes de ouro ilícito e permitem sanções administrativas independentemente de processos criminais. **Venezuela**, **Bolívia**, **Guiana** e **Suriname** apresentam lacunas significativas. Os critérios mais fracos são as sanções legais específicas para crimes ambientais relacionados à mineração artesanal e de pequena escala (ASM), onde a **Bolívia** e o **Suriname** obtêm nota 0; e as sanções econômicas contra comerciantes de ouro ilícito, onde a **Guiana** e o **Suriname** obtêm nota 0. A baixa pontuação do **Suriname** nesta categoria é o desempenho mais insatisfatório na Dimensão III, refletindo um ambiente de fiscalização em que redes criminosas envolvidas no comércio ilegal de ouro raramente são alvo de mecanismos legais nacionais.",
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

export const getPolicyDimensionOverviewLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`overview_${lang}`] ?? "";

export const getPolicyDimensionDescriptionLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`desc_${lang}`] ?? "";

export const getPolicyDimensionCategoriesLocalized = (
  name_en: string,
  lang: PERMITTED_LANGUAGES,
) => findDimension(name_en)?.[`categories_${lang}`] ?? [];

export const POLICY_DIMENSION_SLUGS = POLICY_DIMENSIONS.map((d) => d.slug);
export type PolicyDimensionSlug = (typeof POLICY_DIMENSION_SLUGS)[number];
