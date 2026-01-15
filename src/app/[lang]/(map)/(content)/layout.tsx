import { PERMITTED_LANGUAGES } from "@/utils/content";

export default async function ContentPagesLayout({
  children,
}: {
  children: React.ReactNode;
  params: { lang: PERMITTED_LANGUAGES };
}) {
  return <section>{children}</section>;
}
