import Link from "next/link";
import style from "./style.module.css";

interface PartnerLogosProps {
  className?: string;
}

// partner logos, displayed in white on the Panorama headers
const PartnerLogos = ({ className }: PartnerLogosProps) => (
  <div className={`${style.logos} ${className ?? ""}`}>
    <Link
      className={`${style.logo} ${style.acLogo}`}
      href="https://www.amazonconservation.org/"
    >
      Amazon Conservation
    </Link>
    <Link
      className={`${style.logo} ${style.pcLogo}`}
      href="https://pulitzercenter.org"
    >
      Pulitzer Center
    </Link>
    <Link
      className={`${style.logo} ${style.egLogo}`}
      href="https://earthgenome.org/"
    >
      Earth Genome
    </Link>
    <Link
      className={`${style.logo} ${style.mooreLogo}`}
      href="https://www.moore.org/"
    >
      Gordon and Betty Moore Foundation
    </Link>
  </div>
);

export default PartnerLogos;
