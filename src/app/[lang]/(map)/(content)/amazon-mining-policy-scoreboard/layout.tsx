import { PERMITTED_LANGUAGES } from "@/utils/content";
import style from "./style.module.css";

export default async function PolicyScoreboardPagesLayout({
  children,
}: {
  children: React.ReactNode;
  params: { lang: PERMITTED_LANGUAGES };
}) {
  return (
    <div className={style.overlay}>
      <div className={style.content}>
        <section>{children}</section>
      </div>
    </div>
  );
}
