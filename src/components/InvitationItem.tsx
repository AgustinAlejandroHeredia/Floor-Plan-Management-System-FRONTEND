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

  const { t } = useTranslation([
      "items",
      "user"
  ])

  const role = invitation.userOrganizationRole
    .toLowerCase()
    .split("_")
    .map(
      word => word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

  const creationDate = new Date(
    invitation.creationDate,
  ).toLocaleString();

  const expirationDate = new Date(
    new Date(invitation.creationDate).getTime() +
      Number(invitation.duration) *
        60 *
        60 *
        1000,
  );

  const msLeft =
    expirationDate.getTime() - Date.now();

  const timeLeft =
    msLeft <= 0
      ? t('items:invitationItem.status.expired')
      : `${Math.floor(
          msLeft / (1000 * 60 * 60),
        )}h ${Math.floor(
          (msLeft % (1000 * 60 * 60)) /
            (1000 * 60),
        )}m`;

  return (
    <Item
      variant="outline"
      className="bg-[var(--accent-bg)] justify-between"
    >
      <ItemContent className="flex flex-col gap-2">

        <span className="font-medium text-[var(--text-h)]">
          {t("items:invitationItem.to")}: {invitation.userEmail}
        </span>

        <span className="text-[var(--text)]">
          {t("items:invitationItem.sentBy")}: {invitation.sentByUserName}
        </span>

        <span className="text-[var(--text)]">
          {t("items:invitationItem.organization")}: {invitation.organizationName}
        </span>

        <span className="text-[var(--text)]">
          {t("items:invitationItem.role")}: {t(`user:roles.${invitation.userOrganizationRole.toLocaleLowerCase()}`)}
        </span>

        <span className="text-[var(--text)]">
          {t("items:invitationItem.created")}: {creationDate}
        </span>

        <span className="text-[var(--text)]">
          {t("items:invitationItem.timeLeft")}: {timeLeft}
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