import Image from "next/image";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import { getPanoramaMediaUrl, ImageWithCaption } from "@/cms/panorama";

interface HeroImageProps {
  heroImage: ImageWithCaption | null | undefined;
}

const HeroImage = ({ heroImage }: HeroImageProps) => {
  const imageUrl = getPanoramaMediaUrl(heroImage?.image?.url);
  if (!heroImage || !imageUrl) return null;

  return (
    <section className={`${shared.section} ${style.heroImage}`}>
      <Image
        className={style.image}
        src={imageUrl}
        alt={heroImage.image?.alternativeText || ""}
        fill
        sizes="100vw"
      />
      <RichText className={style.caption} content={heroImage.caption} />
    </section>
  );
};

export default HeroImage;
