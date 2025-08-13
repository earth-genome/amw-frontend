export type PERMITTED_LANGUAGES = "en" | "es" | "pt";

export const formatNumber = (number: number, language: string) => {
  const formatterConfigs =
    Math.abs(number) < 10
      ? {
          // if smaller than 10, display 2 decimal digits
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      : {
          // else round
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };
  const formatter = new Intl.NumberFormat(language, formatterConfigs);
  return formatter.format(number || 0);
};