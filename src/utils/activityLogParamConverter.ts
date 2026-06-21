import type { LogField } from "@/types/types";

// TRANSLATION
import type { TFunction } from "i18next";

const ROLES_TO_TRANSLATE = ["member", "admin", "super_admin", "none"]

export const parseActivityLogFields = (
  fields: LogField[] = [],
  t: TFunction
): Record<string, string> => {
  return fields.reduce((acc, field) => {

    if(ROLES_TO_TRANSLATE.includes(field.value.toLocaleLowerCase())){
      acc[field.key] = t(`user:roles.${field.value.toLocaleLowerCase()}`, { defaultValue: field.value })
    } else {
      acc[field.key] = field.value;
    }

    return acc;
  }, {} as Record<string, string>);
};