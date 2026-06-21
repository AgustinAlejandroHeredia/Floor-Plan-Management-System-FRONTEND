import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEn from "./locals/en/common.json"
import userEn from "./locals/en/user.json"
import sidebarEn from "./locals/en/sidebar.json";
import breadcrumbEn from "./locals/en/breadcrumb.json"
import homeEn from "./locals/en/home.json";
import organizationEn from "./locals/en/organization.json";
import projectEn from "./locals/en/project.json"
import blueprintEn from "./locals/en/blueprint.json"
import itemsEn from "./locals/en/items.json"
import developerOptionsEn from "./locals/en/developeroptions.json"
import myfilesEn from "./locals/en/myfiles.json"
import myuploadsEn from "./locals/en/myuploads.json"
import recentactivityEn from "./locals/en/recentactivity.json"

import commonEs from "./locals/es/common.json";
import userEs from "./locals/es/user.json"
import sidebarEs from "./locals/es/sidebar.json";
import breadcrumbEs from "./locals/es/breadcrumb.json"
import homeEs from "./locals/es/home.json";
import organizationEs from "./locals/es/organization.json";
import projectEs from "./locals/es/project.json"
import blueprintEs from "./locals/es/blueprint.json"
import itemsEs from "./locals/es/items.json"
import developerOptionsEs from "./locals/es/developeroptions.json"
import myfilesEs from "./locals/es/myfiles.json"
import myuploadsEs from "./locals/es/myuploads.json"
import recentactivityEs from "./locals/es/recentactivity.json"

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
      "user",
      "sidebar",
      "breadcrumb",
      "home",
      "organization",
      "project",
      "blueprint",
      "items",
      "developeroptions",
      "myfiles",
      "myuploads",
      "recentactivity",
    ],

    defaultNS: "common",

    resources: {
      en: {
        common: commonEn,
        user: userEn,
        sidebar: sidebarEn,
        breadcrumb: breadcrumbEn,
        home: homeEn,
        organization: organizationEn,
        project: projectEn,
        blueprint: blueprintEn,
        items: itemsEn,
        developeroptions: developerOptionsEn,
        myfiles: myfilesEn,
        myupoloads: myuploadsEn,
        recentactivity: recentactivityEn,
      },
      es: {
        common: commonEs,
        user: userEs,
        sidebar: sidebarEs,
        breadcrumb: breadcrumbEs,
        home: homeEs,
        organization: organizationEs,
        project: projectEs,
        blueprint: blueprintEs,
        items: itemsEs,
        developeroptions: developerOptionsEs,
        myfiles: myfilesEs,
        myupoloads: myuploadsEs,
        recentactivity: recentactivityEs,
      },
    },
  });

export default i18n;