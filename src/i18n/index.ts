import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locals/en/translation.json";
import es from "./locals/es/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    detection: {
      order: ["navigator"],
    },

    supportedLngs: ["en", "es"],

    load: "languageOnly",

    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n;