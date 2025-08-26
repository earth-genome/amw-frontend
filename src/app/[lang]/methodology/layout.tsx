import type { Metadata, ResolvingMetadata } from "next";
import { i18n, type Locale } from "../../../../i18n-config";
import { getDictionary } from "../../../get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";

type Props = {
  params: { lang: PERMITTED_LANGUAGES };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.method.title,
  };
}

export default async function PageLayout({
  children, // will be a page or nested layout
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return <section>{children}</section>;
}
