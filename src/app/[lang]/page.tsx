import React from "react";
import { Locale } from "../../../i18n-config";
import { getDictionary } from "../../get-dictionary";
import Intro from "./components/Intro";

export default async function Page({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  return (
    <div>
      <Intro dictionary={dictionary} />
    </div>
  );
}
