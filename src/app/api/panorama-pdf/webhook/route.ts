import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { i18n } from "@root/i18n-config";
import {
  deleteStoredPanoramaPdfs,
  generateAndStorePanoramaPdf,
  isPanoramaPdfStorageEnabled,
} from "@/utils/panoramaPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// the PDF is generated after responding to the webhook, see waitUntil
export const maxDuration = 300;

// payload of the Strapi webhooks, only the fields used here
interface StrapiWebhookPayload {
  event?: string;
  model?: string;
  uid?: string;
  entry?: {
    issueNumber?: number;
    locale?: string;
    publishedAt?: string | null;
  };
}

const isModel = (payload: StrapiWebhookPayload, model: string) =>
  payload.model === model || !!payload.uid?.endsWith(`.${model}`);

const isAuthorized = (request: NextRequest, secret: string) => {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};

// called by a Strapi webhook (Settings → Webhooks) when a Panorama report changes, with the
// header "Authorization: Bearer <PANORAMA_PDF_WEBHOOK_SECRET>":
// - a report is published, or a published report is updated: its PDF is generated again
// - a report is unpublished or deleted: its PDF is deleted
// - the Panorama home is published (the back page of the PDFs): the PDFs of the language
//   are deleted, and generated again the next time they are downloaded
export async function POST(request: NextRequest) {
  const secret = process.env.PANORAMA_PDF_WEBHOOK_SECRET;
  if (!secret || !isPanoramaPdfStorageEnabled()) {
    return NextResponse.json(
      { error: "The PDF webhook is not configured" },
      { status: 500 },
    );
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: StrapiWebhookPayload = await request.json().catch(() => ({}));
  const { event, entry } = payload;
  const lang = entry?.locale ?? i18n.defaultLocale;
  if (!(i18n.locales as readonly string[]).includes(lang)) {
    return NextResponse.json({ status: "ignored", reason: "locale" });
  }

  // with draft & publish, updates of drafts don't change the published report
  const isPublished =
    event === "entry.publish" ||
    (event === "entry.update" && !!entry?.publishedAt);
  const isRemoved = event === "entry.unpublish" || event === "entry.delete";

  const run = (task: Promise<unknown>, status: string) => {
    // keeps the function running after the response, so Strapi doesn't wait for it
    waitUntil(
      task.catch((error) =>
        console.error(`[panorama-pdf] webhook ${event}:`, error),
      ),
    );
    return NextResponse.json({ status }, { status: 202 });
  };

  if (isModel(payload, "panorama-report") && entry?.issueNumber) {
    const issueNumber = Number(entry.issueNumber);
    if (isPublished) {
      return run(
        generateAndStorePanoramaPdf({
          origin: request.nextUrl.origin,
          lang,
          issueNumber,
        }),
        "generating",
      );
    }
    if (isRemoved) {
      return run(deleteStoredPanoramaPdfs(lang, issueNumber), "deleting");
    }
  }

  if (isModel(payload, "panorama-home") && (isPublished || isRemoved)) {
    return run(deleteStoredPanoramaPdfs(lang), "deleting");
  }

  return NextResponse.json({ status: "ignored" });
}
