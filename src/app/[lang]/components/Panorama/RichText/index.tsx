import { getMarkdownText } from "@/utils/content";
import style from "./style.module.css";

interface RichTextProps {
  content: string | null | undefined;
  className?: string;
}

// renders markdown rich text fields from the CMS
const RichText = ({ content, className }: RichTextProps) => {
  if (!content) return null;
  return (
    <div
      className={`${style.richText} ${className ?? ""}`}
      dangerouslySetInnerHTML={getMarkdownText(content)}
    />
  );
};

export default RichText;
