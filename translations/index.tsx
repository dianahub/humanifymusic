"use client";

import { createContext, useContext, useState } from "react";
import { en, type Translations } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { ja } from "./locales/ja";
import { pt } from "./locales/pt";
import { it } from "./locales/it";

export type Language = "en" | "es" | "fr" | "de" | "ja" | "pt" | "it";

export const languages: { code: Language; flag: string; name: string }[] = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "pt", flag: "🇧🇷", name: "Português" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
];

const allTranslations: Record<Language, Translations> = { en, es, fr, de, ja, pt, it };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  return (
    <I18nContext.Provider value={{ lang, setLang, t: allTranslations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
