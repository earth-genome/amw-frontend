"use client";
import { usePrint } from "@/app/[lang]/components/PanoramaPrint/PrintDocument";

// the page number of a block, once the pages are laid out
const PageNumber = ({ anchor }: { anchor: string }) => {
  const { anchorPages } = usePrint();
  return <>{anchorPages[anchor] ?? ""}</>;
};

export default PageNumber;
