import RichText from "@/app/[lang]/components/Panorama/RichText";

interface MiningUpdateProps {
  dictionary: { [key: string]: any };
  // markdown rich text from the CMS
  content: string | null | undefined;
  className?: string;
  labelClassName?: string;
}

// the mining update of a highlighted area, after a "Mining update:" label
const MiningUpdate = ({
  dictionary,
  content,
  className,
  labelClassName,
}: MiningUpdateProps) => {
  if (!content) return null;
  return (
    <div className={className}>
      <span className={labelClassName}>
        {dictionary?.panorama?.mining_update}
      </span>
      <RichText content={content} />
    </div>
  );
};

export default MiningUpdate;
