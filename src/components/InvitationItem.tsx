import {
  Item,
  ItemContent,
  ItemActions,
} from "@/components/ui/item";

import { Button } from "@/components/ui/button";

import { GrPowerReset } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

import type {
  InvitationItemData,
} from "@/types/types";

// TRANSLATION
import { useTranslation } from "react-i18next";

type Props = {
  invitation: InvitationItemData;

  onRefresh?: (invitation: InvitationItemData) => void;
  onDelete?: (invitation: InvitationItemData) => void;
};

const InvitationItem = ({
  invitation,
  onRefresh,
  onDelete,
}: Props) => {

  const { t, i18n } = useTranslation([
      "components",
      "user"
  ])

  const locale = i18n.resolvedLanguage ?? i18n.language;

  // DATE

  const creationDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(invitation.creationDate));

  // EXPIRATION

  const expirationDate = new Date(
    new Date(invitation.creationDate).getTime() +
      Number(invitation.duration) * 60 * 60 * 1000
  );

  const msLeft = expirationDate.getTime() - Date.now();

  // NUMBERS

  const formatter = new Intl.NumberFormat(locale);

  const hours = Math.floor(msLeft / (1000 * 60 * 60));
  const minutes = Math.floor(
    (msLeft % (1000 * 60 * 60)) / (1000 * 60)
  );

  // TIME LEFT

  const timeLeft =
    msLeft <= 0
      ? t("components:invitationItem.status.expired")
      : t("components:invitationItem.timeLeftData", {
          hours: formatter.format(hours),
          minutes: formatter.format(minutes),
        });

  // COLORS

  const getStatusStateColor = (): string => {
    if(msLeft <= 0){
      return "var(--status-low)"
    }else{
      return "var(--status-excellent)"
    }
  }

  return (
    <Item
      variant="outline"
      className="bg-[var(--accent-bg)] justify-between"
    >
      <ItemContent className="flex flex-col gap-2">

        <span className="font-medium text-[var(--text-h)]">
          {t("components:invitationItem.to")}: {invitation.userEmail}
        </span>

        <span className="text-[var(--text)]">
          {t("components:invitationItem.sentBy")}: {invitation.sentByUserName}
        </span>

        <span className="text-[var(--text)]">
          {t("components:invitationItem.organization")}: {invitation.organizationName}
        </span>

        <span className="text-[var(--text)]">
          {t("components:invitationItem.role")}: {t(`user:roles.${invitation.userOrganizationRole.toLocaleLowerCase()}`)}
        </span>

        <span className="text-[var(--text)]">
          {t("components:invitationItem.created")}: {creationDate}
        </span>

        <span className="text-[var(--text)]">
          {t("components:invitationItem.timeLeft")}:{" "}
          <span style={{ color: getStatusStateColor() }}>
            {timeLeft}
          </span>
        </span>

      </ItemContent>

      <ItemActions className="flex flex-col gap-2 shrink-0">

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-blue-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh(invitation);
            }}
          >
            <GrPowerReset className="w-4 h-4 text-blue-500 group-hover/button:text-white transition-colors" />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-red-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(invitation);
            }}
          >
            <RiDeleteBin6Line className="w-4 h-4 text-red-500 group-hover/button:text-white transition-colors" />
          </Button>
        )}

      </ItemActions>
    </Item>
  );
};

export default InvitationItem;