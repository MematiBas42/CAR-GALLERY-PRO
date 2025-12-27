export const locales = ["en", "es", "ko", "vi", "ru", "uk", "tr", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const languages = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
  {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
  },
  {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "uk",
    name: "Українська",
    flag: "🇺🇦",
  },
  {
    code: "tr",
    name: "Türkçe",
    flag: "🇹🇷",
  },
  {
    code: "ar",
    name: "العربية",
    flag: "🇸🇦",
  },
] as const;
