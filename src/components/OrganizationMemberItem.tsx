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
import { FaUserAlt } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";

type Member = {
  _id: string;
  name: string;
  email: string;
  organizationRole: string;
  picture?: string;
};

type Props = {
  member: Member;
  onViewUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
};

const OrganizationMemberItem = ({
  member,
  onViewUser,
  onRemoveUser,
}: Props) => {

  const isAdmin = member.organizationRole.toLowerCase() === "admin";

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
          {member.organizationRole}
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

        {!isAdmin && (
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