export type PERMITTED_LANGUAGES = "en" | "es" | "pt";

export const formatNumber = (
  number: number,
  language: string,
  decimalDigits = 2
) => {
  const formatterConfigs = {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  };
  const formatter = new Intl.NumberFormat(language, formatterConfigs);
  return formatter.format(number || 0);
};
