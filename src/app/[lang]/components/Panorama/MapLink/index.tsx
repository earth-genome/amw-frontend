import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import { getLocalMapHref } from "@/utils/mapParams";

interface MapLinkProps {
  mapLink: string | null | undefined;
  lang: string;
  label: string;
  className?: string;
}

// link to the main interactive map from a CMS map link, on the current domain and locale
const MapLink = ({ mapLink, lang, label, className }: MapLinkProps) => {
  const href = getLocalMapHref(mapLink, lang);
  if (!href) return null;
  return (
    <a
      className={`${shared.link} ${className ?? ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label} ↗
    </a>
  );
};

export default MapLink;
