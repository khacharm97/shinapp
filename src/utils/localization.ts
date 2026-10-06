import type { Locale } from 'date-fns';
import { enUS, faIR, hy, ru } from 'date-fns/locale';
import type { LocalizedString } from '@/types';

export const getLocalizedName = (item: LocalizedString, language: string): string => {
  if (language === "fa") return item.nameFa || item.nameEn || item.name || "";
  if (language === "am") return item.nameAm || item.nameEn || item.name || "";
  if (language === "ru") return item.nameRu || item.nameEn || item.name || "";
  return item.nameEn || item.name || "";
};

// date-fns ships its own locale data, unlike Intl, which falls back to
// English for Armenian in browsers that lack the "hy" locale.
const DATE_LOCALES: Record<string, Locale> = { am: hy, ru, fa: faIR };

export const getDateLocale = (language: string): Locale => DATE_LOCALES[language] || enUS;
