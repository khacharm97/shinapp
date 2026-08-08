import type { LocalizedString } from '@/types';

export const getLocalizedName = (item: LocalizedString, language: string): string => {
  if (language === "fa") return item.nameFa || item.nameEn || item.name || "";
  if (language === "am") return item.nameAm || item.nameEn || item.name || "";
  if (language === "ru") return item.nameRu || item.nameEn || item.name || "";
  return item.nameEn || item.name || "";
};
