import { NextRequest, NextResponse } from "next/server";
import { i18n } from "@root/i18n-config";
import { parsePanoramaIssueParam } from "@/cms/panorama";
import {
  findStoredPanoramaPdf,
  generateAndStorePanoramaPdf,
  getPanoramaPdfSiteUrl,
  getPanoramaPdfVersion,
  isPanoramaPdfStorageEnabled,
  PanoramaPdfNotFoundError,
  PanoramaPdfVersion,
  renderPanoramaPdf,
} from "@/utils/panoramaPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// generating a PDF renders all the maps of the report
export const maxDuration = 300;

type Options = Parameters<typeof renderPanoramaPdf>[0];

// generates the PDF and returns it directly, without storing it
const renderPdfResponse = async (options: Options) => {
  const pdf = await renderPanoramaPdf(options);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="amazon-mining-watch-panorama-issue-${options.issueNumber}-${options.lang}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
};

// looks for the stored PDF, undefined when the storage can't be reached
const findStoredPdf = async (
  { lang, issueNumber }: Options,
  version: PanoramaPdfVersion,
) => {
  try {
    return { url: await findStoredPanoramaPdf(lang, issueNumber, version) };
  } catch (error) {
    console.error(`[panorama-pdf] ${lang} issue ${issueNumber}:`, error);
    return undefined;
  }
};

// the PDF of a Panorama report: the stored one, generated when the report is published
// (see the webhook route), or generated now if there is none yet
export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string; issue: string } },
) {
  const { lang, issue } = params;
  const issueNumber = parsePanoramaIssueParam(issue);
  if (!(i18n.locales as readonly string[]).includes(lang) || !issueNumber) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const options = { origin: request.nextUrl.origin, lang, issueNumber };

  try {
    // the browser is only launched for the reports that exist
    const version = await getPanoramaPdfVersion(lang, issueNumber);
    if (!version) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // without storage, e.g. in development, the PDF is generated on every request
    if (!isPanoramaPdfStorageEnabled()) return await renderPdfResponse(options);

    const stored = await findStoredPdf(options, version);
    // the storage can't be reached, so the PDF is still available
    if (!stored) return await renderPdfResponse(options);

    const url =
      stored.url ?? (await generateAndStorePanoramaPdf(options, version));
    return NextResponse.redirect(getPanoramaPdfSiteUrl(url, options.origin), {
      status: 302,
      // the url changes with the content of the report, and the previous PDFs are deleted
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof PanoramaPdfNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(`[panorama-pdf] ${lang} issue ${issueNumber}:`, error);
    return NextResponse.json(
      { error: "Failed to generate the PDF" },
      { status: 500 },
    );
  }
}
