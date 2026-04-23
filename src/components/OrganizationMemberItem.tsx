import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
} from "@/components/ui/item";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

// Icons
import { FaUserAlt, FaUserShield } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";

type Member = {
  _id: string;
  name: string;
  email: string;
  organizationRole?: string;
  globalRole?: string;
  picture?: string;
};

type Props = {
  member: Member;
  onViewUser: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
  onChangeRole?: (userId: string) => void;
};

const OrganizationMemberItem = ({
  member,
  onViewUser,
  onRemoveUser,
  onChangeRole,
}: Props) => {
  // 🔹 Determinar rol (organization > global > fallback)
  const role = member.organizationRole ?? member.globalRole ?? "unknown";

  const normalizedRole = role.toLowerCase();

  const isAdmin = normalizedRole === "admin";
  const isSuperAdmin = normalizedRole === "super_admin";

  // 🔹 No se puede eliminar admin ni super admin
  const cannotBeRemoved = isAdmin || isSuperAdmin;

  // 🔹 Formatear rol (ej: super_admin → Super Admin)
  const formattedRole = role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Item variant="outline" className="gap-6">
      <ItemMedia>
        <Avatar>
          <AvatarImage src={member.picture} />
          <AvatarFallback>
            {member.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="flex flex-row items-center gap-6">
        <span className="min-w-[120px] text-[var(--text-h)]">
          {member.name}
        </span>

        <span className="w-[180px] truncate text-[var(--text-h)]">
          {member.email}
        </span>

        <span className="text-sm font-medium text-[var(--text-h)]">
          {formattedRole}
        </span>
      </ItemContent>

      <ItemActions className="flex gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onViewUser(member._id);
          }}
        >
          <FaUserAlt className="w-4 h-4 text-white group-hover/button:text-black transition-colors" />
        </Button>

        {onChangeRole && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onChangeRole(member._id);
            }}
          >
            <FaUserShield className="w-4 h-4 text-blue-500 group-hover/button:text-white transition-colors" />
          </Button>
        )}

        {!cannotBeRemoved && onRemoveUser && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveUser(member._id);
            }}
          >
            <GiExitDoor className="w-4 h-4 text-red-500 group-hover/button:text-white transition-colors" />
          </Button>
        )}
      </ItemActions>
    </Item>
  );
};

export default OrganizationMemberItem;