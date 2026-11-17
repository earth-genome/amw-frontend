import { apiFetcher } from "@/cms/client";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { NextPage } from "next";
import { marked } from "marked";
import { Fragment, ReactNode } from "react";
import Overlay from "@/app/[lang]/components/Overlay";
import {
  DownloadGateProvider,
  GatedDownloadButton,
} from "@/app/[lang]/components/DownloadGate";
import { METHODOLOGY_URL, MethodologyResponse } from "@/cms/methodology";
import { getDictionary } from "@/get-dictionary";
import { Resource } from "@/utils/methodologyContact";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

// Placeholders for the gated buttons, on their own line in the CMS body
const PLACEHOLDERS: Record<string, Resource> = {
  data_button: "data",
  code_button: "code",
};
const PLACEHOLDER_REGEX = /^[ \t]*\{\{\s*(data_button|code_button)\s*\}\}[ \t]*$/m;

export async function generateMetadata({ params: { lang } }: PageProps) {
  const response = await apiFetcher<MethodologyResponse>(METHODOLOGY_URL, {
    locale: lang,
  });
  const dictionary = await getDictionary(lang);
  return {
    title: `${response?.data?.title} - ${dictionary?.home?.title}`,
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<MethodologyResponse>(METHODOLOGY_URL, {
    locale: lang,
  });
  const dictionary = await getDictionary(lang);
  const formDictionary = dictionary.methodology_form;

  const {
    data: { title, body, dataUrl, dataButtonLabel, codeUrl, codeButtonLabel },
  } = response;

  // A button is only shown if its URL is set in the CMS
  const buttons: Partial<Record<Resource, ReactNode>> = {};
  const addButton = (
    resource: Resource,
    href: string | null | undefined,
    label: string | null | undefined,
    fallbackLabel: string,
  ) => {
    const url = href?.trim();
    if (!url) return;
    buttons[resource] = (
      <GatedDownloadButton
        resource={resource}
        href={url}
        labelHtml={marked.parseInline(label?.trim() || fallbackLabel) as string}
      />
    );
  };
  addButton("data", dataUrl, dataButtonLabel, formDictionary.data_button_label);
  addButton("code", codeUrl, codeButtonLabel, formDictionary.code_button_label);

  // Odd indexes are placeholder names (captured by the regex)
  const parts = body ? body.split(PLACEHOLDER_REGEX) : [];
  const placedResources = new Set<Resource>();
  const content = parts.map((part, index) => {
    if (index % 2 === 1) {
      const resource = PLACEHOLDERS[part];
      placedResources.add(resource);
      return <Fragment key={index}>{buttons[resource] ?? null}</Fragment>;
    }
    return part.trim() ? (
      <div key={index} dangerouslySetInnerHTML={getMarkdownText(part)} />
    ) : null;
  });

  // Buttons without a placeholder go above the body
  const unplacedButtons = (Object.keys(buttons) as Resource[])
    .filter((resource) => !placedResources.has(resource))
    .map((resource) => <Fragment key={resource}>{buttons[resource]}</Fragment>);

  return (
    <Overlay>
      <DownloadGateProvider dictionary={formDictionary} lang={lang}>
        {title && <h1>{title}</h1>}
        {unplacedButtons}
        {content}
      </DownloadGateProvider>
    </Overlay>
  );
};

export default Page;
