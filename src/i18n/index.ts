import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEn from "./locals/en/common.json"
import userEn from "./locals/en/user.json"
import sidebarEn from "./locals/en/sidebar.json";
import breadcrumbEn from "./locals/en/breadcrumb.json"
import organizationEn from "./locals/en/organization.json";
import homeEn from "./locals/en/home.json";

import commonEs from "./locals/es/common.json";
import userEs from "./locals/es/user.json"
import sidebarEs from "./locals/es/sidebar.json";
import breadcrumbEs from "./locals/es/breadcrumb.json"
import organizationEs from "./locals/es/organization.json";
import homeEs from "./locals/es/home.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    detection: {
      order: ["navigator"],
    },

    ns: [
      "common",
      "organization",
      "home",
    ],

    defaultNS: "common",

    resources: {
      en: {
        common: commonEn,
        user: userEn,
        sidebar: sidebarEn,
        breadcrumb: breadcrumbEn,
        organization: organizationEn,
        home: homeEn,
      },
      es: {
        common: commonEs,
        user: userEs,
        sidebar: sidebarEs,
        breadcrumb: breadcrumbEs,
        organization: organizationEs,
        home: homeEs,
      },
    },
  });

export default i18n;