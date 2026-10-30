import "server-only";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { BlobNotFoundError, del, head, list, put } from "@vercel/blob";
import { getPanoramaPrintPath } from "@/cms/panorama";

// generates the PDFs of the Panorama reports from their print pages, and stores them in
// Vercel Blob, so they are only generated again when the reports change

// bump it to generate all the stored PDFs again, e.g. after changing the print page
const PDF_LAYOUT_VERSION = 1;

// time for the print page to load, lay out its pages and render its maps, the functions
// that generate the PDFs can run for up to 300s
const PAGE_LOAD_TIMEOUT = 60000;
const READY_TIMEOUT = 230000;
const READY_POLL_INTERVAL = 500;
const PROGRESS_LOG_INTERVAL = 10000;
// for each call to the browser, e.g. when the page is busy rendering a map
const PROTOCOL_TIMEOUT = 60000;
// the CDN serves the previous PDF for up to this long after it's generated again
const BLOB_CACHE_MAX_AGE = 60;
// the Blob client retries failed requests, and doesn't stop on an abort signal when the
// connection hangs, so they could otherwise take minutes
const BLOB_LOOKUP_TIMEOUT = 10000;
const BLOB_WRITE_TIMEOUT = 60000;

interface PanoramaPdfOptions {
  // origin of the deployment with the print pages, e.g. "https://amazonminingwatch.org"
  origin: string;
  lang: string;
  issueNumber: number;
}

// the print page of the report doesn't exist
export class PanoramaPdfNotFoundError extends Error {}

export const isPanoramaPdfStorageEnabled = () =>
  !!process.env.BLOB_READ_WRITE_TOKEN;

const getPdfFilename = (lang: string, issueNumber: number) =>
  `amazon-mining-watch-panorama-issue-${issueNumber}-${lang}.pdf`;

// each environment has its own PDFs, so preview deployments don't replace the production
// ones, e.g. "panorama-pdf/production/v1/en/"
const getBlobPrefix = (lang: string) =>
  `panorama-pdf/${process.env.VERCEL_ENV ?? "development"}/v${PDF_LAYOUT_VERSION}/${lang}/`;

const getBlobPathname = (lang: string, issueNumber: number) =>
  `${getBlobPrefix(lang)}${getPdfFilename(lang, issueNumber)}`;

const withTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(new Error(`Blob storage timed out after ${timeout / 1000}s`)),
      timeout,
    );
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });

const log = (
  { lang, issueNumber }: Pick<PanoramaPdfOptions, "lang" | "issueNumber">,
  message: string,
) => console.log(`[panorama-pdf] ${lang} issue ${issueNumber}: ${message}`);

// ================== GENERATION ==================

// a local Chrome can be used in development, e.g. CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium,
// and shown with PANORAMA_PDF_DEBUG=true to watch the print page
const launchBrowser = async () => {
  const localExecutablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
  return puppeteer.launch({
    executablePath: localExecutablePath || (await chromium.executablePath()),
    // the default args of @sparticuz/chromium enable WebGL with SwiftShader, for the maps.
    // A local Chrome uses the GPU when there is one, and falls back to SwiftShader
    args: localExecutablePath
      ? ["--no-sandbox", "--enable-unsafe-swiftshader"]
      : chromium.args,
    headless: !(
      localExecutablePath && process.env.PANORAMA_PDF_DEBUG === "true"
    ),
    protocolTimeout: PROTOCOL_TIMEOUT,
  });
};

// renders the print page of a report to a PDF
export const renderPanoramaPdf = async (
  options: PanoramaPdfOptions,
): Promise<Buffer> => {
  const { origin, lang, issueNumber } = options;
  const printUrl = `${origin}${getPanoramaPrintPath(lang, issueNumber)}`;
  const startTime = Date.now();
  const browser = await launchBrowser();
  let progressInterval: ReturnType<typeof setInterval> | undefined;

  try {
    const page = await browser.newPage();
    // a letter page wide, with a high resolution for the map snapshots
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

    // the errors of the print page, e.g. maps that fail to load
    page.on("pageerror", (error) =>
      log(options, `page error: ${(error as Error).message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error") {
        log(options, `console error: ${message.text().slice(0, 300)}`);
      }
    });

    const getProgress = () =>
      page
        .evaluate(() => document.body.dataset.pdfProgress)
        .catch(() => undefined);

    // preview deployments can be protected, see Vercel's "Protection Bypass for
    // Automation". The secret sets a cookie for the next requests of the page to the
    // deployment, instead of a header that would also be sent to other sites, e.g. Mapbox
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    const gotoUrl = bypassSecret
      ? `${printUrl}?${new URLSearchParams({
          "x-vercel-protection-bypass": bypassSecret,
          "x-vercel-set-bypass-cookie": "true",
        })}`
      : printUrl;

    log(options, `rendering ${printUrl}`);
    const response = await page.goto(gotoUrl, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_LOAD_TIMEOUT,
    });
    if (response?.status() === 404) throw new PanoramaPdfNotFoundError();
    if (response?.status() === 401 && !bypassSecret) {
      throw new Error(
        "Print page returned 401, the deployment is protected: enable Vercel's " +
          '"Protection Bypass for Automation" to generate the PDFs',
      );
    }
    if (!response?.ok()) {
      throw new Error(`Print page returned ${response?.status()}`);
    }

    progressInterval = setInterval(async () => {
      log(options, `${(await getProgress()) ?? "loading"}...`);
    }, PROGRESS_LOG_INTERVAL);

    // polls the page with short calls, a waitForFunction is a single call to the browser
    // that puppeteer cuts after its protocolTimeout
    const deadline = Date.now() + READY_TIMEOUT;
    while (
      !(await page.evaluate(() => document.body.dataset.pdfReady === "true"))
    ) {
      if (Date.now() > deadline) {
        throw new Error(
          `Print page not ready after ${READY_TIMEOUT / 1000}s, at "${await getProgress()}"`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_INTERVAL));
    }

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    });
    log(options, `rendered in ${Math.round((Date.now() - startTime) / 1000)}s`);
    return Buffer.from(pdf);
  } finally {
    clearInterval(progressInterval);
    await browser.close();
  }
};

// ================== STORAGE ==================

// url of a stored PDF on the site, served from the Blob store through the rewrite in
// next.config.js, so it has the domain and the favicon of the site
export const getPanoramaPdfSiteUrl = (blobUrl: string, origin: string) => {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId ? `${origin}${new URL(blobUrl).pathname}` : blobUrl;
};

// url of the stored PDF of a report, if it was generated
export const findStoredPanoramaPdf = async (
  lang: string,
  issueNumber: number,
): Promise<string | undefined> => {
  try {
    const blob = await withTimeout(
      head(getBlobPathname(lang, issueNumber)),
      BLOB_LOOKUP_TIMEOUT,
    );
    return blob.url;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return undefined;
    throw error;
  }
};

// generates the PDF of a report and stores it, replacing the previous one
export const generateAndStorePanoramaPdf = async (
  options: PanoramaPdfOptions,
): Promise<string> => {
  const { lang, issueNumber } = options;
  const pdf = await renderPanoramaPdf(options);
  const blob = await withTimeout(
    put(getBlobPathname(lang, issueNumber), pdf, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: BLOB_CACHE_MAX_AGE,
    }),
    BLOB_WRITE_TIMEOUT,
  );
  log(options, `stored at ${blob.url}`);
  return blob.url;
};

// deletes the stored PDF of a report, or all of a language when no issue is given, so
// they are generated again the next time they are downloaded
export const deleteStoredPanoramaPdfs = async (
  lang: string,
  issueNumber?: number,
) => {
  if (issueNumber) {
    await withTimeout(
      del(getBlobPathname(lang, issueNumber)),
      BLOB_WRITE_TIMEOUT,
    );
    log({ lang, issueNumber }, "deleted");
    return;
  }

  const { blobs } = await withTimeout(
    list({ prefix: getBlobPrefix(lang) }),
    BLOB_LOOKUP_TIMEOUT,
  );
  if (blobs.length) {
    await withTimeout(del(blobs.map((blob) => blob.url)), BLOB_WRITE_TIMEOUT);
  }
  console.log(`[panorama-pdf] ${lang}: deleted ${blobs.length} PDFs`);
};
