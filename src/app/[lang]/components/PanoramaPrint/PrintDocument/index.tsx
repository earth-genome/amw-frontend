"use client";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "./style.module.css";
import MapRenderer, {
  type MapJob,
} from "@/app/[lang]/components/PanoramaPrint/MapRenderer";

// the document is laid out in letter pages, at 96px per inch
const PAGE_HEIGHT = 11 * 96;
const PAGE_PADDING_TOP = 0.6 * 96;
// space for the footer at the bottom of the flow pages
const PAGE_FOOTER_HEIGHT = 0.8 * 96;

// ms to wait for the fonts and the images before laying out the pages anyway, e.g. if
// an image never loads
const LAYOUT_WAIT_TIMEOUT = 10000;

const waitAtMost = (promise: Promise<unknown>, timeout: number) =>
  Promise.race([
    promise.catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);

// images that are still loading, to know where the layout is waiting
const getPendingImages = () =>
  Array.from(document.images).filter((image) => !image.complete);

export interface PrintBlock {
  key: string;
  // "page": a page on its own, e.g. the cover. "flow": packed with the next blocks into
  // pages with the footer
  type: "page" | "flow";
  // starts a new page, e.g. the section headers
  breakBefore?: boolean;
  // takes the full width of the page, e.g. a dark band. It also takes the top padding of
  // the page when it is the first block of the page
  fullWidth?: boolean;
  // takes the space left at the bottom of its page, e.g. for a map that fills the page
  grow?: boolean;
  // id to get the page number of the block, e.g. for the contents
  anchor?: string;
  content: ReactNode;
}

interface PrintPage {
  type: "page" | "flow";
  blockIndexes: number[];
  // heights of the blocks, including the space given to the growing blocks
  blockHeights: Record<number, number>;
}

// ================== CONTEXT ==================

interface PrintContextType {
  // the pages are laid out, so the blocks have their final size
  isLaidOut: boolean;
  // map snapshots by map id, null when the map couldn't be rendered
  mapSnapshots: Record<string, string | null>;
  // asks for a snapshot of a map, once its final size is known
  requestMapSnapshot: (_job: MapJob) => void;
  // page numbers by block anchor, once the pages are laid out
  anchorPages: Record<string, number>;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export const usePrint = (): PrintContextType => {
  const context = useContext(PrintContext);
  if (context === undefined) {
    throw new Error("usePrint must be used within a PrintDocument");
  }
  return context;
};

// ================== PAGINATION ==================

// packs the blocks into pages, a block is never split between pages
const paginate = (blocks: PrintBlock[], heights: number[]): PrintPage[] => {
  const pages: PrintPage[] = [];
  let currentPage: PrintPage | undefined;
  let usedHeight = 0;

  // the growing blocks of a page share the space left at its bottom
  const growBlocks = (page: PrintPage | undefined, used: number) => {
    if (!page || page.type !== "flow") return;
    const growIndexes = page.blockIndexes.filter((i) => blocks[i].grow);
    if (!growIndexes.length) return;
    const extra = Math.max(0, PAGE_HEIGHT - PAGE_FOOTER_HEIGHT - used);
    growIndexes.forEach((i) => {
      page.blockHeights[i] += Math.floor(extra / growIndexes.length);
    });
  };

  blocks.forEach((block, i) => {
    if (block.type === "page") {
      growBlocks(currentPage, usedHeight);
      pages.push({ type: "page", blockIndexes: [i], blockHeights: {} });
      currentPage = undefined;
      return;
    }

    const height = heights[i] ?? 0;
    const fitsInPage = usedHeight + height <= PAGE_HEIGHT - PAGE_FOOTER_HEIGHT;
    if (!currentPage || block.breakBefore || !fitsInPage) {
      growBlocks(currentPage, usedHeight);
      // a block that doesn't fit in an empty page is still placed, and overflows
      currentPage = { type: "flow", blockIndexes: [], blockHeights: {} };
      pages.push(currentPage);
      usedHeight = block.fullWidth ? 0 : PAGE_PADDING_TOP;
    }
    currentPage.blockIndexes.push(i);
    currentPage.blockHeights[i] = height;
    usedHeight += height;
  });
  growBlocks(currentPage, usedHeight);

  return pages;
};

// ================== COMPONENT ==================

interface PrintDocumentProps {
  blocks: PrintBlock[];
  // ids of the maps in the document, rendered in this order
  mapIds: string[];
  footerLabel: string;
  preparingLabel?: string;
}

// renders the blocks of a report in letter pages, for printing or generating a PDF.
// The blocks are first rendered in a single column to measure them, once the fonts are
// loaded, then they are laid out in pages, and finally the maps are rendered at their
// final size
const PrintDocument = ({
  blocks,
  mapIds,
  footerLabel,
  preparingLabel,
}: PrintDocumentProps) => {
  const [pages, setPages] = useState<PrintPage[] | undefined>(undefined);
  const [mapJobs, setMapJobs] = useState<Record<string, MapJob>>({});
  const [mapSnapshots, setMapSnapshots] = useState<
    Record<string, string | null>
  >({});
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const requestMapSnapshot = useCallback(
    (job: MapJob) => setMapJobs((prev) => ({ ...prev, [job.mapId]: job })),
    [],
  );

  const setMapSnapshot = useCallback(
    (mapId: string, snapshot: string | null) =>
      setMapSnapshots((prev) => ({ ...prev, [mapId]: snapshot })),
    [],
  );

  // the maps are rendered one by one, in the order of the document
  const nextMapJob = useMemo(() => {
    const mapId = mapIds.find((id) => !(id in mapSnapshots));
    return mapId ? mapJobs[mapId] : undefined;
  }, [mapIds, mapJobs, mapSnapshots]);
  const areMapsDone = mapIds.every((id) => id in mapSnapshots);
  const mapsDoneCount = mapIds.filter((id) => id in mapSnapshots).length;
  const progress = !pages
    ? "laying out the pages"
    : `maps ${mapsDoneCount}/${mapIds.length}`;

  // progress for the PDF generator, e.g. to know where it got stuck
  useEffect(() => {
    document.body.dataset.pdfProgress = progress;
  }, [progress]);

  // lay out the pages once everything that changes the height of the blocks is loaded
  useEffect(() => {
    if (pages) return;
    let isCancelled = false;

    const layOut = async () => {
      document.body.dataset.pdfProgress = "laying out the pages: fonts";
      await waitAtMost(document.fonts.ready, LAYOUT_WAIT_TIMEOUT);

      const pendingImages = getPendingImages();
      document.body.dataset.pdfProgress = `laying out the pages: ${
        pendingImages.length
      } images (${pendingImages
        .map((image) => image.currentSrc || image.src)
        .join(", ")
        .slice(0, 300)})`;
      await waitAtMost(
        Promise.all(pendingImages.map((image) => image.decode())),
        LAYOUT_WAIT_TIMEOUT,
      );
      // wait for the charts, which are sized after they are mounted
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (isCancelled) return;

      const heights = blocks.map(
        (_, i) => blockRefs.current[i]?.getBoundingClientRect().height ?? 0,
      );
      setPages(paginate(blocks, heights));
    };
    layOut();

    return () => {
      isCancelled = true;
    };
  }, [blocks, pages]);

  // flag for the PDF generator, once the pages are laid out and the maps rendered
  useEffect(() => {
    if (!pages || !areMapsDone) return;
    const timeout = window.setTimeout(() => {
      document.body.dataset.pdfReady = "true";
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [pages, areMapsDone]);

  const anchorPages = useMemo(() => {
    const result: Record<string, number> = {};
    pages?.forEach((page, pageIndex) =>
      page.blockIndexes.forEach((blockIndex) => {
        const anchor = blocks[blockIndex]?.anchor;
        if (anchor) result[anchor] = pageIndex + 1;
      }),
    );
    return result;
  }, [blocks, pages]);

  const renderBlock = (blockIndex: number, page?: PrintPage) => {
    const block = blocks[blockIndex];
    const isGrowing = !!page && !!block.grow;
    return (
      <div
        key={block.key}
        ref={
          page
            ? undefined
            : (element) => {
                blockRefs.current[blockIndex] = element;
              }
        }
        className={`${style.block} ${
          block.type === "flow" && !block.fullWidth ? style.blockPadded : ""
        } ${isGrowing ? style.blockGrow : ""}`}
        style={
          isGrowing ? { height: page.blockHeights[blockIndex] } : undefined
        }
      >
        {block.content}
      </div>
    );
  };

  return (
    <PrintContext.Provider
      value={{
        isLaidOut: !!pages,
        mapSnapshots,
        requestMapSnapshot,
        anchorPages,
      }}
    >
      {!pages ? (
        // measuring
        <div className={style.measure}>
          {blocks.map((block, i) =>
            block.type === "page" ? (
              <div key={block.key} className={style.page}>
                {block.content}
              </div>
            ) : (
              renderBlock(i)
            ),
          )}
        </div>
      ) : (
        <div className={style.document}>
          {pages.map((page, pageIndex) =>
            page.type === "page" ? (
              <div key={pageIndex} className={style.page}>
                {blocks[page.blockIndexes[0]].content}
              </div>
            ) : (
              <div key={pageIndex} className={style.page}>
                <div
                  className={style.pageBody}
                  style={{
                    paddingTop: blocks[page.blockIndexes[0]]?.fullWidth
                      ? 0
                      : PAGE_PADDING_TOP,
                  }}
                >
                  {page.blockIndexes.map((blockIndex) =>
                    renderBlock(blockIndex, page),
                  )}
                </div>
                <div className={style.footer}>
                  <span>{footerLabel}</span>
                  <span>{pageIndex + 1}</span>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* a single map renders the snapshots of all the maps, and stays mounted */}
      {pages && mapIds.length > 0 && (
        <MapRenderer job={nextMapJob} onSnapshot={setMapSnapshot} />
      )}

      {(!pages || !areMapsDone) && (
        <div className={style.status}>
          {preparingLabel}… {pages && `${mapsDoneCount}/${mapIds.length}`}
        </div>
      )}
    </PrintContext.Provider>
  );
};

export default PrintDocument;
