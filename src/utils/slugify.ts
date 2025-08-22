export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
};
